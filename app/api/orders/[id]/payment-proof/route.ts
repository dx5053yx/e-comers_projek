import { z } from "zod";
import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

const paymentProofSchema = z.object({
  proof_url: z.string().url(),
  note: z.string().optional().nullable(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const { id } = await context.params;
    const input = await parseJson(request, paymentProofSchema);
    const supabase = createSupabaseAdminClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("grand_total")
      .eq("id", id)
      .single();

    if (orderError) {
      throw orderError;
    }

    const { data, error } = await supabase
      .from("payments")
      .upsert(
        {
          order_id: id,
          amount: order.grand_total,
          status: "PENDING",
          proof_url: input.proof_url,
          note: input.note,
        },
        { onConflict: "order_id" },
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return jsonOk({ payment: data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
