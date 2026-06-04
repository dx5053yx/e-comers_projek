import { z } from "zod";
import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

const rejectSchema = z.object({
  note: z.string().optional().nullable(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const { id } = await context.params;
    const input = await parseJson(request, rejectSchema);
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: currentPayment, error: paymentError } = await supabase
      .from("payments")
      .select("*, order:orders(*, items:order_items(*))")
      .eq("id", id)
      .single();

    if (paymentError) {
      throw paymentError;
    }

    const { data, error } = await supabase
      .from("payments")
      .update({ status: "REJECTED", note: input.note })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await supabase
      .from("orders")
      .update({ payment_status: "REJECTED", status: "PENDING_PAYMENT" })
      .eq("id", data.order_id);

    if (currentPayment.status === "PAID") {
      const items = (currentPayment.order?.items ?? []) as Array<{
        product_variant_id: string | null;
        quantity: number;
      }>;

      for (const item of items) {
        if (!item.product_variant_id) {
          continue;
        }

        const { data: variant } = await supabase
          .from("product_variants")
          .select("stock")
          .eq("id", item.product_variant_id)
          .single();
        const restoredStock = Number(variant?.stock ?? 0) + Number(item.quantity);

        await supabase
          .from("product_variants")
          .update({ stock: restoredStock })
          .eq("id", item.product_variant_id);

        await supabase.from("inventory_movements").insert({
          business_id: currentPayment.order.business_id,
          product_variant_id: item.product_variant_id,
          type: "ORDER_CANCELLED",
          quantity: Number(item.quantity),
          note: `Payment rejected after paid for ${currentPayment.order.order_code}`,
          created_by: user?.id ?? null,
        });
      }
    }

    return jsonOk({ payment: data });
  } catch (error) {
    return handleRouteError(error);
  }
}
