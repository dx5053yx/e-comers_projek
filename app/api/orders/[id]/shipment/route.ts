import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { shipmentSchema } from "@/lib/validations/schemas";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const { id } = await context.params;
    const input = await parseJson(request, shipmentSchema);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("shipments")
      .upsert(
        {
          order_id: id,
          ...input,
          shipped_at: input.status === "SHIPPED" ? new Date().toISOString() : null,
          delivered_at: input.status === "DELIVERED" ? new Date().toISOString() : null,
        },
        { onConflict: "order_id" },
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    if (input.status === "SHIPPED") {
      await supabase.from("orders").update({ status: "SHIPPED" }).eq("id", id);
    } else if (input.status === "DELIVERED") {
      await supabase.from("orders").update({ status: "COMPLETED" }).eq("id", id);
    }

    return jsonOk({ shipment: data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
