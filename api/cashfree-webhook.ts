import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * Cashfree Webhook Handler
 *
 * Verifies the webhook signature, then updates the order's payment_status
 * in Supabase based on the event type.
 *
 * Required env vars:
 *   CASHFREE_SECRET_KEY   – used to verify x-webhook-signature
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  – service role to bypass RLS
 */

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

  // --- Signature verification ---
  const isTest = process.env.NODE_ENV !== 'production';

  if (!isTest) {
    const signature = req.headers['x-webhook-signature'] as string | undefined;
    const timestamp = req.headers['x-webhook-timestamp'] as string | undefined;

    if (!signature || !timestamp) {
      console.warn('Webhook missing signature or timestamp headers');
      return res.status(401).json({ error: 'Missing signature' });
    }

    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const payload = timestamp + rawBody;

    try {
      if (!verifySignature(payload, signature, secretKey)) {
        console.warn('Webhook signature verification failed');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch {
      console.warn('Webhook signature comparison error');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  } else {
    console.log('Skipping Cashfree signature verification in test mode');
  }

  // --- Parse event ---
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const eventType: string = body?.type;
  const orderData = body?.data?.order;
  const paymentData = body?.data?.payment;

  if (!eventType || !orderData) {
    console.warn('Webhook payload missing type or order data:', JSON.stringify(body));
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const orderId: string = orderData.order_id;         // matches our order_number
  const cfPaymentId: string | null = paymentData?.cf_payment_id ?? null;
  const paymentAmount: number | null = paymentData?.payment_amount ?? orderData.order_amount ?? null;

  console.log(`Webhook received: ${eventType} for order ${orderId}`);

  // --- Determine new status ---
  let paymentStatus: string | null = null;

  if (eventType === 'PAYMENT_SUCCESS_WEBHOOK') {
    console.log('Payment success received');
    paymentStatus = 'paid';
  } else if (eventType === 'PAYMENT_FAILED_WEBHOOK') {
    paymentStatus = 'failed';
  } else {
    // Acknowledge unknown events without processing
    console.log(`Ignoring unhandled event type: ${eventType}`);
    return res.status(200).json({ ok: true });
  }

  // --- Update Supabase ---
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: paymentStatus,
      ...(cfPaymentId ? { cf_payment_id: cfPaymentId } : {}),
    })
    .eq('order_number', orderId);

  if (error) {
    console.error('Supabase update error:', error);
    return res.status(500).json({ error: 'Database update failed' });
  }

  console.log(`Order ${orderId} updated to payment_status=${paymentStatus}`);

  // --- Forward successful payments to Google Sheets ---
  if (paymentStatus === 'paid') {
    const sheetWebhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (sheetWebhookUrl) {
      const customerDetails = body?.data?.customer_details ?? orderData?.customer_details ?? {};
      const sheetPayload = {
        order_id: orderId,
        customer_name: customerDetails?.customer_name ?? '',
        email: customerDetails?.customer_email ?? '',
        phone: customerDetails?.customer_phone ?? '',
        amount: paymentAmount,
        payment_status: paymentStatus,
      };

      try {
        const sheetRes = await fetch(sheetWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sheetPayload),
        });
        console.log(`Google Sheets webhook response: ${sheetRes.status}`);
      } catch (sheetErr) {
        console.error('Google Sheets webhook failed (non-blocking):', sheetErr);
      }
    } else {
      console.warn('GOOGLE_SHEET_WEBHOOK_URL not set, skipping Sheets sync');
    }
  }

  return res.status(200).json({ ok: true });
}
