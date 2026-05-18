import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const escapeHtml = (str = '') =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

// Accept only HTTPS URLs to prevent javascript:/data: injection in hrefs (H4)
const isSafeHttpsUrl = (v: unknown): v is string => {
  if (typeof v !== 'string') return false;
  try {
    const u = new URL(v);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RESEND_API_KEY  = process.env.RESEND_API_KEY;
  const EMAIL_FROM      = process.env.EMAIL_FROM || 'orders@helmethub.in';
  // ORDER_EMAIL_API_KEY must be set in Vercel env vars and passed as x-api-key
  // by whatever server-side code triggers this endpoint (never from the browser). (C5)
  const ORDER_EMAIL_KEY = process.env.ORDER_EMAIL_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  // --- Caller authentication (C5) ---
  if (!ORDER_EMAIL_KEY) {
    console.error('ORDER_EMAIL_API_KEY is not configured');
    return res.status(500).json({ error: 'Server misconfigured' });
  }
  const providedKey = req.headers['x-api-key'];
  if (typeof providedKey !== 'string' || providedKey !== ORDER_EMAIL_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // --- End auth ---

  const resend = new Resend(RESEND_API_KEY);

  try {
    const { orderId, customerName, customerEmail, products, amount, shippingAddress, invoiceUrl } = req.body;

    if (!orderId || !customerName || !customerEmail || !products || amount == null || !shippingAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate amount is a finite positive number (M3)
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const safeName    = escapeHtml(customerName);
    const safeOrderId = escapeHtml(orderId);
    const safeAddress = escapeHtml(shippingAddress);

    const productLines = Array.isArray(products)
      ? products
          .map(
            (p: any) =>
              `<li>${escapeHtml(p.product_name || p.name)} (Qty: ${Number(p.quantity) || 0}) — &#8377;${(Number(p.price) * Number(p.quantity)).toFixed(2)}</li>`
          )
          .join('')
      : `<li>${escapeHtml(String(products))}</li>`;

    // Only embed invoiceUrl when it is a verified HTTPS URL (H4)
    const invoiceSection = isSafeHttpsUrl(invoiceUrl)
      ? `<p><a href="${escapeHtml(invoiceUrl)}" style="color:#e65100;font-weight:600;">Download Invoice</a></p>`
      : '';

    const htmlContent = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
        <h2 style="color:#e65100;">HelmetHub Order Confirmation</h2>
        <p>Hello <strong>${safeName}</strong>,</p>
        <p>Your order has been successfully placed.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px 0;color:#666;">Order ID</td><td style="padding:8px 0;font-weight:600;">${safeOrderId}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Total Amount</td><td style="padding:8px 0;font-weight:600;">&#8377;${numericAmount.toFixed(2)}</td></tr>
        </table>
        <h3 style="margin-bottom:8px;">Products</h3>
        <ul style="background:#f5f5f5;padding:12px 12px 12px 28px;border-radius:6px;font-size:14px;">${productLines}</ul>
        <h3 style="margin-bottom:8px;">Shipping Address</h3>
        <p style="background:#f5f5f5;padding:12px;border-radius:6px;">${safeAddress}</p>
        ${invoiceSection}
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p>Thank you for shopping with <strong>HelmetHub</strong>.</p>
      </div>
    `;

    const data = await resend.emails.send({
      from:    `HelmetHub <${EMAIL_FROM}>`,
      to:      [customerEmail],
      subject: `Order Confirmation - Helmet Hub - ${safeOrderId}`,
      html:    htmlContent,
    });

    console.log('Email sent successfully');
    return res.status(200).json({ success: true, emailId: (data as any)?.data?.id || data });
  } catch (error: any) {
    console.error('Email sending failed:', error?.message || 'Unknown error');
    return res.status(500).json({ error: 'Internal server error' });
  }
}
