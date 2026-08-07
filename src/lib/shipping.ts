export function getShippingCost(cartTotal: number): number {
  if (cartTotal >= 2000) return 0;
  if (cartTotal >= 1000) return 100;
  return 200;
}

export function getShippingLabel(cartTotal: number): string {
  if (cartTotal >= 2000) return "FREE";
  if (cartTotal >= 1000) return "₹100";
  return "₹200";
}

export const SHIPPING_INFO_LINES = [
  "Free shipping on prepaid orders above ₹2,000",
  "₹100 shipping for orders ₹1,000–₹1,999",
  "₹200 shipping for orders below ₹1,000",
] as const;
