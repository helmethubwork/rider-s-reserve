import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { z } from 'zod';

const schema = z.object({
  fullName:          z.string().min(1).max(100).transform(s => s.trim()),
  email:             z.string().email().max(200),
  phone:             z.string().max(20),
  orderNumber:       z.string().min(1).max(50).transform(s => s.trim()),
  productType:       z.string().max(50),
  originalProduct:   z.string().max(200).transform(s => s.trim()),
  productColor:      z.string().max(100).transform(s => s.trim()),
  sizeOrdered:       z.string().max(20).transform(s => s.trim()),
  sizeNeeded:        z.string().max(20).transform(s => s.trim()),
  alternateProducts: z.array(z.string().max(200)).max(3).default([]),
});

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const {
    fullName, email, phone, orderNumber, productType,
    originalProduct, productColor, sizeOrdered, sizeNeeded, alternateProducts,
  } = parsed.data;

  const resendKey    = process.env.RESEND_API_KEY;
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@helmethub.in';

  if (!resendKey) {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const resend = new Resend(resendKey);
  const alternatesHtml = alternateProducts
    .filter(Boolean)
    .map((p, i) => `<tr><td style="padding:6px 0;color:#888;border-bottom:1px solid #f0f0f0;">Alternate ${i + 1}</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;">${escapeHtml(p)}</td></tr>`)
    .join('');

  try {
    // ── 1. Detailed notification to support team ─────────────────────────────
    await resend.emails.send({
      from:    `Helmet Hub Website <support@helmethub.in>`,
      to:      [supportEmail],
      replyTo: email,
      subject: `🔄 Exchange Request: ${escapeHtml(orderNumber)} — ${escapeHtml(fullName)}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#e65100;padding:20px 24px;">
    <h2 style="margin:0;color:#fff;font-size:18px;">New Exchange Request</h2>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:12px;">Action required — helmethub.in</p>
  </div>
  <div style="padding:24px;">
    <h3 style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Customer Details</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
      <tr><td style="padding:6px 0;color:#888;width:150px;border-bottom:1px solid #f0f0f0;">Name</td><td style="padding:6px 0;font-weight:600;border-bottom:1px solid #f0f0f0;">${escapeHtml(fullName)}</td></tr>
      <tr><td style="padding:6px 0;color:#888;border-bottom:1px solid #f0f0f0;">Email</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;"><a href="mailto:${escapeHtml(email)}" style="color:#e65100;">${escapeHtml(email)}</a></td></tr>
      <tr><td style="padding:6px 0;color:#888;border-bottom:1px solid #f0f0f0;">Phone</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;">${escapeHtml(phone)}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Order Number</td><td style="padding:6px 0;font-weight:700;color:#e65100;">${escapeHtml(orderNumber)}</td></tr>
    </table>

    <h3 style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Exchange Details</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 0;color:#888;width:150px;border-bottom:1px solid #f0f0f0;">Product Type</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;">${escapeHtml(productType)}</td></tr>
      <tr><td style="padding:6px 0;color:#888;border-bottom:1px solid #f0f0f0;">Product Name</td><td style="padding:6px 0;font-weight:600;border-bottom:1px solid #f0f0f0;">${escapeHtml(originalProduct)}</td></tr>
      <tr><td style="padding:6px 0;color:#888;border-bottom:1px solid #f0f0f0;">Color</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;">${escapeHtml(productColor)}</td></tr>
      <tr><td style="padding:6px 0;color:#888;border-bottom:1px solid #f0f0f0;">Size Ordered</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;">${escapeHtml(sizeOrdered)}</td></tr>
      <tr><td style="padding:6px 0;color:#888;border-bottom:1px solid #f0f0f0;">Size Needed</td><td style="padding:6px 0;font-weight:600;color:#e65100;border-bottom:1px solid #f0f0f0;">${escapeHtml(sizeNeeded)}</td></tr>
      ${alternatesHtml}
    </table>

    <p style="margin-top:24px;font-size:12px;color:#aaa;">↩ Reply directly to this email to respond to the customer.</p>
  </div>
</div>
</body>
</html>`,
    });

    // ── 2. Auto-reply to customer ────────────────────────────────────────────
    await resend.emails.send({
      from:    `Helmet Hub Support <support@helmethub.in>`,
      to:      [email],
      subject: `Exchange Request Received — Order ${escapeHtml(orderNumber)}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#e65100;padding:28px 24px;text-align:center;">
    <p style="margin:0 0 4px;font-size:10px;letter-spacing:4px;color:rgba(255,255,255,0.7);text-transform:uppercase;">Helmet Hub</p>
    <h1 style="margin:0;font-size:22px;color:#fff;font-weight:700;">Exchange Request Received 🔄</h1>
    <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">We'll review it within 48 hours</p>
  </div>
  <div style="padding:28px 24px;">
    <p style="font-size:14px;color:#333;margin:0 0 12px;">Hi <strong>${escapeHtml(fullName)}</strong>,</p>
    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 20px;">We've received your exchange request and our team will review it within <strong>48 hours</strong>. Please make sure you ship the product within 48 hours of receiving it, as per our exchange policy.</p>

    <div style="background:#fff8f5;border:1px solid #f0d5c8;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Your Request Summary</p>
      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#888;width:120px;">Order</td><td style="padding:4px 0;font-weight:700;color:#e65100;">${escapeHtml(orderNumber)}</td></tr>
        <tr><td style="padding:4px 0;color:#888;">Product</td><td style="padding:4px 0;">${escapeHtml(originalProduct)}</td></tr>
        <tr><td style="padding:4px 0;color:#888;">Size Ordered</td><td style="padding:4px 0;">${escapeHtml(sizeOrdered)}</td></tr>
        <tr><td style="padding:4px 0;color:#888;">Size Needed</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(sizeNeeded)}</td></tr>
      </table>
    </div>

    <div style="background:#f0f9f0;border:1px solid #c8e6c9;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#2e7d32;">📦 Next Steps</p>
      <ol style="margin:0;padding-left:20px;font-size:13px;color:#555;line-height:1.8;">
        <li>Ship the product within <strong>48 hours</strong> of receiving it</li>
        <li>Ship to the address on your invoice</li>
        <li>Send us the shipping invoice within <strong>7 days</strong> to get store credit (up to ₹500)</li>
        <li>We'll send your replacement free of charge</li>
      </ol>
    </div>

    <p style="font-size:14px;color:#555;margin:0 0 4px;">Questions? Contact us at:</p>
    <p style="font-size:14px;color:#555;margin:0 0 20px;">📞 <strong>+91 7842646888</strong> &nbsp;|&nbsp; <strong>+91 9063880550</strong></p>

    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
    <p style="font-size:14px;color:#333;margin:0;">Ride safe,<br/><strong>Team Helmet Hub 🏍️</strong></p>
  </div>
  <div style="background:#f5f5f5;padding:14px 24px;text-align:center;border-top:1px solid #eee;">
    <p style="margin:0;font-size:11px;color:#aaa;">Helmet Hub · <a href="mailto:support@helmethub.in" style="color:#aaa;">support@helmethub.in</a> · <a href="https://www.helmethub.in" style="color:#aaa;">helmethub.in</a></p>
  </div>
</div>
</body>
</html>`,
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[send-exchange-email] Failed:', err?.message || err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
