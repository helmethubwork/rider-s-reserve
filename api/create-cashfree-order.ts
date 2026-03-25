import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const schema = z.object({
  orderId: z.string().min(1).max(100),
  orderAmount: z.number().positive().max(100000),
  customerId: z.string().min(1).max(200),
  customerName: z.string().max(200).optional().default(''),
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

  const { orderId, orderAmount, customerId, customerName, customerEmail, customerPhone } = parsed.data;

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) {
    console.error('Cashfree credentials not configured');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  try {
    const response = await fetch(`${BASE_URL}/pg/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: `https://www.helmethub.in/payment-status?order_id=${orderId}`,
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
