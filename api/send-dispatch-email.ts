import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import PDFDocument from 'pdfkit';

const istNow = () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

// Escape all DB-sourced values before inserting into HTML (H1)
const escapeHtml = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

// UUID format guard — prevents arbitrary strings reaching the DB query (M2)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateInvoicePDF(order: any, items: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(24).font('Helvetica-Bold').text('HELMET HUB', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('www.helmethub.in', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica-Bold').text('Order Details');
    doc.fontSize(9).font('Helvetica');
    doc.text(`Order ID: ${order.order_number}`);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    doc.text(`Payment Status: ${order.payment_status?.toUpperCase()}`);
    if (order.courier_name)  doc.text(`Courier: ${order.courier_name}`);
    if (order.tracking_id)   doc.text(`Tracking ID: ${order.tracking_id}`);
    doc.moveDown(1);

    doc.fontSize(10).font('Helvetica-Bold').text('Bill To');
    doc.fontSize(9).font('Helvetica');
    doc.text(order.customer_name || 'Guest');
    if (order.customer_email) doc.text(order.customer_email);
    if (order.customer_phone) doc.text(order.customer_phone);
    doc.moveDown(0.5);

    const shippingAddr = order.shipping_address || [
      order.delivery_address,
      order.delivery_city,
      order.delivery_state,
      order.delivery_pincode,
    ].filter(Boolean).join(', ');
    doc.fontSize(10).font('Helvetica-Bold').text('Ship To');
    doc.fontSize(9).font('Helvetica').text(shippingAddr || 'N/A');
    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);
    const tableTop = doc.y;
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Product', 50, tableTop, { width: 220 });
    doc.text('Variant', 270, tableTop, { width: 80 });
    doc.text('Qty',   350, tableTop, { width: 40,  align: 'center' });
    doc.text('Price', 390, tableTop, { width: 70,  align: 'right' });
    doc.text('Total', 470, tableTop, { width: 75,  align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(9);
    let subtotal = 0;
    for (const item of items) {
      const y = doc.y;
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      const variant = [item.color, item.size].filter(Boolean).join(' / ') || '-';
      doc.text(item.product_name, 50, y, { width: 220 });
      doc.text(variant,           270, y, { width: 80 });
      doc.text(String(item.quantity), 350, y, { width: 40, align: 'center' });
      doc.text(`₹${item.price.toFixed(2)}`,    390, y, { width: 70, align: 'right' });
      doc.text(`₹${lineTotal.toFixed(2)}`,     470, y, { width: 75, align: 'right' });
      doc.moveDown(0.5);
    }

    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text(`Total: ₹${(order.total_amount ?? subtotal).toFixed(2)}`, 390, doc.y, { width: 155, align: 'right' });
    doc.moveDown(2);

    doc.fontSize(8).font('Helvetica').fillColor('#666');
    doc.text('Thank you for shopping with Helmet Hub!', { align: 'center' });
    doc.text('For queries, contact us at support@helmethub.in', { align: 'center' });

    doc.end();
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RESEND_API_KEY     = process.env.RESEND_API_KEY;
  const supabaseUrl        = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey    = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!RESEND_API_KEY || !supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Server misconfigured — missing env vars' });
  }

  // --- Admin authentication (C4) ---
  // The admin frontend must send the logged-in user's Supabase JWT in Authorization: Bearer <token>.
  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify the JWT is valid
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check admin status via profiles.is_admin (consistent with the app's auth model)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // --- End auth ---

  console.log(`[${istNow()}] RESEND_API_KEY loaded:`, !!RESEND_API_KEY);

  const { order_id } = req.body;

  // Validate order_id is a UUID to prevent arbitrary DB lookups (M2)
  if (!order_id || !UUID_RE.test(String(order_id))) {
    return res.status(400).json({ error: 'Missing or invalid order_id' });
  }

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .maybeSingle();

  if (orderErr || !order) {
    console.error(`[${istNow()}] Order not found:`, orderErr);
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.email_sent) {
    console.log(`[${istNow()}] Email already sent for order ${order.order_number}`);
    return res.status(200).json({ success: true, message: 'Email already sent' });
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('product_name, quantity, price, color, size')
    .eq('order_id', order.id);

  const orderItems = items || [];

  console.log(`[${istNow()}] Sending dispatch email to:`, order.customer_email);

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateInvoicePDF(order, orderItems);
    console.log(`[${istNow()}] Invoice PDF generated (${pdfBuffer.length} bytes)`);
  } catch (pdfErr) {
    console.error(`[${istNow()}] PDF generation failed:`, pdfErr);
    return res.status(500).json({ error: 'Failed to generate invoice' });
  }

  // Build tracking link — encode the tracking ID and allowlist known carriers (H2)
  const safeTrackingId = encodeURIComponent(order.tracking_id || '');
  const courierLower   = (order.courier_name || '').toLowerCase();

  const trackingLink = courierLower.includes('delhivery')
    ? `https://www.delhivery.com/track/package/${safeTrackingId}`
    : courierLower.includes('bluedart')
    ? `https://www.bluedart.com/tracking/${safeTrackingId}`
    : courierLower.includes('dtdc')
    ? `https://www.dtdc.in/tracking/${safeTrackingId}`
    : courierLower.includes('ekart')
    ? `https://ekartlogistics.com/track/${safeTrackingId}`
    : `https://www.google.com/search?q=${encodeURIComponent((order.courier_name || '') + ' tracking ' + (order.tracking_id || ''))}`;

  const shippingAddress = order.shipping_address || [
    order.delivery_address,
    order.delivery_city,
    order.delivery_state,
    order.delivery_pincode,
  ].filter(Boolean).join(', ');

  // Escape all DB-sourced values before embedding in HTML (H1)
  const productLines = orderItems
    .map((p: any) =>
      `<li>${escapeHtml(p.product_name)} (Qty: ${Number(p.quantity) || 0}) — ₹${(Number(p.price) * Number(p.quantity)).toFixed(2)}</li>`
    )
    .join('');

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
      <h2 style="color:#e65100;">Your Order Has Been Dispatched! 🚚</h2>
      <p>Hello <strong>${escapeHtml(order.customer_name) || 'Customer'}</strong>,</p>
      <p>Great news! Your order <strong>${escapeHtml(order.order_number)}</strong> has been shipped.</p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f9f9f9;border-radius:8px;">
        <tr><td style="padding:12px;color:#666;border-bottom:1px solid #eee;">Order ID</td><td style="padding:12px;font-weight:600;border-bottom:1px solid #eee;">${escapeHtml(order.order_number)}</td></tr>
        <tr><td style="padding:12px;color:#666;border-bottom:1px solid #eee;">Courier</td><td style="padding:12px;font-weight:600;border-bottom:1px solid #eee;">${escapeHtml(order.courier_name) || 'N/A'}</td></tr>
        <tr><td style="padding:12px;color:#666;border-bottom:1px solid #eee;">Tracking ID</td><td style="padding:12px;font-weight:600;border-bottom:1px solid #eee;">${escapeHtml(order.tracking_id) || 'N/A'}</td></tr>
        <tr><td style="padding:12px;color:#666;">Total Amount</td><td style="padding:12px;font-weight:600;">₹${Number(order.total_amount).toFixed(2)}</td></tr>
      </table>

      <p><a href="${escapeHtml(trackingLink)}" style="display:inline-block;background:#e65100;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;">Track Your Order →</a></p>

      <h3 style="margin-bottom:8px;">Products</h3>
      <ul style="background:#f5f5f5;padding:12px 12px 12px 28px;border-radius:6px;font-size:14px;">${productLines}</ul>

      <h3 style="margin-bottom:8px;">Shipping Address</h3>
      <p style="background:#f5f5f5;padding:12px;border-radius:6px;">${escapeHtml(shippingAddress)}</p>

      <p style="font-size:13px;color:#888;margin-top:16px;">Your invoice is attached as a PDF to this email.</p>

      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p>Thank you for shopping with <strong>HelmetHub</strong>.</p>
    </div>
  `;

  try {
    const resend = new Resend(RESEND_API_KEY);

    const data = await resend.emails.send({
      from:    'HelmetHub <orders@helmethub.in>',
      to:      [order.customer_email],
      subject: `Your Order ${order.order_number} Has Been Shipped! 🚚`,
      html:    htmlContent,
      attachments: [
        {
          filename:     `Invoice-${order.order_number}.pdf`,
          content:      pdfBuffer.toString('base64'),
          content_type: 'application/pdf',
        },
      ],
    });

    console.log(`[${istNow()}] Dispatch email sent:`, JSON.stringify(data));

    await supabase
      .from('orders')
      .update({ email_sent: true })
      .eq('id', order.id);

    return res.status(200).json({ success: true });
  } catch (emailErr: any) {
    console.error(`[${istNow()}] Email sending failed:`, emailErr?.message || emailErr);
    return res.status(500).json({ error: emailErr?.message || 'Failed to send email' });
  }
}
