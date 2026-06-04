import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*, order:orders(*, items:order_items(*))")
      .eq("id", id)
      .single();

    if (paymentError) {
      throw paymentError;
    }

    if (payment.status === "PAID") {
      return jsonOk({
        payment,
        message: "Payment sudah PAID, stok tidak dikurangi ulang.",
      });
    }

    const { data, error } = await supabase
      .from("payments")
      .update({
        status: "PAID",
        verified_by: user?.id ?? null,
        verified_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await supabase
      .from("orders")
      .update({ payment_status: "PAID", status: "PROCESSING" })
      .eq("id", payment.order_id);

    const items = (payment.order?.items ?? []) as Array<{
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

      if (Number(variant?.stock ?? 0) < Number(item.quantity)) {
        return jsonError(
          `Stok varian tidak cukup untuk verifikasi payment. Sisa stok ${Number(
            variant?.stock ?? 0,
          )}.`,
          422,
        );
      }

      const nextStock = Math.max(0, Number(variant?.stock ?? 0) - Number(item.quantity));

      await supabase
        .from("product_variants")
        .update({ stock: nextStock })
        .eq("id", item.product_variant_id);

      await supabase.from("inventory_movements").insert({
        business_id: payment.order.business_id,
        product_variant_id: item.product_variant_id,
        type: "OUT",
        quantity: Number(item.quantity),
        note: `Payment verified for ${payment.order.order_code}`,
        created_by: user?.id ?? null,
      });
    }

    return jsonOk({ payment: data });
  } catch (error) {
    return handleRouteError(error);
  }
}
