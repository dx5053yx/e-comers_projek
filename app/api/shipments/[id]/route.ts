import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { shipmentSchema } from "@/lib/validations/schemas";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const { id } = await context.params;
    const input = await parseJson(request, shipmentSchema.partial());
    const patch = {
      ...input,
      shipped_at: input.status === "SHIPPED" ? new Date().toISOString() : undefined,
      delivered_at: input.status === "DELIVERED" ? new Date().toISOString() : undefined,
    };
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("shipments")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    if (input.status === "DELIVERED") {
      await supabase.from("orders").update({ status: "COMPLETED" }).eq("id", data.order_id);
    } else if (input.status === "SHIPPED") {
      await supabase.from("orders").update({ status: "SHIPPED" }).eq("id", data.order_id);
    }

    return jsonOk({ shipment: data });
  } catch (error) {
    return handleRouteError(error);
  }
}
