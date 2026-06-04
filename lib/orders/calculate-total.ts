import type { OrderItem } from "@/lib/types";

export function calculateOrderTotal({
  items,
  discountTotal = 0,
  shippingCost = 0,
}: {
  items: Pick<OrderItem, "quantity" | "price">[];
  discountTotal?: number;
  shippingCost?: number;
}) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );
  const grandTotal = Math.max(0, subtotal - discountTotal + shippingCost);

  return {
    subtotal,
    discountTotal,
    shippingCost,
    grandTotal,
  };
}
