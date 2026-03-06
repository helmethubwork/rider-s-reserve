export function getShippingCost(cartTotal: number): number {
  if (cartTotal >= 2000) return 0;
  if (cartTotal >= 1000) return 99;
  return 200;
}

export function getShippingLabel(cartTotal: number): string {
  if (cartTotal >= 2000) return "FREE";
  if (cartTotal >= 1000) return "₹99";
  return "₹200";
}

export const SHIPPING_INFO_LINES = [
  "Free shipping on orders above ₹2,000",
  "₹99 shipping for orders ₹1,000–₹1,999",
  "₹200 shipping for orders below ₹1,000",
] as const;
