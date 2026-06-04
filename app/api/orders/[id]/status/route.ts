import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { orderStatusSchema } from "@/lib/validations/schemas";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const { id } = await context.params;
    const input = await parseJson(request, orderStatusSchema);
    const supabase = await createSupabaseServerClient();
    const { data: current, error: currentError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", id)
      .single();

    if (currentError) {
      throw currentError;
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status: input.status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await supabase.from("order_status_logs").insert({
      order_id: id,
      old_status: current.status,
      new_status: input.status,
      note: input.note,
    });

    return jsonOk({ order: data });
  } catch (error) {
    return handleRouteError(error);
  }
}
