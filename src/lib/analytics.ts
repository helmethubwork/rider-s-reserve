// Analytics — Google Analytics 4 (gtag) + Meta Pixel (fbq).
// GA only loads in production and reads VITE_GA_ID.
// Meta Pixel's base code is loaded unconditionally from index.html <head>
// (fbq is a global by the time React mounts), so every tracking call here
// also mirrors the same event to Meta — one call site, both platforms.

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    fbq: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;
const isProduction = import.meta.env.PROD;

let initialized = false;

// Fire a Meta Pixel event, but only in production and only if fbq actually
// loaded (defensive — e.g. an ad blocker may have stripped the pixel script).
function fbTrack(event: string, params?: Record<string, unknown>) {
  if (!isProduction) return;
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', event, params);
}

export function initGA() {
  if (!isProduction || !GA_ID || initialized) return;
  initialized = true;

  // Load gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });
}

export function trackPageView(path: string) {
  if (!isProduction || !GA_ID) return;
  window.gtag?.('event', 'page_view', { page_path: path });
  // Meta's base pixel code already fires a PageView of its own on initial
  // load (see index.html), so client-side route changes are not re-sent
  // here to avoid double-counting PageView in Ads Manager.
}

export function trackProductView(product: { id: string; name: string; price: number; category?: string }) {
  if (isProduction && GA_ID) {
    window.gtag?.('event', 'view_item', {
      currency: 'INR',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category,
      }],
    });
  }
  fbTrack('ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'INR',
  });
}

export function trackAddToCart(product: { id: string; name: string; price: number; quantity?: number }) {
  const quantity = product.quantity || 1;
  if (isProduction && GA_ID) {
    window.gtag?.('event', 'add_to_cart', {
      currency: 'INR',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity,
      }],
    });
  }
  fbTrack('AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * quantity,
    currency: 'INR',
  });
}

export function trackBeginCheckout(items: { id: string; name: string; price: number; quantity: number }[], total: number) {
  if (isProduction && GA_ID) {
    window.gtag?.('event', 'begin_checkout', {
      currency: 'INR',
      value: total,
      items: items.map(i => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    });
  }
  fbTrack('InitiateCheckout', {
    content_ids: items.map(i => i.id),
    contents: items.map(i => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value: total,
    currency: 'INR',
  });
}

// Fired once, right after a payment is confirmed successful — see PaymentStatus.tsx.
export function trackPurchase(orderId: string, items: { id: string; name: string; price: number; quantity: number }[], total: number) {
  if (isProduction && GA_ID) {
    window.gtag?.('event', 'purchase', {
      transaction_id: orderId,
      currency: 'INR',
      value: total,
      items: items.map(i => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    });
  }
  fbTrack('Purchase', {
    content_ids: items.map(i => i.id),
    contents: items.map(i => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value: total,
    currency: 'INR',
  });
}

// Fired when the contact form is successfully submitted — see ContactPage.tsx.
export function trackLead(source: string = 'contact_form') {
  if (isProduction && GA_ID) {
    window.gtag?.('event', 'generate_lead', { source });
  }
  fbTrack('Lead', { content_name: source });
}

// Fired right after a new account is created — see AuthPage.tsx.
export function trackCompleteRegistration() {
  if (isProduction && GA_ID) {
    window.gtag?.('event', 'sign_up', { method: 'email' });
  }
  fbTrack('CompleteRegistration', { content_name: 'email' });
}
