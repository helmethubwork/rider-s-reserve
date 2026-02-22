// Google Analytics 4 integration
// Only loads in production. Uses VITE_GA_ID env var.

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;
const isProduction = import.meta.env.PROD;

let initialized = false;

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
}

export function trackProductView(product: { id: string; name: string; price: number; category?: string }) {
  if (!isProduction || !GA_ID) return;
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

export function trackAddToCart(product: { id: string; name: string; price: number; quantity?: number }) {
  if (!isProduction || !GA_ID) return;
  window.gtag?.('event', 'add_to_cart', {
    currency: 'INR',
    value: product.price * (product.quantity || 1),
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      quantity: product.quantity || 1,
    }],
  });
}

export function trackBeginCheckout(items: { id: string; name: string; price: number; quantity: number }[], total: number) {
  if (!isProduction || !GA_ID) return;
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
