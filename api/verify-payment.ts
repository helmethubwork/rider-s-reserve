import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const BASE_URL =
  process.env.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com'
    : 'https://sandbox.cashfree.com';

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const orderId = req.query.order_id as string;

  if (!orderId || typeof orderId !== 'string' || orderId.length > 100) {
    return res.status(400).json({ error: 'Invalid order_id', success: false });
  }

  const appId          = process.env.CASHFREE_APP_ID;
  const secretKey      = process.env.CASHFREE_SECRET_KEY;
  const supabaseUrl    = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey    = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey   = process.env.RESEND_API_KEY;
  const emailFrom      = process.env.EMAIL_FROM || 'orders@helmethub.in';

  if (!appId || !secretKey) {
    console.error('Cashfree credentials not configured');
    return res.status(500).json({ error: 'Payment service not configured', success: false });
  }

  try {
    // ── Step 1: Ask Cashfree if the order is paid ──────────────────
    const cfRes = await fetch(`${BASE_URL}/pg/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    });

    const cfData = await cfRes.json();

    if (!cfRes.ok) {
      console.error('Cashfree verify error:', cfData);
      return res.status(200).json({ success: false, order_id: orderId });
    }

    const isPaid = cfData.order_status === 'PAID';

    // ── Step 2: If paid, update DB + send confirmation email ───────
    if (isPaid && supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Look up the order by order_number
      const { data: order } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, customer_email, customer_phone, shipping_address, total_amount, payment_status, email_sent')
        .eq('order_number', orderId)
        .maybeSingle();

      if (order) {
        // Update payment_status only if not already paid (prevent double processing)
        if (order.payment_status !== 'paid') {
          await supabase
            .from('orders')
            .update({ payment_status: 'paid' })
            .eq('order_number', orderId);
        }

        // Send confirmation email once
        if (!order.email_sent && order.customer_email && resendApiKey) {
          try {
            // Fetch order items
            const { data: orderItems } = await supabase
              .from('order_items')
              .select('product_name, quantity, price, color, size')
              .eq('order_id', order.id);

            const items = orderItems || [];
            const productLines = items
              .map((item: any) =>
                `<li style="margin-bottom:4px;">${escapeHtml(item.product_name)}${item.size ? ` <span style="color:#888;font-size:12px;">(${escapeHtml(item.size)})</span>` : ''} × ${Number(item.quantity)} — ₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}</li>`
              )
              .join('');

            const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#e65100;padding:28px 24px;text-align:center;">
    <p style="margin:0 0 4px;font-size:10px;letter-spacing:4px;color:rgba(255,255,255,0.7);text-transform:uppercase;">Helmet Hub</p>
    <h1 style="margin:0;font-size:26px;color:#fff;font-weight:700;">Order Confirmed! 🎉</h1>
    <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.8);">Thank you for your purchase</p>
  </div>
  <div style="padding:28px 24px;">
    <p style="margin:0 0 12px;font-size:14px;color:#333;">Hi <strong>${escapeHtml(order.customer_name) || 'Rider'}</strong>,</p>
    <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;">We've received your payment and your order is being processed. Gear up — it's on its way! 🏍️</p>

    <div style="background:#fff8f5;border:1px solid #f0d5c8;border-radius:8px;padding:14px 18px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;">Order Number</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#e65100;">${escapeHtml(order.order_number)}</p>
    </div>

    ${productLines ? `
    <h3 style="margin:0 0 8px;font-size:13px;color:#333;text-transform:uppercase;letter-spacing:1px;">Items Ordered</h3>
    <ul style="margin:0 0 20px;background:#f9f9f9;padding:12px 12px 12px 30px;border-radius:6px;font-size:13px;color:#333;">
      ${productLines}
    </ul>` : ''}

    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
      <tr>
        <td style="padding:8px 0;color:#666;border-bottom:1px solid #f0f0f0;">Total Paid</td>
        <td style="padding:8px 0;font-weight:700;text-align:right;border-bottom:1px solid #f0f0f0;color:#e65100;">₹${Number(order.total_amount).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#666;">Shipping To</td>
        <td style="padding:8px 0;text-align:right;font-size:12px;color:#555;">${escapeHtml(order.shipping_address || 'Address on file')}</td>
      </tr>
    </table>

    <p style="font-size:13px;color:#555;line-height:1.6;">📦 Your order will be dispatched within <strong>2–5 business days</strong>. You'll receive another email with tracking details once shipped.</p>

    <div style="margin:20px 0;text-align:center;">
      <a href="https://www.helmethub.in/my-orders" style="display:inline-block;background:#e65100;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">View My Orders →</a>
    </div>

    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
    <p style="margin:0;font-size:14px;color:#333;">Ride safe,<br/><strong>Team Helmet Hub</strong> 🏍️</p>
  </div>
  <div style="background:#f5f5f5;padding:14px 24px;text-align:center;border-top:1px solid #eee;">
    <p style="margin:0;font-size:11px;color:#aaa;">Questions? Email us at support@helmethub.in</p>
    <p style="margin:4px 0 0;font-size:10px;color:#ccc;">© 2025 Helmet Hub · helmethub.in</p>
  </div>
</div>
</body>
</html>`;

            const resend = new Resend(resendApiKey);
            const { error: emailErr } = await resend.emails.send({
              from: `HelmetHub <${emailFrom}>`,
              to: [order.customer_email],
              bcc: emailFrom, // keep a copy
              subject: `Order Confirmed ✅ ${order.order_number} — Helmet Hub`,
              html,
            });

            if (!emailErr) {
              await supabase
                .from('orders')
                .update({ email_sent: true })
                .eq('order_number', orderId);
              console.log(`[verify-payment] Confirmation email sent for ${orderId}`);
            } else {
              console.error('[verify-payment] Resend error:', emailErr);
            }
          } catch (emailErr) {
            console.error('[verify-payment] Email failed:', emailErr);
          }
        }
      }
    }

    return res.status(200).json({
      success: isPaid,
      order_id: orderId,
      order_amount: cfData.order_amount,
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return res.status(200).json({ success: false, order_id: orderId });
  }
}
