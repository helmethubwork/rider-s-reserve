import { load } from "@cashfreepayments/cashfree-js";

export const startCashfreePayment = async (orderData: any) => {
  const cashfree = await load({
    mode: "sandbox", // change to production later
  });

  cashfree.checkout({
    paymentSessionId: orderData.payment_session_id,
    redirectTarget: "_self",
  });
};
