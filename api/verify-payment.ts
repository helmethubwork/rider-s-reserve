import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Verify Payment API
 *
 * Checks the payment status of a Cashfree order by order_id.
 * Called by the frontend PaymentStatus page after redirect.
 *
 * Required env vars:
 *   CASHFREE_APP_ID
 *   CASHFREE_SECRET_KEY
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const orderId = req.query.order_id as string;

  if (!orderId) {
    return res.status(400).json({ error: 'Missing order_id', status: 'FAILED' });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) {
    console.error('Cashfree credentials not configured');
    return res.status(500).json({ error: 'Payment service not configured', status: 'FAILED' });
  }

  try {
    const response = await fetch(`https://sandbox.cashfree.com/pg/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree verify error:', data);
      return res.status(200).json({ status: 'FAILED', order_id: orderId });
    }

    // Cashfree order_status: ACTIVE, PAID, EXPIRED
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
