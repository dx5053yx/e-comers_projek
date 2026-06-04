import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { businessSchema } from "@/lib/validations/schemas";

export async function POST(request: Request) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const input = await parseJson(request, businessSchema);
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonError("Unauthorized.", 401);
    }

    const { data: business, error } = await supabase
      .from("businesses")
      .insert({ ...input, owner_id: user.id })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await supabase.from("business_members").insert({
      business_id: business.id,
      user_id: user.id,
      role: "OWNER",
    });

    return jsonOk({ business }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
