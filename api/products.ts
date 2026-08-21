/**
 * /api/products — Product catalog, backed by Cloudflare D1 (not Supabase).
 *
 * D1 only exposes a REST API reachable outside Cloudflare's own runtime, so
 * this function proxies every request to it using CLOUDFLARE_API_TOKEN /
 * CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_D1_DATABASE_ID (see Vercel env vars).
 *
 *   GET    → public. List products (with filters) or a single product by id.
 *   POST   → admin only. Create a product.
 *   PUT    → admin only. Full update of a product by id (?id=).
 *   PATCH  → admin only. Partial update, e.g. toggling is_active (?id=).
 *   DELETE → admin only. Permanently remove a product (?id=).
 *
 * Orders, profiles, and auth stay on Supabase — only the product catalog
 * lives here. Admin auth reuses the same Supabase-JWT + is_admin check as
 * the other admin-only endpoints (see upload-url.ts).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

interface D1Config {
  accountId: string;
  databaseId: string;
  apiToken: string;
}

function getD1Config(): D1Config | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !databaseId || !apiToken) return null;
  return { accountId, databaseId, apiToken };
}

async function d1Query(cfg: D1Config, sql: string, params: unknown[] = []): Promise<any[]> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${cfg.accountId}/d1/database/${cfg.databaseId}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  });

  const body = await res.json();
  if (!res.ok || !body.success) {
    const message = body?.errors?.[0]?.message || `D1 query failed with status ${res.status}`;
    throw new Error(message);
  }
  // D1's /query endpoint returns an array of statement results — one per ';'
  // We only ever send one statement per call, so use the first result set.
  return body.result?.[0]?.results ?? [];
}

// D1 (SQLite) has no native array/boolean type. Convert on the way out so the
// frontend gets exactly the shape it already expects from Supabase.
function rowToProduct(row: any) {
  return {
    ...row,
    is_active: !!row.is_active,
    is_featured: !!row.is_featured,
    is_on_sale: !!row.is_on_sale,
    sizes: safeJsonArray(row.sizes),
    colors: safeJsonArray(row.colors),
  };
}

function safeJsonArray(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function requireAdmin(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  const supabaseUrl        = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey    = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    res.status(500).json({ error: 'Server misconfigured' });
    return false;
  }

  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : null;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
  if (authError || !user) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
}

const PRODUCT_COLUMNS = `id, name, price, stock, image_url, is_active, created_at, updated_at,
  category, category_id, brand_id, sizes, colors, description, is_featured,
  is_on_sale, sale_price, sale_badge, display_order`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const d1 = getD1Config();
  if (!d1) {
    return res.status(500).json({ error: 'Product database not configured' });
  }

  try {
    // ---------------- GET: list or single ----------------
    if (req.method === 'GET') {
      const { id, category_id, brand_id, featured, on_sale, search, active, limit, order } = req.query;

      if (typeof id === 'string') {
        const rows = await d1Query(d1, `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ? LIMIT 1`, [id]);
        if (!rows.length) return res.status(404).json({ error: 'Product not found' });
        return res.status(200).json(rowToProduct(rows[0]));
      }

      const where: string[] = [];
      const params: unknown[] = [];

      // Public callers default to active-only; the admin panel passes active=all.
      if (active !== 'all') {
        where.push('is_active = 1');
      }
      if (typeof category_id === 'string') {
        where.push('category_id = ?');
        params.push(category_id);
      }
      if (typeof brand_id === 'string') {
        where.push('brand_id = ?');
        params.push(brand_id);
      }
      if (featured === 'true') {
        where.push('is_featured = 1');
      }
      if (on_sale === 'true') {
        where.push('is_on_sale = 1');
      }
      if (typeof search === 'string' && search.trim()) {
        where.push('(name LIKE ? OR description LIKE ?)');
        const like = `%${search.trim()}%`;
        params.push(like, like);
      }

      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const orderClause =
        order === 'display_order' ? 'ORDER BY display_order ASC' : 'ORDER BY created_at DESC';
      const limitClause = typeof limit === 'string' && Number.isFinite(Number(limit))
        ? `LIMIT ${Math.min(Number(limit), 200)}`
        : '';

      const sql = `SELECT ${PRODUCT_COLUMNS} FROM products ${whereClause} ${orderClause} ${limitClause}`.trim();
      const rows = await d1Query(d1, sql, params);
      return res.status(200).json(rows.map(rowToProduct));
    }

    // Every write operation requires admin auth
    const isAdmin = await requireAdmin(req, res);
    if (!isAdmin) return; // requireAdmin already sent the response

    // ---------------- POST: create ----------------
    if (req.method === 'POST') {
      const b = req.body ?? {};
      if (!b.name || typeof b.name !== 'string' || !b.name.trim()) {
        return res.status(400).json({ error: 'Product name is required' });
      }
      const price = Number(b.price);
      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ error: 'Valid price is required' });
      }

      const id = typeof b.id === 'string' && b.id ? b.id : crypto.randomUUID();
      const now = new Date().toISOString();

      await d1Query(
        d1,
        `INSERT INTO products (
          id, name, price, stock, image_url, is_active, created_at, updated_at,
          category, category_id, brand_id, sizes, colors, description,
          is_featured, is_on_sale, sale_price, sale_badge, display_order
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          id,
          b.name.trim(),
          price,
          Number.isFinite(Number(b.stock)) ? Number(b.stock) : 0,
          b.image_url || null,
          1,
          now,
          now,
          b.category || null,
          b.category_id || null,
          b.brand_id || null,
          JSON.stringify(Array.isArray(b.sizes) ? b.sizes : []),
          JSON.stringify(Array.isArray(b.colors) ? b.colors : []),
          b.description || null,
          b.is_featured ? 1 : 0,
          b.is_on_sale ? 1 : 0,
          Number.isFinite(Number(b.sale_price)) ? Number(b.sale_price) : null,
          b.sale_badge || null,
          Number.isFinite(Number(b.display_order)) ? Number(b.display_order) : 0,
        ]
      );

      const rows = await d1Query(d1, `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`, [id]);
      return res.status(201).json(rowToProduct(rows[0]));
    }

    // PUT / PATCH / DELETE all require an id
    const id = typeof req.query.id === 'string' ? req.query.id : null;
    if (!id) return res.status(400).json({ error: 'Missing product id' });

    // ---------------- DELETE ----------------
    if (req.method === 'DELETE') {
      await d1Query(d1, `DELETE FROM products WHERE id = ?`, [id]);
      return res.status(200).json({ success: true });
    }

    // ---------------- PUT: full update ----------------
    if (req.method === 'PUT') {
      const b = req.body ?? {};
      if (!b.name || typeof b.name !== 'string' || !b.name.trim()) {
        return res.status(400).json({ error: 'Product name is required' });
      }
      const price = Number(b.price);
      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ error: 'Valid price is required' });
      }

      await d1Query(
        d1,
        `UPDATE products SET
          name = ?, price = ?, stock = ?, image_url = ?, updated_at = ?,
          category = ?, category_id = ?, brand_id = ?, sizes = ?, colors = ?,
          description = ?, is_featured = ?, is_on_sale = ?, sale_price = ?,
          sale_badge = ?, display_order = ?
        WHERE id = ?`,
        [
          b.name.trim(),
          price,
          Number.isFinite(Number(b.stock)) ? Number(b.stock) : 0,
          b.image_url || null,
          new Date().toISOString(),
          b.category || null,
          b.category_id || null,
          b.brand_id || null,
          JSON.stringify(Array.isArray(b.sizes) ? b.sizes : []),
          JSON.stringify(Array.isArray(b.colors) ? b.colors : []),
          b.description || null,
          b.is_featured ? 1 : 0,
          b.is_on_sale ? 1 : 0,
          Number.isFinite(Number(b.sale_price)) ? Number(b.sale_price) : null,
          b.sale_badge || null,
          Number.isFinite(Number(b.display_order)) ? Number(b.display_order) : 0,
          id,
        ]
      );

      const rows = await d1Query(d1, `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`, [id]);
      if (!rows.length) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json(rowToProduct(rows[0]));
    }

    // ---------------- PATCH: partial update (e.g. toggle is_active) ----------------
    if (req.method === 'PATCH') {
      const b = req.body ?? {};
      const sets: string[] = [];
      const params: unknown[] = [];

      if (typeof b.is_active === 'boolean') {
        sets.push('is_active = ?');
        params.push(b.is_active ? 1 : 0);
      }
      if (typeof b.image_url === 'string' || b.image_url === null) {
        sets.push('image_url = ?');
        params.push(b.image_url);
      }
      if (!sets.length) {
        return res.status(400).json({ error: 'No recognized fields to update' });
      }

      sets.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);

      await d1Query(d1, `UPDATE products SET ${sets.join(', ')} WHERE id = ?`, params);
      const rows = await d1Query(d1, `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`, [id]);
      if (!rows.length) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json(rowToProduct(rows[0]));
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[api/products] Failed:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
