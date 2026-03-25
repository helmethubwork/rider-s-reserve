import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_URL =
  process.env.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com'
    : 'https://sandbox.cashfree.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const orderId = req.query.order_id as string;

  if (!orderId || typeof orderId !== 'string' || orderId.length > 100) {
    return res.status(400).json({ error: 'Invalid order_id', status: 'FAILED' });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) {
    console.error('Cashfree credentials not configured');
    return res.status(500).json({ error: 'Payment service not configured', status: 'FAILED' });
  }

  try {
    const response = await fetch(`${BASE_URL}/pg/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree verify error');
      return res.status(200).json({ status: 'FAILED', order_id: orderId });
    }

    const paymentStatus = data.order_status === 'PAID' ? 'PAID' : 'FAILED';

    return res.status(200).json({
      status: paymentStatus,
      order_id: orderId,
      order_amount: data.order_amount,
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return res.status(200).json({ status: 'FAILED', order_id: orderId });
  }
}
