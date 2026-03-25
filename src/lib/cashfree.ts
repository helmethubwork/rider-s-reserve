import { load } from "@cashfreepayments/cashfree-js";

const CASHFREE_MODE = import.meta.env.VITE_CASHFREE_ENV === "production" ? "production" : "sandbox";

export const startCashfreePayment = async (orderData: any) => {
  const cashfree = await load({
    mode: CASHFREE_MODE,
  });

  cashfree.checkout({
    paymentSessionId: orderData.payment_session_id,
    redirectTarget: "_self",
  });
};
