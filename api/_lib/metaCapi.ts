/**
 * Meta Conversions API (server-side event forwarding)
 *
 * Optional companion to the browser pixel in index.html. When META_CAPI_TOKEN
 * is set, this sends a duplicate copy of key events (currently: Purchase)
 * directly from Vercel to Meta's Graph API — a backup signal that survives
 * ad blockers and doesn't depend on the customer's browser.
 *
 * Deduplication with the browser pixel: both send the same `event_id`
 * (the order number). Meta matches them and only counts the event once —
 * see trackPurchase() in src/lib/analytics.ts for the browser side.
 *
 * This file lives under api/_lib/ (underscore prefix) so Vercel does NOT
 * treat it as its own serverless function/route — it doesn't count against
 * the Hobby plan's 12-function limit. Only files directly under api/ do.
 */

import crypto from 'crypto';

const GRAPH_API_VERSION = 'v21.0';

const sha256 = (value: string) =>
  crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');

interface PurchaseEventInput {
  orderId: string;
  value: number;
  email?: string;
  phone?: string; // 10-digit Indian mobile number, no country code
}

/**
 * Fire-and-forget: send a server-side Purchase event to Meta. Never throws —
 * logs and returns silently on any failure or missing config, so a Meta
 * outage or misconfiguration can never break order processing.
 */
export async function sendMetaPurchaseEvent({ orderId, value, email, phone }: PurchaseEventInput): Promise<void> {
  const accessToken = process.env.META_CAPI_TOKEN;
  const pixelId = process.env.VITE_META_PIXEL_ID;

  if (!accessToken || !pixelId) {
    // Server-side forwarding not configured — the browser pixel's own
    // Purchase event (see analytics.ts) is all that fires. This is a
    // perfectly valid, complete setup on its own; log at debug level so
    // "nothing sent" reads as intentional, not a silent failure, when
    // checking Vercel logs.
    console.log(
      `[meta-capi] Skipped for order ${orderId} — ${!accessToken ? 'META_CAPI_TOKEN' : 'VITE_META_PIXEL_ID'} not set`
    );
    return;
  }

  const userData: Record<string, string[]> = {};
  if (email) userData.em = [sha256(email)];
  if (phone) userData.ph = [sha256(`91${phone}`)]; // Meta expects country code included in the hash

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: orderId, // must match the browser pixel's eventID for dedup
        action_source: 'website',
        event_source_url: 'https://www.helmethub.in/payment-status',
        user_data: userData,
        custom_data: {
          currency: 'INR',
          value,
        },
      },
    ],
  };

  // Only present while testing in Events Manager's Test Events tab —
  // remove META_TEST_EVENT_CODE from Vercel once confirmed working.
  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const body = await res.text();
    if (!res.ok) {
      console.error(`[meta-capi] Purchase event failed for order ${orderId}: HTTP ${res.status} — ${body.slice(0, 300)}`);
    } else {
      console.log(`[meta-capi] Purchase event sent for order ${orderId}`);
    }
  } catch (err) {
    console.error(`[meta-capi] Purchase event error for order ${orderId}:`, err);
  }
}
