import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const { id } = await context.params;
    const payload = await request.json().catch(() => null);

    if (!payload || typeof payload.is_active !== "boolean") {
      return jsonError("Data voucher tidak valid.", 422);
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("vouchers")
      .update({ is_active: payload.is_active })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return jsonOk({ voucher: data });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("vouchers")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      throw error;
    }

    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
