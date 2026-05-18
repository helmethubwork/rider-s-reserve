import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Disable Vercel's body parser so we receive the raw bytes Cashfree signed (C2)
export const config = { api: { bodyParser: false } };

const readRawBody = (req: VercelRequest): Promise<string> =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const verifySignature = (payload: string, signature: string, secret: string): boolean => {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  // Lengths must match before timingSafeEqual or it throws
  if (sigBuf.length !== expBuf.length) return false;
  try {
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
};

// Reject webhooks whose timestamp deviates more than 5 minutes from now (C3)
const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000;

const istNow = () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

// PII validators — applied before any DB write (M1)
const isValidEmail = (v: string) => /^[^\s@]{1,64}@[^\s@]{1,255}$/.test(v);
const isValidPhone = (v: string) => /^[0-9]{10}$/.test(v);
const sanitizeName  = (v: string) => v.slice(0, 200).replace(/[<>"'&]/g, '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey         = process.env.CASHFREE_SECRET_KEY;
  const supabaseUrl       = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars for webhook handler');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // Read raw body before any JSON parsing (C2)
  let rawBody: string;
  try {
    rawBody = await readRawBody(req);
  } catch {
    return res.status(400).json({ error: 'Failed to read request body' });
  }

  console.log(`[${istNow()}] Webhook received`);

  // --- Signature verification (C1, C2, C3) ---
  // Set WEBHOOK_SKIP_SIGNATURE=true only for local development.
  // The Cashfree sandbox sends properly signed webhooks, so this is not needed in test mode.
  const skipSignature = process.env.WEBHOOK_SKIP_SIGNATURE === 'true';

  if (skipSignature) {
    console.warn(`[${istNow()}] ⚠ Signature verification DISABLED via WEBHOOK_SKIP_SIGNATURE — never set in production`);
  } else {
    const signature = req.headers['x-webhook-signature'] as string | undefined;
    const timestamp  = req.headers['x-webhook-timestamp']  as string | undefined;

    if (!signature || !timestamp) {
      console.warn(`[${istNow()}] Webhook missing signature or timestamp headers`);
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Replay-attack guard: reject if timestamp is outside 5-minute window (C3)
    const tsMs  = Number(timestamp) * 1000;
    const ageMs = Math.abs(Date.now() - tsMs);
    if (isNaN(tsMs) || ageMs > TIMESTAMP_TOLERANCE_MS) {
      console.warn(`[${istNow()}] Webhook timestamp out of tolerance (age: ${ageMs}ms)`);
      return res.status(401).json({ error: 'Request too old or timestamp invalid' });
    }

    // HMAC over raw bytes, not re-serialised parsed JSON (C2)
    if (!verifySignature(timestamp + rawBody, signature, secretKey)) {
      console.warn(`[${istNow()}] Webhook signature verification failed`);
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  // --- Parse event ---
  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    console.error(`[${istNow()}] Failed to parse webhook payload`);
    return res.status(200).json({ received: true });
  }

  const eventType: string | undefined = body?.type;
  const orderData  = body?.data?.order;
  const paymentData = body?.data?.payment;
  const cashfreePaymentStatus = String(paymentData?.payment_status ?? '').toUpperCase();

  if (!orderData?.order_id) {
    console.warn(`[${istNow()}] Webhook payload missing order data`);
    return res.status(200).json({ received: true });
  }

  const orderId: string       = orderData.order_id;
  const paymentAmount: number | null = paymentData?.payment_amount ?? orderData.order_amount ?? null;

  console.log(`[${istNow()}] Event: ${eventType ?? 'unknown'} for order ${orderId}`);

  // --- Determine new status ---
  let paymentStatus: string | null = null;

  if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || cashfreePaymentStatus === 'SUCCESS') {
    paymentStatus = 'paid';
  } else if (eventType === 'PAYMENT_FAILED_WEBHOOK' || cashfreePaymentStatus === 'FAILED') {
    paymentStatus = 'failed';
  } else {
    console.log(`[${istNow()}] Ignoring unhandled event type: ${eventType}`);
    return res.status(200).json({ received: true });
  }

  // --- Validate and sanitize PII before writing to DB (M1) ---
  const customerDetails = body?.data?.customer_details ?? orderData?.customer_details ?? {};
  const rawName  = String(customerDetails?.customer_name  || '').trim();
  const rawEmail = String(customerDetails?.customer_email || '').trim();
  const rawPhone = String(customerDetails?.customer_phone || '').trim();

  const customerName  = sanitizeName(rawName) || 'Guest';
  const customerEmail = isValidEmail(rawEmail) ? rawEmail : '';
  const customerPhone = isValidPhone(rawPhone) ? rawPhone : '';

  if (rawEmail && !customerEmail) {
    console.warn(`[${istNow()}] Dropping invalid customer_email from webhook payload`);
  }
  if (rawPhone && !customerPhone) {
    console.warn(`[${istNow()}] Dropping invalid customer_phone from webhook payload`);
  }

  console.log(`[${istNow()}] Updating order ${orderId} to ${paymentStatus}`);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        customer_name:  customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      })
      .eq('order_number', orderId);

    if (error) {
      console.error(`[${istNow()}] Supabase update error:`, error);
    } else {
      console.log(`[${istNow()}] Order ${orderId} updated`);
    }
  } catch (err) {
    console.error(`[${istNow()}] Error during Supabase update:`, err);
  }

  // --- Forward successful payments to Google Sheets ---
  if (paymentStatus === 'paid') {
    const sheetWebhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (sheetWebhookUrl) {
      try {
        const sheetPayload = JSON.stringify({
          order_id:       orderId,
          customer_name:  customerName,
          email:          customerEmail,
          phone:          customerPhone,
          amount:         paymentAmount,
          payment_status: paymentStatus,
          timestamp:      istNow(),
        });
        // GAS returns 302; Node fetch converts POST→GET on redirect (body lost).
        // Intercept with redirect:'manual' and replay the POST to the redirect target.
        const initRes = await fetch(sheetWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: sheetPayload,
          redirect: 'manual',
        });
        let sheetStatus: number;
        let sheetBody: string;
        if (initRes.status >= 300 && initRes.status < 400) {
          const location = initRes.headers.get('location');
          if (location) {
            const followed = await fetch(location, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: sheetPayload,
            });
            sheetStatus = followed.status;
            sheetBody = await followed.text();
          } else {
            sheetStatus = initRes.status;
            sheetBody = '(redirect with no location header)';
          }
        } else {
          sheetStatus = initRes.status;
          sheetBody = await initRes.text();
        }
        console.log(`[${istNow()}] Sheets webhook: HTTP ${sheetStatus} — ${sheetBody.slice(0, 200)}`);
      } catch {
        console.error(`[${istNow()}] Sheets webhook failed`);
      }
    }

    console.log(`[${istNow()}] Skipping immediate email — sent on dispatch`);
  }

  return res.status(200).json({ received: true });
}
