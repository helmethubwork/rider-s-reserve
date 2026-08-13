import { load } from "@cashfreepayments/cashfree-js";

const CASHFREE_MODE = import.meta.env.VITE_CASHFREE_ENV === "production" ? "production" : "sandbox";

// The SDK is a network download. Kick it off as soon as the checkout page opens
// so it is already in memory by the time the customer taps Pay Now, instead of
// starting the download only after the order APIs have finished.
let sdkPromise: ReturnType<typeof load> | null = null;

export const preloadCashfree = () => {
  if (!sdkPromise) {
    sdkPromise = load({ mode: CASHFREE_MODE });
  }
  return sdkPromise;
};

export const startCashfreePayment = async (orderData: any) => {
  // Reuses the preloaded instance when available; falls back to loading now.
  const cashfree = await preloadCashfree();

  cashfree.checkout({
    paymentSessionId: orderData.payment_session_id,
    redirectTarget: "_self",
  });
};
