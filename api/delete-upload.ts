/**
 * POST /api/delete-upload
 *
 * Removes an object from Cloudflare R2. Admin only.
 * Deleting is best-effort — a stale file costs nothing, so failures are logged
 * rather than surfaced to the admin mid-edit.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getR2Config, getR2PublicUrl, deleteR2Object } from './_r2';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const r2 = getR2Config();
  const publicUrl = getR2PublicUrl();

  if (!r2 || !publicUrl) {
    return res.status(501).json({ error: 'R2 not configured' });
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

  // --- Derive the object key, refusing anything outside our own bucket URL ---
  const { url } = req.body ?? {};
  const base = publicUrl.replace(/\/$/, '');

  if (typeof url !== 'string' || !url.startsWith(base)) {
    return res.status(400).json({ error: 'URL does not belong to this bucket' });
  }

  const key = url.slice(base.length + 1).split('?')[0];
  if (!key || key.includes('..')) {
    return res.status(400).json({ error: 'Invalid object key' });
  }

  try {
    await deleteR2Object(r2, key);
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('R2 delete failed:', err);
    return res.status(500).json({ error: 'Delete failed' });
  }
}
