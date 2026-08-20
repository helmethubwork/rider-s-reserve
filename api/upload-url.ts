/**
 * POST /api/upload-url
 *
 * Returns a short-lived presigned PUT URL so the browser can upload an image
 * straight to Cloudflare R2. The file never passes through this function, so
 * there is no 4.5 MB body limit and no Vercel bandwidth cost.
 *
 * Admin only. R2 credentials never reach the browser.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getR2Config, getR2PublicUrl, presignR2Url } from './_r2';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const ALLOWED_FOLDERS = ['products', 'categories', 'brands', 'collections', 'hero', 'promos'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const r2 = getR2Config();
  const publicUrl = getR2PublicUrl();

  // Not configured yet — the caller falls back to Supabase Storage
  if (!r2 || !publicUrl) {
    return res.status(501).json({ error: 'R2 not configured', fallback: true });
  }

  const supabaseUrl        = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey    = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // --- Admin authentication ---
  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) return res.status(403).json({ error: 'Forbidden' });

  // --- Validate the request ---
  const { folder, filename, contentType, size } = req.body ?? {};

  if (!ALLOWED_FOLDERS.includes(String(folder))) {
    return res.status(400).json({ error: 'Invalid folder' });
  }
  if (!ALLOWED_TYPES.includes(String(contentType))) {
    return res.status(400).json({ error: 'Only JPEG, PNG, WebP, GIF and AVIF images are allowed' });
  }
  if (typeof size === 'number' && size > MAX_BYTES) {
    return res.status(400).json({ error: 'Image must be under 10 MB' });
  }

  // Strip any path characters so a filename can't escape its folder
  const safeName = String(filename || 'image')
    .split('/').pop()!
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .slice(-80);

  const key = `${folder}/${safeName}`;

  try {
    // Valid for 5 minutes — long enough to upload, short enough to be safe
    const uploadUrl = presignR2Url(r2, 'PUT', key, 300);

    return res.status(200).json({
      uploadUrl,
      publicUrl: `${publicUrl.replace(/\/$/, '')}/${key}`,
      key,
    });
  } catch (err: any) {
    console.error('Failed to sign R2 upload URL:', err);
    return res.status(500).json({ error: 'Could not prepare upload' });
  }
}
