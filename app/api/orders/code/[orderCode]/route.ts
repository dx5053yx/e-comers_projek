import { jsonError, jsonOk } from "@/lib/api";
import { getPublicOrder } from "@/lib/data/public-queries";

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderCode: string }> },
) {
  const { orderCode } = await context.params;
  const order = await getPublicOrder(orderCode);

  if (!order) {
    return jsonError("Order tidak ditemukan.", 404);
  }

  return jsonOk({ order });
}
