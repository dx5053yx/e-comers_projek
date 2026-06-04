import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { getProduct } from "@/lib/data/queries";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations/schemas";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const product = await getProduct(id);

  if (!product) {
    return jsonError("Produk tidak ditemukan.", 404);
  }

  return jsonOk({ product });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSupabaseServerConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const { id } = await context.params;
    const input = await parseJson(request, productSchema.partial());
    const { variants, ...productInput } = input;
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .update(productInput)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    if (variants?.length) {
      for (const variant of variants) {
        if (variant.id) {
          await supabase.from("product_variants").update(variant).eq("id", variant.id);
        } else {
          await supabase.from("product_variants").insert({ ...variant, product_id: id });
        }
      }
    }

    return jsonOk({ product: data });
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
      .from("products")
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
