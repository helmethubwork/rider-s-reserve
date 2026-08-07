import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { z } from 'zod';

const schema = z.object({
  name:    z.string().min(1).max(100).transform(s => s.trim()),
  email:   z.string().email().max(200),
  phone:   z.string().max(20).optional().default(''),
  subject: z.string().min(1).max(200).transform(s => s.trim()),
  message: z.string().min(1).max(3000).transform(s => s.trim()),
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

  const { name, email, phone, subject, message } = parsed.data;
  const resendKey    = process.env.RESEND_API_KEY;
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@helmethub.in';

  if (!resendKey) {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const resend = new Resend(resendKey);

  try {
    // ── 1. Notification to support team ─────────────────────────────────────
    await resend.emails.send({
      from:    `Helmet Hub Website <support@helmethub.in>`,
      to:      [supportEmail],
      replyTo: email,
      subject: `📬 New Contact: ${escapeHtml(subject)}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#e65100;padding:20px 24px;">
    <h2 style="margin:0;color:#fff;font-size:18px;">New Contact Form Submission</h2>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:12px;">helmethub.in</p>
  </div>
  <div style="padding:24px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#888;width:100px;border-bottom:1px solid #f0f0f0;">Name</td><td style="padding:8px 0;font-weight:600;border-bottom:1px solid #f0f0f0;">${escapeHtml(name)}</td></tr>
      <tr><td style="padding:8px 0;color:#888;border-bottom:1px solid #f0f0f0;">Email</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;"><a href="mailto:${escapeHtml(email)}" style="color:#e65100;">${escapeHtml(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding:8px 0;color:#888;border-bottom:1px solid #f0f0f0;">Phone</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">${escapeHtml(phone)}</td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#888;">Subject</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(subject)}</td></tr>
    </table>
    <div style="margin-top:20px;background:#fff8f5;border-left:4px solid #e65100;padding:16px;border-radius:0 6px 6px 0;">
      <p style="margin:0 0 6px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Message</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
    </div>
    <p style="margin-top:20px;font-size:12px;color:#aaa;">↩ Reply directly to this email to respond to the customer.</p>
  </div>
</div>
</body>
</html>`,
    });

    // ── 2. Auto-reply to customer ────────────────────────────────────────────
    await resend.emails.send({
      from:    `Helmet Hub Support <support@helmethub.in>`,
      to:      [email],
      subject: `We've received your message — Helmet Hub`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#e65100;padding:28px 24px;text-align:center;">
    <p style="margin:0 0 4px;font-size:10px;letter-spacing:4px;color:rgba(255,255,255,0.7);text-transform:uppercase;">Helmet Hub</p>
    <h1 style="margin:0;font-size:22px;color:#fff;font-weight:700;">We Got Your Message ✅</h1>
    <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">We'll get back to you within 24 hours</p>
  </div>
  <div style="padding:28px 24px;">
    <p style="font-size:14px;color:#333;margin:0 0 12px;">Hi <strong>${escapeHtml(name)}</strong>,</p>
    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 20px;">Thank you for reaching out to Helmet Hub! Our team has received your message and will respond within <strong>24 hours</strong>.</p>

    <div style="background:#fff8f5;border:1px solid #f0d5c8;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Your Message</p>
      <p style="margin:0;font-size:13px;color:#555;font-style:italic;line-height:1.6;">"${escapeHtml(message.slice(0, 250))}${message.length > 250 ? '…' : ''}"</p>
    </div>

    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 8px;">You can also reach us directly:</p>
    <p style="font-size:14px;color:#555;margin:0 0 4px;">📞 <strong>+91 7842646888</strong> &nbsp;|&nbsp; <strong>+91 9063880550</strong></p>
    <p style="font-size:14px;color:#555;margin:0 0 20px;">🕐 Monday – Sunday: 10 AM – 11 PM</p>

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
    console.error('[send-contact-email] Failed:', err?.message || err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
