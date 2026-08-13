/**
 * POST /api/send-invoice-email
 *
 * Emails an invoice to the customer. The HTML is rendered in the admin panel
 * (so whatever the admin previewed and edited is exactly what gets sent) and
 * posted here for delivery.
 *
 * Admin-only. The recipient is always re-read from the database rather than
 * trusted from the request, so this cannot be used to mail arbitrary people.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const istNow = () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

/**
 * Strip anything that could execute when the mail client renders the HTML.
 * The markup comes from our own admin UI, but it is still user-editable text,
 * so it is sanitised before being sent on.
 */
const sanitizeHtml = (html: string): string =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl        = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey    = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const resendKey          = process.env.RESEND_API_KEY || process.env.RESEND_KEY;
  const emailFrom          = process.env.EMAIL_FROM || 'Helmet Hub <orders@helmethub.in>';

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey || !resendKey) {
    console.error('send-invoice-email: missing env vars');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // --- Admin authentication ---
  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) return res.status(403).json({ error: 'Forbidden' });

  // --- Validate input ---
  const { order_id, invoice_no, html } = req.body ?? {};

  if (!order_id || !UUID_RE.test(String(order_id))) {
    return res.status(400).json({ error: 'Invalid order_id' });
  }
  if (typeof html !== 'string' || html.length === 0 || html.length > 200_000) {
    return res.status(400).json({ error: 'Invalid invoice content' });
  }

  // --- Recipient comes from the database, never from the request body ---
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('order_number, customer_email, customer_name')
    .eq('id', order_id)
    .maybeSingle();

  if (orderErr || !order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  if (!order.customer_email) {
    return res.status(400).json({ error: 'This order has no customer email address' });
  }

  const invoiceNo = String(invoice_no || order.order_number).slice(0, 60);
  const safeHtml = sanitizeHtml(html);

  const wrapped = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#F4F6F8;
               font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:720px;margin:0 auto;background:#ffffff;
                border-radius:10px;overflow:hidden;
                box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      ${safeHtml}
    </div>
    <p style="max-width:720px;margin:16px auto 0;font-size:11.5px;color:#7A8189;text-align:center;">
      This invoice was sent by Helmet Hub. Questions? Reply to this email or call us.
    </p>
  </body>
</html>`;

  try {
    const resend = new Resend(resendKey);
    const { error: sendError } = await resend.emails.send({
      from: emailFrom,
      to: order.customer_email,
      subject: `Invoice ${invoiceNo} — Helmet Hub`,
      html: wrapped,
    });

    if (sendError) {
      console.error(`[${istNow()}] Resend error:`, sendError);
      return res.status(502).json({ error: 'Email service rejected the message' });
    }

    console.log(`[${istNow()}] Invoice ${invoiceNo} emailed to ${order.customer_email}`);
    return res.status(200).json({ success: true, sent_to: order.customer_email });
  } catch (err: any) {
    console.error(`[${istNow()}] send-invoice-email failed:`, err);
    return res.status(500).json({ error: 'Failed to send invoice' });
  }
}
