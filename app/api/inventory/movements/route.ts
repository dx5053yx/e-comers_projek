import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { inventoryMovementSchema } from "@/lib/validations/schemas";

export async function GET(request: Request) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonOk({ movements: [], demo: true });
    }

    const { searchParams } = new URL(request.url);
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("inventory_movements")
      .select("*, product_variant:product_variants(*)")
      .order("created_at", { ascending: false });

    const businessId = searchParams.get("businessId");
    if (businessId) {
      query = query.eq("business_id", businessId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return jsonOk({ movements: data ?? [], demo: false });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const input = await parseJson(request, inventoryMovementSchema);
    const supabase = await createSupabaseServerClient();
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("stock")
      .eq("id", input.product_variant_id)
      .single();

    if (variantError) {
      throw variantError;
    }

    const currentStock = Number(variant.stock ?? 0);
    const nextStock =
      input.type === "ADJUSTMENT"
        ? input.quantity
        : input.type === "IN" || input.type === "ORDER_CANCELLED"
          ? currentStock + Math.abs(input.quantity)
          : Math.max(0, currentStock - Math.abs(input.quantity));

    const { error: updateError } = await supabase
      .from("product_variants")
      .update({ stock: nextStock })
      .eq("id", input.product_variant_id);

    if (updateError) {
      throw updateError;
    }

    const { data, error } = await supabase
      .from("inventory_movements")
      .insert(input)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return jsonOk({ movement: data, stock: nextStock }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
