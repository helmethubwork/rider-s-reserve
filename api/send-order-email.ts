import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const EMAIL_FROM = process.env.EMAIL_FROM || 'orders@helmethub.in';

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  try {
    const { orderId, customerName, customerEmail, products, amount, shippingAddress, invoiceUrl } = req.body;

    if (!orderId || !customerName || !customerEmail || !products || !amount || !shippingAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build products list
    const productLines = Array.isArray(products)
      ? products.map((p: any) => `• ${p.product_name} (Qty: ${p.quantity}) — ₹${p.price * p.quantity}`).join('\n')
      : String(products);

    const invoiceSection = invoiceUrl
      ? `<p><a href="${invoiceUrl}" style="color:#e65100;font-weight:600;">Download Invoice</a></p>`
      : '';

    const htmlContent = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
        <h2 style="color:#e65100;">HelmetHub Order Confirmation</h2>
        <p>Hello <strong>${customerName}</strong>,</p>
        <p>Your order has been successfully placed.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px 0;color:#666;">Order ID</td><td style="padding:8px 0;font-weight:600;">${orderId}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Total Amount</td><td style="padding:8px 0;font-weight:600;">₹${amount}</td></tr>
        </table>
        <h3 style="margin-bottom:8px;">Products</h3>
        <pre style="background:#f5f5f5;padding:12px;border-radius:6px;font-size:14px;white-space:pre-wrap;">${productLines}</pre>
        <h3 style="margin-bottom:8px;">Shipping Address</h3>
        <p style="background:#f5f5f5;padding:12px;border-radius:6px;">${shippingAddress}</p>
        ${invoiceSection}
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p>Thank you for shopping with <strong>HelmetHub</strong>.</p>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: customerEmail,
        subject: `HelmetHub Order Confirmation – ${orderId}`,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', response.status, data);
      return res.status(response.status).json({ error: data.message || 'Failed to send email' });
    }

    return res.status(200).json({ success: true, emailId: data.id });
  } catch (error: any) {
    console.error('Send email error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
