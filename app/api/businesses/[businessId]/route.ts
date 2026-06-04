import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { businessSchema } from "@/lib/validations/schemas";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ businessId: string }> },
) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const { businessId } = await context.params;
    const input = await parseJson(request, businessSchema.partial());
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("businesses")
      .update(input)
      .eq("id", businessId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return jsonOk({ business: data });
  } catch (error) {
    return handleRouteError(error);
  }
}
