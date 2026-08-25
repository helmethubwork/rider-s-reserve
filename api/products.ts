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
    image_urls: safeJsonArray(row.image_urls),
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

const PRODUCT_COLUMNS = `id, name, price, stock, image_url, image_urls, is_active, created_at, updated_at,
  category, category_id, brand_id, sizes, colors, description, is_featured,
  is_on_sale, sale_price, sale_badge, display_order`;

/**
 * Generic content-table router — reuses this same function/lambda (instead of a
 * new api/*.ts file) so we stay under Vercel Hobby's 12-function cap. Covers all
 * the non-auth content tables that moved from Supabase to D1: brands, categories,
 * hero_slides, featured_promos, site_settings, store_locations, instagram_reels,
 * blog_posts, faqs, navigation_links, content_pages, collections, and the
 * product_collections junction table. Reached via /api/products?table=<name>.
 */
interface TableSchema {
  columns: string[];
  boolCols: string[];
  orderBy: string;
}

const TABLE_SCHEMAS: Record<string, TableSchema> = {
  brands: {
    columns: ['id', 'name', 'slug', 'logo_url', 'description', 'is_featured', 'is_active', 'display_order', 'created_at'],
    boolCols: ['is_featured', 'is_active'],
    orderBy: 'display_order ASC',
  },
  categories: {
    columns: ['id', 'name', 'slug', 'subtitle', 'image_url', 'href', 'is_large', 'display_order', 'is_active', 'created_at'],
    boolCols: ['is_large', 'is_active'],
    orderBy: 'display_order ASC',
  },
  hero_slides: {
    columns: ['id', 'subtitle', 'title', 'description', 'button_text', 'button_link', 'image_url', 'align', 'display_order', 'is_active', 'created_at'],
    boolCols: ['is_active'],
    orderBy: 'display_order ASC',
  },
  featured_promos: {
    columns: ['id', 'brand', 'title', 'subtitle', 'button_text', 'button_link', 'image_url', 'accent', 'display_order', 'is_active', 'created_at'],
    boolCols: ['is_active'],
    orderBy: 'display_order ASC',
  },
  site_settings: {
    columns: ['id', 'setting_key', 'setting_value', 'category', 'label', 'description', 'display_order', 'updated_at'],
    boolCols: [],
    orderBy: 'category ASC, display_order ASC',
  },
  store_locations: {
    columns: ['id', 'branch_name', 'address', 'city', 'state', 'phone', 'timing', 'map_url', 'is_primary', 'is_active', 'display_order', 'created_at'],
    boolCols: ['is_primary', 'is_active'],
    orderBy: 'display_order ASC',
  },
  instagram_reels: {
    columns: ['id', 'reel_url', 'title', 'is_active', 'display_order', 'created_at'],
    boolCols: ['is_active'],
    orderBy: 'display_order ASC',
  },
  blog_posts: {
    columns: ['id', 'slug', 'title', 'excerpt', 'content', 'image_url', 'category', 'is_published', 'display_order', 'created_at', 'updated_at'],
    boolCols: ['is_published'],
    orderBy: 'display_order ASC',
  },
  faqs: {
    columns: ['id', 'question', 'answer', 'is_active', 'display_order', 'created_at'],
    boolCols: ['is_active'],
    orderBy: 'display_order ASC',
  },
  navigation_links: {
    columns: ['id', 'name', 'description', 'href', 'icon', 'category', 'is_active', 'display_order', 'created_at'],
    boolCols: ['is_active'],
    orderBy: 'display_order ASC',
  },
  content_pages: {
    columns: ['id', 'slug', 'title', 'content', 'meta_description', 'is_published', 'created_at', 'updated_at'],
    boolCols: ['is_published'],
    orderBy: 'title ASC',
  },
  collections: {
    columns: ['id', 'name', 'slug', 'image_url', 'display_order', 'is_active', 'created_at', 'updated_at'],
    boolCols: ['is_active'],
    orderBy: 'display_order ASC',
  },
};

function rowToContent(row: any, schema: TableSchema) {
  const out: any = { ...row };
  for (const col of schema.boolCols) out[col] = !!row[col];
  return out;
}

async function handleContentTable(req: VercelRequest, res: VercelResponse, d1: D1Config, table: string) {
  // ---------------- product_collections: composite key junction table (not in TABLE_SCHEMAS) ----------------
  if (table === 'product_collections') {
    if (req.method === 'GET') {
      const { product_id, collection_id } = req.query;
      if (typeof product_id === 'string') {
        const rows = await d1Query(d1, `SELECT collection_id FROM product_collections WHERE product_id = ?`, [product_id]);
        return res.status(200).json(rows.map((r) => r.collection_id));
      }
      if (typeof collection_id === 'string') {
        const rows = await d1Query(d1, `SELECT product_id FROM product_collections WHERE collection_id = ?`, [collection_id]);
        return res.status(200).json(rows.map((r) => r.product_id));
      }
      const rows = await d1Query(d1, `SELECT product_id, collection_id FROM product_collections`);
      return res.status(200).json(rows);
    }
    const isAdminPC = await requireAdmin(req, res);
    if (!isAdminPC) return;
    if (req.method === 'POST') {
      const b = req.body ?? {};
      if (!b.product_id || !b.collection_id) {
        return res.status(400).json({ error: 'product_id and collection_id are required' });
      }
      await d1Query(
        d1,
        `INSERT OR IGNORE INTO product_collections (product_id, collection_id, created_at) VALUES (?,?,?)`,
        [b.product_id, b.collection_id, new Date().toISOString()]
      );
      return res.status(201).json({ success: true });
    }
    if (req.method === 'DELETE') {
      const { product_id, collection_id } = req.query;
      if (typeof product_id !== 'string') return res.status(400).json({ error: 'Missing product_id' });
      if (typeof collection_id === 'string') {
        await d1Query(d1, `DELETE FROM product_collections WHERE product_id = ? AND collection_id = ?`, [product_id, collection_id]);
      } else {
        await d1Query(d1, `DELETE FROM product_collections WHERE product_id = ?`, [product_id]);
      }
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const schema = TABLE_SCHEMAS[table];
  if (!schema) return res.status(400).json({ error: `Unknown table: ${table}` });
  const cols = schema.columns.join(', ');

  // ---------------- site_settings: keyed by setting_key, not id ----------------
  if (table === 'site_settings') {
    if (req.method === 'GET') {
      const { key } = req.query;
      if (typeof key === 'string') {
        const rows = await d1Query(d1, `SELECT ${cols} FROM site_settings WHERE setting_key = ? LIMIT 1`, [key]);
        if (!rows.length) return res.status(404).json({ error: 'Setting not found' });
        return res.status(200).json(rowToContent(rows[0], schema));
      }
      const rows = await d1Query(d1, `SELECT ${cols} FROM site_settings ORDER BY ${schema.orderBy}`);
      return res.status(200).json(rows.map((r) => rowToContent(r, schema)));
    }
    const isAdmin = await requireAdmin(req, res);
    if (!isAdmin) return;
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { key } = req.query;
      const b = req.body ?? {};
      if (typeof key !== 'string') return res.status(400).json({ error: 'Missing setting key' });
      await d1Query(d1, `UPDATE site_settings SET setting_value = ?, updated_at = ? WHERE setting_key = ?`, [
        b.setting_value ?? null,
        new Date().toISOString(),
        key,
      ]);
      const rows = await d1Query(d1, `SELECT ${cols} FROM site_settings WHERE setting_key = ?`, [key]);
      if (!rows.length) return res.status(404).json({ error: 'Setting not found' });
      return res.status(200).json(rowToContent(rows[0], schema));
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ---------------- everything else: standard id-keyed table ----------------
  if (req.method === 'GET') {
    const { id, slug, active } = req.query;
    if (typeof id === 'string') {
      const rows = await d1Query(d1, `SELECT ${cols} FROM ${table} WHERE id = ? LIMIT 1`, [id]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(rowToContent(rows[0], schema));
    }
    if (typeof slug === 'string' && schema.columns.includes('slug')) {
      const rows = await d1Query(d1, `SELECT ${cols} FROM ${table} WHERE slug = ? LIMIT 1`, [slug]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(rowToContent(rows[0], schema));
    }
    const where = active !== 'all' && schema.columns.includes('is_active') ? 'WHERE is_active = 1' : '';
    const rows = await d1Query(d1, `SELECT ${cols} FROM ${table} ${where} ORDER BY ${schema.orderBy}`);
    return res.status(200).json(rows.map((r) => rowToContent(r, schema)));
  }

  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;

  if (req.method === 'POST') {
    const b = req.body ?? {};
    const id = typeof b.id === 'string' && b.id ? b.id : crypto.randomUUID();
    const writable = schema.columns.filter((c) => c !== 'created_at' && c !== 'updated_at');
    const values = writable.map((c) => {
      if (c === 'id') return id;
      if (schema.boolCols.includes(c)) return b[c] ? 1 : 0;
      const v = b[c];
      return v === undefined ? null : v;
    });
    const now = new Date().toISOString();
    const insertCols = [...writable];
    const insertVals = [...values];
    if (schema.columns.includes('created_at')) { insertCols.push('created_at'); insertVals.push(now); }
    if (schema.columns.includes('updated_at')) { insertCols.push('updated_at'); insertVals.push(now); }
    const placeholders = insertCols.map(() => '?').join(',');
    await d1Query(d1, `INSERT INTO ${table} (${insertCols.join(',')}) VALUES (${placeholders})`, insertVals);
    const rows = await d1Query(d1, `SELECT ${cols} FROM ${table} WHERE id = ?`, [id]);
    return res.status(201).json(rowToContent(rows[0], schema));
  }

  const id = typeof req.query.id === 'string' ? req.query.id : null;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  if (req.method === 'DELETE') {
    await d1Query(d1, `DELETE FROM ${table} WHERE id = ?`, [id]);
    return res.status(200).json({ success: true });
  }

  if (req.method === 'PUT') {
    const b = req.body ?? {};
    const writable = schema.columns.filter((c) => c !== 'id' && c !== 'created_at' && c !== 'updated_at');
    const sets = writable.map((c) => `${c} = ?`);
    const values = writable.map((c) => {
      if (schema.boolCols.includes(c)) return b[c] ? 1 : 0;
      const v = b[c];
      return v === undefined ? null : v;
    });
    if (schema.columns.includes('updated_at')) { sets.push('updated_at = ?'); values.push(new Date().toISOString()); }
    values.push(id);
    await d1Query(d1, `UPDATE ${table} SET ${sets.join(', ')} WHERE id = ?`, values);
    const rows = await d1Query(d1, `SELECT ${cols} FROM ${table} WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(rowToContent(rows[0], schema));
  }

  if (req.method === 'PATCH') {
    const b = req.body ?? {};
    const sets: string[] = [];
    const values: unknown[] = [];
    for (const c of schema.columns) {
      if (c === 'id' || c === 'created_at' || !(c in b)) continue;
      sets.push(`${c} = ?`);
      values.push(schema.boolCols.includes(c) ? (b[c] ? 1 : 0) : b[c]);
    }
    if (!sets.length) return res.status(400).json({ error: 'No recognized fields to update' });
    if (schema.columns.includes('updated_at')) { sets.push('updated_at = ?'); values.push(new Date().toISOString()); }
    values.push(id);
    await d1Query(d1, `UPDATE ${table} SET ${sets.join(', ')} WHERE id = ?`, values);
    const rows = await d1Query(d1, `SELECT ${cols} FROM ${table} WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(rowToContent(rows[0], schema));
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const d1 = getD1Config();
  if (!d1) {
    return res.status(500).json({ error: 'Product database not configured' });
  }

  const { table } = req.query;
  if (typeof table === 'string') {
    try {
      return await handleContentTable(req, res, d1, table);
    } catch (err: any) {
      console.error('[api/products:content]', table, err?.message || err);
      return res.status(500).json({ error: err?.message || 'Internal server error' });
    }
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
          id, name, price, stock, image_url, image_urls, is_active, created_at, updated_at,
          category, category_id, brand_id, sizes, colors, description,
          is_featured, is_on_sale, sale_price, sale_badge, display_order
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          id,
          b.name.trim(),
          price,
          Number.isFinite(Number(b.stock)) ? Number(b.stock) : 0,
          b.image_url || null,
          JSON.stringify(Array.isArray(b.image_urls) ? b.image_urls : []),
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
    // Removes the product row, any product_collections links pointing at it
    // (that table has no id column and was never covered by ON DELETE CASCADE
    // in SQLite), and hands back every image URL that belonged to this product
    // so the caller can clean those up from R2/Supabase Storage too — deleting
    // a product previously left orphaned images and orphaned junction rows.
    if (req.method === 'DELETE') {
      const existing = await d1Query(
        d1,
        `SELECT image_url, image_urls FROM products WHERE id = ?`,
        [id]
      );
      if (!existing.length) return res.status(404).json({ error: 'Product not found' });

      const urls = new Set<string>();
      if (existing[0].image_url) urls.add(String(existing[0].image_url));
      for (const u of safeJsonArray(existing[0].image_urls)) urls.add(u);

      await d1Query(d1, `DELETE FROM product_collections WHERE product_id = ?`, [id]);
      await d1Query(d1, `DELETE FROM products WHERE id = ?`, [id]);

      return res.status(200).json({ success: true, image_urls: Array.from(urls) });
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
          name = ?, price = ?, stock = ?, image_url = ?, image_urls = ?, updated_at = ?,
          category = ?, category_id = ?, brand_id = ?, sizes = ?, colors = ?,
          description = ?, is_featured = ?, is_on_sale = ?, sale_price = ?,
          sale_badge = ?, display_order = ?
        WHERE id = ?`,
        [
          b.name.trim(),
          price,
          Number.isFinite(Number(b.stock)) ? Number(b.stock) : 0,
          b.image_url || null,
          JSON.stringify(Array.isArray(b.image_urls) ? b.image_urls : []),
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
      if (Array.isArray(b.image_urls)) {
        sets.push('image_urls = ?');
        params.push(JSON.stringify(b.image_urls));
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
