import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { getPublicOrder } from "@/lib/data/public-queries";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { reviewSchema } from "@/lib/validations/schemas";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const input = await parseJson(request, reviewSchema);
    const order = await getPublicOrder(id);

    if (!order) {
      return jsonError("Order tidak ditemukan.", 404);
    }

    if (!isSupabaseAdminConfigured()) {
      return jsonOk({ review: { ...input, order_id: order.id }, demo: true }, { status: 201 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        business_id: order.business_id,
        order_id: order.id,
        customer_id: order.customer_id,
        rating: input.rating,
        comment: input.comment,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return jsonOk({ review: data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
