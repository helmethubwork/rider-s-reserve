import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl        = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey    = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const sheetWebhookUrl    = process.env.GOOGLE_SHEET_WEBHOOK_URL;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // Admin auth check
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

  const { order_id } = req.body;
  if (!order_id || !UUID_RE.test(String(order_id))) {
    return res.status(400).json({ error: 'Invalid order_id' });
  }

  // Fetch latest order data
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('order_number, customer_name, customer_email, customer_phone, total_amount, payment_status')
    .eq('id', order_id)
    .maybeSingle();

  if (orderErr || !order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (!sheetWebhookUrl) {
    return res.status(200).json({ success: true, message: 'No sheet webhook configured' });
  }

  try {
    const payload = JSON.stringify({
      order_id:       order.order_number,
      customer_name:  order.customer_name,
      email:          order.customer_email,
      phone:          order.customer_phone,
      amount:         order.total_amount,
      payment_status: order.payment_status,
      timestamp:      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });

    const initRes = await fetch(sheetWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      redirect: 'manual',
    });

    if (initRes.status >= 300 && initRes.status < 400) {
      const location = initRes.headers.get('location');
      if (location) {
        await fetch(location, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[sync-order-sheet] Failed:', err?.message || err);
    return res.status(500).json({ error: 'Failed to sync to sheet' });
  }
}
