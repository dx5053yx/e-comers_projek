import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { getProducts, isDemoMode } from "@/lib/data/queries";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const products = await getProducts(searchParams.get("businessId") ?? undefined);

  return jsonOk({ products, demo: isDemoMode() });
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const input = await parseJson(request, productSchema);
    const { variants, ...productInput } = input;
    const supabase = await createSupabaseServerClient();
    const { data: product, error } = await supabase
      .from("products")
      .insert(productInput)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    if (variants.length > 0) {
      const { error: variantError } = await supabase.from("product_variants").insert(
        variants.map((variant) => ({
          ...variant,
          product_id: product.id,
        })),
      );

      if (variantError) {
        throw variantError;
      }
    }

    return jsonOk({ product }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
