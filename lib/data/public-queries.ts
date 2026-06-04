import { demoBusiness, demoOrders, demoProducts } from "@/lib/data/demo";
import { normalizeOrder } from "@/lib/data/queries";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { Business } from "@/lib/types";

export type PublicBusinessSummary = Pick<
  Business,
  "id" | "name" | "slug" | "category" | "description" | "address" | "whatsapp_number" | "logo_url"
> & {
  product_count: number;
};

function getDemoPublicBusinesses() {
  return [
    {
      id: demoBusiness.id,
      name: demoBusiness.name,
      slug: demoBusiness.slug,
      category: demoBusiness.category,
      description: demoBusiness.description,
      address: demoBusiness.address,
      whatsapp_number: demoBusiness.whatsapp_number,
      logo_url: demoBusiness.logo_url,
      product_count: demoProducts.filter((product) => product.is_active).length,
    },
  ] satisfies PublicBusinessSummary[];
}

export async function getPublicBusinesses() {
  if (!isSupabaseAdminConfigured()) {
    return getDemoPublicBusinesses();
  }

  try {
    const supabase = createSupabaseAdminClient();
    const [{ data: businesses, error: businessError }, { data: products, error: productError }] =
      await Promise.all([
        supabase
          .from("businesses")
          .select("id,name,slug,category,description,address,whatsapp_number,logo_url")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(24),
        supabase
          .from("products")
          .select("business_id")
          .eq("is_active", true),
      ]);

    if (businessError) {
      throw businessError;
    }

    if (productError) {
      throw productError;
    }

    const productCounts = new Map<string, number>();

    for (const product of products ?? []) {
      const businessId = String(product.business_id);
      productCounts.set(businessId, (productCounts.get(businessId) ?? 0) + 1);
    }

    return (businesses ?? []).map((business) => ({
      ...(business as PublicBusinessSummary),
      product_count: productCounts.get(String(business.id)) ?? 0,
    }));
  } catch (error) {
    console.warn("Falling back to demo public businesses:", error);
    return getDemoPublicBusinesses();
  }
}

export async function getPublicOrder(idOrCode: string) {
  if (!isSupabaseAdminConfigured()) {
    return (
      demoOrders.find(
        (order) => order.id === idOrCode || order.order_code === idOrCode,
      ) ?? null
    );
  }

  const supabase = createSupabaseAdminClient();
  const query = supabase
    .from("orders")
    .select("*, customer:customers(*), items:order_items(*), payment:payments(*), shipment:shipments(*)");

  const { data, error } = idOrCode.startsWith("SP-")
    ? await query.eq("order_code", idOrCode).maybeSingle()
    : await query.eq("id", idOrCode).maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizeOrder(data) : null;
}
