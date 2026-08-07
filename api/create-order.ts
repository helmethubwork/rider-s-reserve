/**
 * POST /api/create-order
 *
 * Creates an order in Supabase using the service-role key so it works for both
 * authenticated users AND guests (anon client is blocked by RLS for guests).
 *
 * Security note: total_amount comes from the client here, but it is re-verified
 * server-side in /api/create-cashfree-order before the payment session is created.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const orderItemSchema = z.object({
  product_id:   z.string().min(1).max(200),
  product_name: z.string().min(1).max(500),
  quantity:     z.number().int().positive().max(100),
  price:        z.number().positive().max(100000),
  color:        z.string().max(100).optional().nullable(),
  size:         z.string().max(50).optional().nullable(),
});

const schema = z.object({
  customer_email:    z.string().email(),
  customer_name:     z.string().min(1).max(200),
  customer_phone:    z.string().max(15).optional().nullable(),
  shipping_address:  z.string().min(1).max(1000),
  delivery_full_name: z.string().max(200).optional().nullable(),
  delivery_phone:    z.string().max(15).optional().nullable(),
  delivery_address:  z.string().max(500).optional().nullable(),
  delivery_city:     z.string().max(100).optional().nullable(),
  delivery_state:    z.string().max(100).optional().nullable(),
  delivery_pincode:  z.string().max(20).optional().nullable(),
  total_amount:      z.number().positive().max(500000),
  user_id:           z.string().uuid().optional().nullable(),
  items:             z.array(orderItemSchema).min(1).max(100),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const input = parsed.data;

  const supabaseUrl     = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase env vars not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // Service-role client bypasses RLS — works for guests and signed-in users alike
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Generate a sequential order number via the existing Postgres function
  const { data: orderNumber, error: rpcError } = await supabase.rpc('next_order_number');
  if (rpcError || !orderNumber) {
    console.error('Failed to generate order number:', rpcError);
    return res.status(500).json({ error: 'Failed to generate order number' });
  }

  // Insert the order row
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number:      orderNumber,
      user_id:           input.user_id || null,
      customer_email:    input.customer_email,
      customer_name:     input.customer_name,
      customer_phone:    input.customer_phone || null,
      shipping_address:  input.shipping_address,
      delivery_full_name: input.delivery_full_name || null,
      delivery_phone:    input.delivery_phone || null,
      delivery_address:  input.delivery_address || null,
      delivery_city:     input.delivery_city || null,
      delivery_state:    input.delivery_state || null,
      delivery_pincode:  input.delivery_pincode || null,
      total_amount:      input.total_amount,
      order_status:      'placed',
      payment_status:    'pending',
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Order creation error:', orderError);
    return res.status(500).json({ error: orderError?.message || 'Failed to create order' });
  }

  // Insert order items
  const orderItems = input.items.map((item) => ({
    order_id:     order.id,
    product_id:   item.product_id,
    product_name: item.product_name,
    quantity:     item.quantity,
    price:        item.price,
    color:        item.color || null,
    size:         item.size || null,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Order items creation error:', itemsError);
    return res.status(500).json({ error: itemsError.message || 'Failed to create order items' });
  }

  return res.status(200).json(order);
}
