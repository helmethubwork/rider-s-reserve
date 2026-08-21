/**
 * /api/upload-url — Cloudflare R2 image handling
 *
 *   POST   → returns a short-lived presigned PUT URL so the browser uploads
 *            straight to R2. The file never passes through this function, so
 *            there is no 4.5 MB body limit and no Vercel bandwidth cost.
 *   DELETE → removes an object from the bucket.
 *
 * Both live in one file because Vercel's Hobby plan allows a maximum of 12
 * serverless functions per deployment, and splitting these across two files
 * pushed the project over that limit.
 *
 * The AWS SigV4 helpers below used to live in a sibling `_r2.ts` module, but
 * Vercel excludes underscore-prefixed files from the deployed function bundle
 * entirely (not just from becoming their own route), which crashed every
 * request with ERR_MODULE_NOT_FOUND. Everything is inlined here instead so
 * there is no separate module to go missing.
 *
 * Admin only. R2 credentials never reach the browser.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SERVICE = 's3';
const REGION = 'auto';

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

function getR2PublicUrl(): string | null {
  return process.env.R2_PUBLIC_URL || process.env.VITE_R2_PUBLIC_URL || null;
}

const sha256Hex = (data: string) =>
  crypto.createHash('sha256').update(data, 'utf8').digest('hex');

const hmac = (key: crypto.BinaryLike | Buffer, data: string) =>
  crypto.createHmac('sha256', key).update(data, 'utf8').digest();

const encodeKey = (key: string) =>
  key
    .split('/')
    .map((segment) => encodeURIComponent(segment).replace(/[!'()*]/g,
      (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()))
    .join('/');

function signingKey(secret: string, date: string): Buffer {
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, 'aws4_request');
}

function presignR2Url(
  cfg: R2Config,
  method: 'PUT' | 'GET' | 'DELETE',
  key: string,
  expiresIn = 300
): string {
  const host = `${cfg.accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${cfg.bucket}/${encodeKey(key)}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;

  const params: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${cfg.accessKeyId}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expiresIn),
    'X-Amz-SignedHeaders': 'host',
  };

  const canonicalQuery = Object.keys(params)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');

  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = 'host';

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const signature = crypto
    .createHmac('sha256', signingKey(cfg.secretAccessKey, dateStamp))
    .update(stringToSign, 'utf8')
    .digest('hex');

  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

async function deleteR2Object(cfg: R2Config, key: string): Promise<boolean> {
  const url = presignR2Url(cfg, 'DELETE', key, 60);
  const res = await fetch(url, { method: 'DELETE' });
  return res.ok || res.status === 404;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const ALLOWED_FOLDERS = ['products', 'categories', 'brands', 'collections', 'hero', 'promos'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
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

  // ---------------- DELETE ----------------
  if (req.method === 'DELETE') {
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

  // ---------------- POST: presign an upload ----------------
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
