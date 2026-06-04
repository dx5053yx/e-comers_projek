import { jsonOk } from "@/lib/api";
import { getOrders, isDemoMode } from "@/lib/data/queries";

export async function GET() {
  const orders = await getOrders();
  const totals = new Map<string, { product_name: string; quantity: number; sales: number }>();

  for (const order of orders) {
    for (const item of order.items ?? []) {
      const current = totals.get(item.product_name) ?? {
        product_name: item.product_name,
        quantity: 0,
        sales: 0,
      };

      current.quantity += item.quantity;
      current.sales += item.total;
      totals.set(item.product_name, current);
    }
  }

  return jsonOk({
    products: Array.from(totals.values()).sort((a, b) => b.quantity - a.quantity),
    demo: isDemoMode(),
  });
}
