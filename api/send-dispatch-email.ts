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

/**
 * PDFKit's built-in Helvetica is WinAnsi-encoded. It has no rupee glyph (which
 * printed as "¹") and no Cyrillic or Devanagari, which turned foreign addresses
 * into mojibake. Anything outside the supported range is replaced here so the
 * invoice stays readable instead of rendering garbage.
 */
const pdfSafe = (value: unknown): string =>
  String(value ?? '')
    .replace(/₹/g, 'Rs.')      // ₹ has no glyph in Helvetica
    .replace(/[‘’]/g, "'") // curly quotes
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-') // en/em dash
    .replace(/[^\x20-\x7E\n]/g, ''); // drop anything else non-ASCII

const rs = (n: number) =>
  'Rs. ' + Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

interface InvoiceBiz {
  name: string; address: string; state: string;
  phone: string; email: string; gstin: string;
  terms: string; footer: string;
}

function generateInvoicePDF(order: any, items: any[], biz: InvoiceBiz): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // --- Header band ---
    doc.rect(0, 0, 595, 8).fill('#4FC3E8');
    doc.fillColor('#1a1a1a');
    doc.y = 40;

    doc.fontSize(20).font('Helvetica-Bold').text(pdfSafe(biz.name), 50, doc.y);
    doc.fontSize(9).font('Helvetica').fillColor('#555');
    if (biz.address) doc.text(pdfSafe(biz.address), { width: 400 });
    if (biz.phone)   doc.text(pdfSafe(biz.phone));
    if (biz.email)   doc.text(pdfSafe(biz.email));
    if (biz.gstin)   doc.font('Helvetica-Bold').text(`Company GST: ${pdfSafe(biz.gstin)}`).font('Helvetica');
    if (biz.state)   doc.text(pdfSafe(biz.state));

    doc.moveDown(0.6);
    doc.fillColor('#1a1a1a').fontSize(14).font('Helvetica-Bold').text('TAX INVOICE', { align: 'right' });
    doc.moveDown(0.4);
    doc.strokeColor('#D8DDE2').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.7);

    // --- Bill To (left) / Invoice meta (right) ---
    const blockTop = doc.y;
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#4FC3E8').text('Bill To:', 50, blockTop);
    doc.fillColor('#1a1a1a').font('Helvetica-Bold').text(pdfSafe(order.customer_name || 'Guest'), 50, doc.y, { width: 250 });
    doc.font('Helvetica').fillColor('#555');
    if (order.customer_phone) doc.text(pdfSafe(order.customer_phone), 50, doc.y, { width: 250 });
    if (order.customer_email) doc.text(pdfSafe(order.customer_email), 50, doc.y, { width: 250 });

    const shippingAddr = order.shipping_address || [
      order.delivery_address, order.delivery_city,
      order.delivery_state, order.delivery_pincode,
    ].filter(Boolean).join(', ');
    if (shippingAddr) doc.text(pdfSafe(shippingAddr), 50, doc.y, { width: 250 });

    const leftEnd = doc.y;

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#4FC3E8').text('Ref No:', 380, blockTop, { width: 165, align: 'right' });
    doc.fillColor('#1a1a1a').font('Helvetica-Bold').text(pdfSafe(order.order_number), 380, doc.y, { width: 165, align: 'right' });
    doc.font('Helvetica-Bold').fillColor('#4FC3E8').text('Date of Issue', 380, doc.y + 4, { width: 165, align: 'right' });
    doc.fillColor('#1a1a1a').font('Helvetica').text(
      new Date(order.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
      380, doc.y, { width: 165, align: 'right' }
    );

    doc.y = Math.max(leftEnd, doc.y) + 14;

    // --- Items table ---
    const tableTop = doc.y;
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#667');
    doc.text('SR',     50,  tableTop, { width: 25 });
    doc.text('NAME',   75,  tableTop, { width: 250 });
    doc.text('QTY',    325, tableTop, { width: 40, align: 'right' });
    doc.text('PRICE',  370, tableTop, { width: 80, align: 'right' });
    doc.text('AMOUNT', 455, tableTop, { width: 90, align: 'right' });
    doc.moveDown(0.4);
    doc.strokeColor('#D8DDE2').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.4);

    doc.font('Helvetica').fontSize(9).fillColor('#1a1a1a');
    let subtotal = 0;
    items.forEach((item, i) => {
      const y = doc.y;
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      const name = [item.product_name, item.color, item.size].filter(Boolean).join(' - ');
      doc.text(String(i + 1),          50,  y, { width: 25 });
      doc.text(pdfSafe(name),          75,  y, { width: 250 });
      doc.text(String(item.quantity),  325, y, { width: 40, align: 'right' });
      doc.text(rs(item.price),         370, y, { width: 80, align: 'right' });
      doc.text(rs(lineTotal),          455, y, { width: 90, align: 'right' });
      doc.moveDown(0.55);
    });

    doc.moveDown(0.2);
    doc.strokeColor('#D8DDE2').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    const grandTotal = Number(order.total_amount ?? subtotal);
    const shipping = Math.max(0, grandTotal - subtotal);

    if (shipping > 0) {
      doc.fontSize(9).font('Helvetica').fillColor('#555');
      doc.text('Shipping', 325, doc.y, { width: 125, align: 'right' });
      doc.text(rs(shipping), 455, doc.y - 11, { width: 90, align: 'right' });
      doc.moveDown(0.3);
    }

    doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a1a1a');
    doc.text('Total', 325, doc.y, { width: 125, align: 'right' });
    doc.text(rs(grandTotal), 455, doc.y - 14, { width: 90, align: 'right' });
    doc.moveDown(0.35);

    const isPaid = order.payment_status === 'paid';
    doc.fontSize(9).font(isPaid ? 'Helvetica' : 'Helvetica-Bold')
       .fillColor(isPaid ? '#3E9142' : '#C0392B');
    doc.text(isPaid ? 'Received' : 'Amount Due', 325, doc.y, { width: 125, align: 'right' });
    doc.text(rs(grandTotal), 455, doc.y - 11, { width: 90, align: 'right' });
    doc.moveDown(1.2);

    // --- Dispatch details ---
    if (order.courier_name || order.tracking_id) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1a1a1a').text('Dispatch Details', 50, doc.y);
      doc.font('Helvetica').fillColor('#555');
      if (order.courier_name) doc.text(`Courier: ${pdfSafe(order.courier_name)}`, 50, doc.y);
      if (order.tracking_id)  doc.text(`Tracking ID: ${pdfSafe(order.tracking_id)}`, 50, doc.y);
      doc.moveDown(0.8);
    }

    // --- Terms & footer ---
    if (biz.terms) {
      doc.fontSize(7.5).font('Helvetica').fillColor('#555');
      doc.text(pdfSafe(biz.terms), 50, doc.y, { width: 495, align: 'left' });
      doc.moveDown(0.5);
    }
    if (biz.footer) {
      doc.fontSize(8).fillColor('#667').text(pdfSafe(biz.footer), 50, doc.y, { width: 495 });
    }

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
    .select('*, dispatch_email_sent')
    .eq('id', order_id)
    .maybeSingle();

  if (orderErr || !order) {
    console.error(`[${istNow()}] Order not found:`, orderErr);
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.dispatch_email_sent) {
    console.log(`[${istNow()}] Dispatch email already sent for order ${order.order_number}`);
    return res.status(200).json({ success: true, message: 'Email already sent' });
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('product_name, quantity, price, color, size')
    .eq('order_id', order.id);

  const orderItems = items || [];

  console.log(`[${istNow()}] Sending dispatch email to:`, order.customer_email);

  // Business details for the invoice come from Admin → Settings → Invoice,
  // so the owner controls them without a code change.
  const { data: invoiceRows } = await supabase
    .from('site_settings')
    .select('setting_key, setting_value')
    .eq('category', 'invoice');

  const setting = (key: string, fallback = '') =>
    invoiceRows?.find((r) => r.setting_key === key)?.setting_value || fallback;

  const biz = {
    name:    setting('invoice_business_name', 'HELMET HUB'),
    address: setting('invoice_address', ''),
    state:   setting('invoice_state', ''),
    phone:   setting('invoice_phone', ''),
    email:   setting('invoice_email', 'support@helmethub.in'),
    gstin:   setting('invoice_gstin', ''),
    terms:   setting('invoice_terms', ''),
    footer:  setting('invoice_footer_note', ''),
  };

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateInvoicePDF(order, orderItems, biz);
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
      .update({ dispatch_email_sent: true })
      .eq('id', order.id);

    return res.status(200).json({ success: true });
  } catch (emailErr: any) {
    console.error(`[${istNow()}] Email sending failed:`, emailErr?.message || emailErr);
    return res.status(500).json({ error: emailErr?.message || 'Failed to send email' });
  }
}
