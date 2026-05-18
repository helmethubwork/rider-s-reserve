import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const schema = z.object({
  orderId:       z.string().min(1).max(100),
  // orderAmount is accepted for the request shape but ignored — the authoritative
  // amount is fetched from the database to prevent client-side price manipulation (C6)
  orderAmount:   z.number().positive().max(100000).optional(),
  customerId:    z.string().min(1).max(200),
  customerName:  z.string().max(200).optional().default(''),
  customerEmail: z.string().email(),
  customerPhone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
});

const BASE_URL =
  process.env.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com'
    : 'https://sandbox.cashfree.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { orderId, customerId, customerName, customerEmail, customerPhone } = parsed.data;

  const appId          = process.env.CASHFREE_APP_ID;
  const secretKey      = process.env.CASHFREE_SECRET_KEY;
  const supabaseUrl    = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!appId || !secretKey) {
    console.error('Cashfree credentials not configured');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase credentials not configured');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // --- Fetch the authoritative order amount from the database (C6) ---
  // Never trust the client-supplied orderAmount — an attacker could set it to ₹1.
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('order_number', orderId)
    .maybeSingle();

  if (orderErr) {
    console.error('Failed to look up order:', orderErr);
    return res.status(500).json({ error: 'Internal server error' });
  }

  if (!order) {
    return res.status(400).json({ error: 'Order not found — create the order record before initiating payment' });
  }

  const orderAmount = Number(order.total_amount);
  if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
    console.error('Order has invalid total_amount:', order.total_amount);
    return res.status(400).json({ error: 'Order amount is invalid' });
  }
  // --- End amount verification ---

  try {
    const response = await fetch(`${BASE_URL}/pg/orders`, {
      method: 'POST',
      headers: {
        'x-client-id':     appId,
        'x-client-secret': secretKey,
        'x-api-version':   '2023-08-01',
        'Content-Type':    'application/json',
      },
      body: JSON.stringify({
        order_id:     orderId,
        order_amount: orderAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id:    customerId,
          customer_name:  customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: `https://www.helmethub.in/payment-status?order_id=${encodeURIComponent(orderId)}`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree API error:', data);
      return res.status(response.status).json({ error: data.message || 'Failed to create order' });
    }

    return res.status(200).json({
      payment_session_id: data.payment_session_id,
    });
  } catch (error) {
    console.error('Cashfree order creation failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
