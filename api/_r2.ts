/**
 * Minimal AWS Signature V4 helpers for Cloudflare R2.
 *
 * Written against Node's built-in crypto rather than pulling in @aws-sdk, which
 * would add ~15 MB to every function and require a lockfile update. R2 only
 * needs presigned PUT and a plain DELETE, so the full SDK is not worth it.
 */

import crypto from 'crypto';

const SERVICE = 's3';
const REGION = 'auto';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

/** Reads R2 settings from the environment; null when not configured. */
export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

export function getR2PublicUrl(): string | null {
  return process.env.R2_PUBLIC_URL || process.env.VITE_R2_PUBLIC_URL || null;
}

const sha256Hex = (data: string) =>
  crypto.createHash('sha256').update(data, 'utf8').digest('hex');

const hmac = (key: crypto.BinaryLike | Buffer, data: string) =>
  crypto.createHmac('sha256', key).update(data, 'utf8').digest();

/** Percent-encode per RFC 3986, keeping "/" intact for object keys. */
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

/**
 * Build a presigned URL the browser can use directly.
 *
 * @param method     HTTP verb the URL is valid for
 * @param key        Object key inside the bucket
 * @param expiresIn  Seconds the URL stays valid
 */
export function presignR2Url(
  cfg: R2Config,
  method: 'PUT' | 'GET' | 'DELETE',
  key: string,
  expiresIn = 300
): string {
  const host = `${cfg.accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${cfg.bucket}/${encodeKey(key)}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ''); // 20260819T101500Z
  const dateStamp = amzDate.slice(0, 8);

  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;

  // Query parameters must be sorted for the canonical request
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

  // UNSIGNED-PAYLOAD lets the browser send the file without pre-hashing it
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

/** Delete an object using a short-lived presigned DELETE URL. */
export async function deleteR2Object(cfg: R2Config, key: string): Promise<boolean> {
  const url = presignR2Url(cfg, 'DELETE', key, 60);
  const res = await fetch(url, { method: 'DELETE' });
  // S3 returns 204 on success, and 404 when it was already gone
  return res.ok || res.status === 404;
}
