import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import PDFDocument from 'pdfkit';

/**
 * Send Dispatch Email API
 *
 * Called by admin when tracking info is added.
 * Generates an invoice PDF in memory and sends it via Resend.
 * Ensures only one email per order using the email_sent flag.
 *
 * Required env vars:
 *   RESEND_API_KEY
 *   SUPABASE_URL or VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const istNow = () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

function generateInvoicePDF(order: any, items: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('HELMET HUB', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('www.helmethub.in', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
    doc.moveDown(1);

    // Divider
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Order info
    doc.fontSize(10).font('Helvetica-Bold').text('Order Details');
    doc.fontSize(9).font('Helvetica');
    doc.text(`Order ID: ${order.order_number}`);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    doc.text(`Payment Status: ${order.payment_status?.toUpperCase()}`);
    if (order.courier_name) doc.text(`Courier: ${order.courier_name}`);
    if (order.tracking_id) doc.text(`Tracking ID: ${order.tracking_id}`);
    doc.moveDown(1);

    // Customer info
    doc.fontSize(10).font('Helvetica-Bold').text('Bill To');
    doc.fontSize(9).font('Helvetica');
    doc.text(order.customer_name || 'Guest');
    if (order.customer_email) doc.text(order.customer_email);
    if (order.customer_phone) doc.text(order.customer_phone);
    doc.moveDown(0.5);

    // Shipping address
    const shippingAddr = order.shipping_address || [
      order.delivery_address,
      order.delivery_city,
      order.delivery_state,
      order.delivery_pincode,
    ].filter(Boolean).join(', ');
    doc.fontSize(10).font('Helvetica-Bold').text('Ship To');
    doc.fontSize(9).font('Helvetica').text(shippingAddr || 'N/A');
    doc.moveDown(1);

    // Items table header
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);
    const tableTop = doc.y;
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Product', 50, tableTop, { width: 220 });
    doc.text('Variant', 270, tableTop, { width: 80 });
    doc.text('Qty', 350, tableTop, { width: 40, align: 'center' });
    doc.text('Price', 390, tableTop, { width: 70, align: 'right' });
    doc.text('Total', 470, tableTop, { width: 75, align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);

    // Items
    doc.font('Helvetica').fontSize(9);
    let subtotal = 0;
    for (const item of items) {
      const y = doc.y;
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      const variant = [item.color, item.size].filter(Boolean).join(' / ') || '-';
      doc.text(item.product_name, 50, y, { width: 220 });
      doc.text(variant, 270, y, { width: 80 });
      doc.text(String(item.quantity), 350, y, { width: 40, align: 'center' });
      doc.text(`₹${item.price.toFixed(2)}`, 390, y, { width: 70, align: 'right' });
      doc.text(`₹${lineTotal.toFixed(2)}`, 470, y, { width: 75, align: 'right' });
      doc.moveDown(0.5);
    }

    // Total
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text(`Total: ₹${(order.total_amount ?? subtotal).toFixed(2)}`, 390, doc.y, { width: 155, align: 'right' });
    doc.moveDown(2);

    // Footer
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

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log(`[${istNow()}] RESEND_API_KEY loaded:`, !!RESEND_API_KEY);

  if (!RESEND_API_KEY || !supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Server misconfigured — missing env vars' });
  }

  const { order_id } = req.body;
  if (!order_id) {
    return res.status(400).json({ error: 'Missing order_id' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .maybeSingle();

  if (orderErr || !order) {
    console.error(`[${istNow()}] Order not found:`, orderErr);
    return res.status(404).json({ error: 'Order not found' });
  }

  // Check if email already sent
  if (order.email_sent) {
    console.log(`[${istNow()}] Email already sent for order ${order.order_number}`);
    return res.status(200).json({ success: true, message: 'Email already sent' });
  }

  // Fetch order items
  const { data: items } = await supabase
    .from('order_items')
    .select('product_name, quantity, price, color, size')
    .eq('order_id', order.id);

  const orderItems = items || [];

  console.log(`[${istNow()}] Sending dispatch email to:`, order.customer_email);

  // Generate invoice PDF
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateInvoicePDF(order, orderItems);
    console.log(`[${istNow()}] Invoice PDF generated (${pdfBuffer.length} bytes)`);
  } catch (pdfErr) {
    console.error(`[${istNow()}] PDF generation failed:`, pdfErr);
    return res.status(500).json({ error: 'Failed to generate invoice' });
  }

  // Build tracking link
  const trackingLink = order.courier_name?.toLowerCase().includes('delhivery')
    ? `https://www.delhivery.com/track/package/${order.tracking_id}`
    : order.courier_name?.toLowerCase().includes('bluedart')
    ? `https://www.bluedart.com/tracking/${order.tracking_id}`
    : order.courier_name?.toLowerCase().includes('dtdc')
    ? `https://www.dtdc.in/tracking/${order.tracking_id}`
    : order.courier_name?.toLowerCase().includes('ekart')
    ? `https://ekartlogistics.com/track/${order.tracking_id}`
    : `https://www.google.com/search?q=${encodeURIComponent((order.courier_name || '') + ' tracking ' + (order.tracking_id || ''))}`;

  const shippingAddress = order.shipping_address || [
    order.delivery_address,
    order.delivery_city,
    order.delivery_state,
    order.delivery_pincode,
  ].filter(Boolean).join(', ');

  const productLines = orderItems
    .map((p: any) => `<li>${p.product_name} (Qty: ${p.quantity}) — ₹${(p.price * p.quantity).toFixed(2)}</li>`)
    .join('');

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
      <h2 style="color:#e65100;">Your Order Has Been Dispatched! 🚚</h2>
      <p>Hello <strong>${order.customer_name || 'Customer'}</strong>,</p>
      <p>Great news! Your order <strong>${order.order_number}</strong> has been shipped.</p>
      
      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f9f9f9;border-radius:8px;">
        <tr><td style="padding:12px;color:#666;border-bottom:1px solid #eee;">Order ID</td><td style="padding:12px;font-weight:600;border-bottom:1px solid #eee;">${order.order_number}</td></tr>
        <tr><td style="padding:12px;color:#666;border-bottom:1px solid #eee;">Courier</td><td style="padding:12px;font-weight:600;border-bottom:1px solid #eee;">${order.courier_name || 'N/A'}</td></tr>
        <tr><td style="padding:12px;color:#666;border-bottom:1px solid #eee;">Tracking ID</td><td style="padding:12px;font-weight:600;border-bottom:1px solid #eee;">${order.tracking_id || 'N/A'}</td></tr>
        <tr><td style="padding:12px;color:#666;">Total Amount</td><td style="padding:12px;font-weight:600;">₹${Number(order.total_amount).toFixed(2)}</td></tr>
      </table>

      <p><a href="${trackingLink}" style="display:inline-block;background:#e65100;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;">Track Your Order →</a></p>

      <h3 style="margin-bottom:8px;">Products</h3>
      <ul style="background:#f5f5f5;padding:12px 12px 12px 28px;border-radius:6px;font-size:14px;">${productLines}</ul>
      
      <h3 style="margin-bottom:8px;">Shipping Address</h3>
      <p style="background:#f5f5f5;padding:12px;border-radius:6px;">${shippingAddress}</p>
      
      <p style="font-size:13px;color:#888;margin-top:16px;">Your invoice is attached as a PDF to this email.</p>
      
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p>Thank you for shopping with <strong>HelmetHub</strong>.</p>
    </div>
  `;

  // Send email with PDF attachment
  try {
    const resend = new Resend(RESEND_API_KEY);

    const data = await resend.emails.send({
      from: 'HelmetHub <orders@helmethub.in>',
      to: [order.customer_email],
      subject: `Your Order ${order.order_number} Has Been Shipped! 🚚`,
      html: htmlContent,
      attachments: [
        {
          filename: `Invoice-${order.order_number}.pdf`,
          content: pdfBuffer.toString('base64'),
          content_type: 'application/pdf',
        },
      ],
    });

    console.log(`[${istNow()}] Dispatch email sent:`, JSON.stringify(data));

    // Mark email_sent = true
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
