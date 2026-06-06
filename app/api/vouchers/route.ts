import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { getVouchers, isDemoMode } from "@/lib/data/queries";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { voucherSchema } from "@/lib/validations/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vouchers = await getVouchers(searchParams.get("businessId") ?? undefined);

  return jsonOk({ vouchers, demo: isDemoMode() });
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const input = await parseJson(request, voucherSchema);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("vouchers")
      .insert(input)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return jsonOk({ voucher: data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
