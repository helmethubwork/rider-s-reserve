import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const verifySignature = (rawBody: string, signature: string, secret: string): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
};

const istNow = () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

const BASE_URL =
  process.env.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com'
    : 'https://sandbox.cashfree.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars for webhook handler');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  console.log(`[${istNow()}] Webhook received`);

  // --- Signature verification (enforced in production only) ---
  const isTest = process.env.CASHFREE_ENV !== 'production';

  if (!isTest) {
    const signature = req.headers['x-webhook-signature'] as string | undefined;
    const timestamp = req.headers['x-webhook-timestamp'] as string | undefined;

    if (!signature || !timestamp) {
      console.warn(`[${istNow()}] Webhook missing signature or timestamp headers`);
      return res.status(401).json({ error: 'Missing signature' });
    }

    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const payload = timestamp + rawBody;

    if (!verifySignature(payload, signature, secretKey)) {
      console.warn(`[${istNow()}] Webhook signature verification failed`);
      return res.status(401).json({ error: 'Invalid signature' });
    }
  } else {
    console.log(`[${istNow()}] Skipping signature verification (test mode)`);
  }

  // --- Parse event ---
  let body: any;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (parseError) {
    console.error(`[${istNow()}] Failed to parse webhook payload`);
    return res.status(200).json({ received: true });
  }

  const eventType: string | undefined = body?.type;
  const orderData = body?.data?.order;
  const paymentData = body?.data?.payment;
  const cashfreePaymentStatus = String(paymentData?.payment_status ?? '').toUpperCase();

  if (!orderData?.order_id) {
    console.warn(`[${istNow()}] Webhook payload missing order data`);
    return res.status(200).json({ received: true });
  }

  const orderId: string = orderData.order_id;
  const cfPaymentId: string | null = paymentData?.cf_payment_id ?? null;
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

  // --- Update Supabase ---
  const customerDetails = body?.data?.customer_details ?? body?.data?.order?.customer_details ?? orderData?.customer_details ?? {};
  const customerName = customerDetails?.customer_name || 'Guest';
  const customerEmail = customerDetails?.customer_email || '';
  const customerPhone = customerDetails?.customer_phone || '';

  console.log(`[${istNow()}] Updating order ${orderId} to ${paymentStatus}`);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        customer_name: customerName,
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
      const sheetPayload = {
        order_id: orderId,
        customer_name: customerName,
        email: customerEmail,
        phone: customerPhone,
        amount: paymentAmount,
        payment_status: paymentStatus,
        timestamp: istNow(),
      };

      try {
        const sheetRes = await fetch(sheetWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sheetPayload),
        });
        console.log(`[${istNow()}] Sheets webhook: ${sheetRes.status}`);
      } catch (sheetErr) {
        console.error(`[${istNow()}] Sheets webhook failed (non-blocking)`);
      }
    }

    console.log(`[${istNow()}] Skipping immediate email — sent on dispatch`);
  }

  return res.status(200).json({ received: true });
}
