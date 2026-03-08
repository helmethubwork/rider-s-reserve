import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const EMAIL_FROM = process.env.EMAIL_FROM || 'orders@helmethub.in';

  console.log('RESEND KEY PRESENT:', !!RESEND_API_KEY);
  console.log('RESEND KEY LENGTH:', RESEND_API_KEY?.length ?? 0);
  console.log('EMAIL_FROM:', EMAIL_FROM);

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const { orderId, customerName, customerEmail, products, amount, shippingAddress, invoiceUrl } = req.body;

    if (!orderId || !customerName || !customerEmail || !products || !amount || !shippingAddress) {
      console.error('Missing required fields for email:', { orderId, customerName, customerEmail });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`Sending order confirmation email to ${customerEmail} for order ${orderId}`);

    const productLines = Array.isArray(products)
      ? products.map((p: any) => `<li>${p.product_name || p.name} (Qty: ${p.quantity}) — ₹${(p.price * p.quantity).toFixed(2)}</li>`).join('')
      : `<li>${String(products)}</li>`;

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
          <tr><td style="padding:8px 0;color:#666;">Total Amount</td><td style="padding:8px 0;font-weight:600;">₹${Number(amount).toFixed(2)}</td></tr>
        </table>
        <h3 style="margin-bottom:8px;">Products</h3>
        <ul style="background:#f5f5f5;padding:12px 12px 12px 28px;border-radius:6px;font-size:14px;">${productLines}</ul>
        <h3 style="margin-bottom:8px;">Shipping Address</h3>
        <p style="background:#f5f5f5;padding:12px;border-radius:6px;">${shippingAddress}</p>
        ${invoiceSection}
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p>Thank you for shopping with <strong>HelmetHub</strong>.</p>
      </div>
    `;

    const data = await resend.emails.send({
      from: 'HelmetHub <orders@helmethub.in>',
      to: [customerEmail],
      subject: `Order Confirmation - Helmet Hub - ${orderId}`,
      html: htmlContent,
    });

    console.log('Email sent successfully:', JSON.stringify(data));
    return res.status(200).json({ success: true, emailId: (data as any)?.data?.id || data });
  } catch (error: any) {
    console.error('Email sending failed:', error?.message || error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
