import { jsonError, jsonOk } from "@/lib/api";
import { getOrder } from "@/lib/data/queries";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const order = await getOrder(id);

  if (!order) {
    return jsonError("Order tidak ditemukan.", 404);
  }

  return jsonOk({ order });
}
