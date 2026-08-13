/**
 * POST /api/track-order
 *
 * Guest order tracking. Requires BOTH the order number and the email address
 * used at checkout, so knowing a sequential order number alone is not enough.
 *
 * This exists so the `orders` table can stay locked down at the database level.
 * Previously the browser queried Supabase directly with the public anon key,
 * which meant the table had to allow anonymous SELECT — and order numbers are
 * sequential, so anyone could have walked HH-01001, HH-01002 … and harvested
 * customer names, phones and addresses.
 *
 * Only non-sensitive status fields are returned. Never name, phone or address.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const istNow = () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

// Simple in-memory throttle. Resets when the serverless instance recycles,
// which is fine — it exists to blunt scripted guessing, not to be a full WAF.
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 12;

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const rec = attempts.get(ip);

  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl        = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('track-order: missing env vars');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (isRateLimited(ip)) {
    console.warn(`[${istNow()}] track-order rate limit hit for ${ip}`);
    return res.status(429).json({ error: 'Too many attempts. Please try again in a few minutes.' });
  }

  const { order_number, email } = req.body ?? {};

  if (
    typeof order_number !== 'string' || order_number.trim().length === 0 || order_number.length > 60 ||
    typeof email !== 'string' || email.trim().length === 0 || email.length > 255
  ) {
    return res.status(400).json({ error: 'Order number and email are both required' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Both values must match. Only status columns are selected — no PII leaves here.
  const { data: order, error } = await supabase
    .from('orders')
    .select('order_number, order_status, payment_status, tracking_id, courier_name, shipped_at, total_amount, created_at')
    .eq('order_number', order_number.trim().toUpperCase())
    .eq('customer_email', email.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    console.error(`[${istNow()}] track-order query failed:`, error);
    return res.status(500).json({ error: 'Could not look up that order' });
  }

  if (!order) {
    // Deliberately vague: does not reveal whether the order number exists
    return res.status(404).json({ error: 'No order found with that number and email address' });
  }

  return res.status(200).json({ order });
}
