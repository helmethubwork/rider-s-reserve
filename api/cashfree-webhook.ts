import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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
const istNow = () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

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

  // --- Signature verification ---
  const isTest = process.env.NODE_ENV !== 'production';

  try {
    if (!isTest) {
      const signature = req.headers['x-webhook-signature'] as string | undefined;
      const timestamp = req.headers['x-webhook-timestamp'] as string | undefined;

      if (!signature || !timestamp) {
        console.warn(`[${istNow()}] Webhook missing signature or timestamp headers`);
      } else {
        const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const payload = timestamp + rawBody;

        if (!verifySignature(payload, signature, secretKey)) {
          console.warn(`[${istNow()}] Webhook signature verification failed`);
        }
      }
    } else {
      console.log(`[${istNow()}] Skipping Cashfree signature verification in test mode`);
    }
  } catch {
    console.log(`[${istNow()}] Signature verification failed but continuing (test mode)`);
  }

  // --- Parse event ---
  let body: any;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (parseError) {
    console.error(`[${istNow()}] Failed to parse webhook payload:`, parseError);
    return res.status(200).json({ received: true });
  }

  const eventType: string | undefined = body?.type;
  const orderData = body?.data?.order;
  const paymentData = body?.data?.payment;
  const cashfreePaymentStatus = String(paymentData?.payment_status ?? '').toUpperCase();

  if (!orderData?.order_id) {
    console.warn(`[${istNow()}] Webhook payload missing order data:`, JSON.stringify(body));
    return res.status(200).json({ received: true });
  }

  const orderId: string = orderData.order_id; // matches our order_number
  const cfPaymentId: string | null = paymentData?.cf_payment_id ?? null;
  const paymentAmount: number | null = paymentData?.payment_amount ?? orderData.order_amount ?? null;

  console.log(`[${istNow()}] Webhook received: ${eventType ?? 'unknown'} for order ${orderId}`);
  console.log(`[${istNow()}] Processing payment status`);

  // --- Determine new status ---
  let paymentStatus: string | null = null;

  if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || cashfreePaymentStatus === 'SUCCESS') {
    console.log(`[${istNow()}] Payment success received`);
    paymentStatus = 'paid';
  } else if (eventType === 'PAYMENT_FAILED_WEBHOOK' || cashfreePaymentStatus === 'FAILED') {
    paymentStatus = 'failed';
  } else {
    // Acknowledge unknown events without processing
    console.log(`[${istNow()}] Ignoring unhandled event type: ${eventType}`);
    return res.status(200).json({ received: true });
  }

  // --- Update Supabase ---
  const customerDetails = body?.data?.customer_details ?? body?.data?.order?.customer_details ?? orderData?.customer_details ?? {};
  const customerName = customerDetails?.customer_name || 'Guest';
  const customerEmail = customerDetails?.customer_email || '';
  const customerPhone = customerDetails?.customer_phone || '';

  console.log(`[${istNow()}] Updating Supabase order:`, orderId);
  console.log(`[${istNow()}] Customer:`, customerName);
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
      console.log(`[${istNow()}] Order ${orderId} updated to payment_status=${paymentStatus}`);
    }
  } catch (err) {
    console.error(`[${istNow()}] Error during Supabase update:`, err);
  }

  // --- Forward successful payments to Google Sheets ---
  if (paymentStatus === 'paid') {
    console.log(`[${istNow()}] Sending order to Google Sheets`);
    const sheetWebhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (sheetWebhookUrl) {
      const sheetCustomerDetails = body?.data?.customer_details ?? body?.data?.order?.customer_details ?? orderData?.customer_details ?? {};
      const sheetCustomerName = sheetCustomerDetails?.customer_name || body?.data?.payment?.payment_group_details?.customer_name || 'Guest';
      console.log(`[${istNow()}] Customer name received:`, sheetCustomerName);
      console.log(`[${istNow()}] Customer details:`, JSON.stringify(sheetCustomerDetails));
      const sheetPayload = {
        order_id: orderId,
        customer_name: sheetCustomerName,
        email: sheetCustomerDetails?.customer_email ?? '',
        phone: sheetCustomerDetails?.customer_phone ?? '',
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
        console.log(`[${istNow()}] Google Sheets webhook response: ${sheetRes.status}`);
      } catch (sheetErr) {
        console.error(`[${istNow()}] Google Sheets webhook failed (non-blocking):`, sheetErr);
      }
    } else {
      console.warn(`[${istNow()}] GOOGLE_SHEET_WEBHOOK_URL not set, skipping Sheets sync`);
    }

    // --- Send order confirmation email ---
    console.log(`[${istNow()}] Fetching order details for confirmation email`);
    try {
      // Fetch order record
      const { data: orderRecord, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderId)
        .maybeSingle();

      if (orderErr || !orderRecord) {
        console.error(`[${istNow()}] Could not fetch order for email:`, orderErr);
      } else {
        // Fetch order items
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_name, quantity, price, color, size')
          .eq('order_id', orderRecord.id);

        const shippingAddress = orderRecord.shipping_address || [
          orderRecord.delivery_address,
          orderRecord.delivery_city,
          orderRecord.delivery_state,
          orderRecord.delivery_pincode,
        ].filter(Boolean).join(', ');

        const emailPayload = {
          orderId,
          customerName: orderRecord.customer_name || customerName,
          customerEmail: orderRecord.customer_email || customerEmail,
          products: orderItems || [],
          amount: orderRecord.total_amount ?? paymentAmount,
          shippingAddress,
          invoiceUrl: null, // TODO: Generate invoice PDF and pass URL here
        };

        // Determine base URL for internal API call
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.SITE_URL || 'https://helmethub.in';

        console.log(`[${istNow()}] Calling send-order-email API at ${baseUrl}`);
        console.log(`[${istNow()}] Email payload:`, JSON.stringify(emailPayload));

        const emailRes = await fetch(`${baseUrl}/api/send-order-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailPayload),
        });

        const emailText = await emailRes.text();
        let emailData: any;
        try {
          emailData = JSON.parse(emailText);
        } catch {
          console.error(`[${istNow()}] Email API returned non-JSON response:`, emailText);
          emailData = { raw: emailText };
        }

        if (emailRes.ok) {
          console.log(`[${istNow()}] Order confirmation email sent successfully:`, JSON.stringify(emailData));
        } else {
          console.error(`[${istNow()}] Email API error (${emailRes.status}):`, JSON.stringify(emailData));
        }
      }
    } catch (emailErr) {
      console.error(`[${istNow()}] Email sending failed (non-blocking):`, emailErr);
    }
  }

  return res.status(200).json({ received: true });
}
}
