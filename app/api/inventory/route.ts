import { jsonOk } from "@/lib/api";
import { getProducts, isDemoMode } from "@/lib/data/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const products = await getProducts(searchParams.get("businessId") ?? undefined);
  const inventory = products.flatMap((product) =>
    (product.variants ?? []).map((variant) => ({
      product,
      variant,
      low_stock: variant.stock <= variant.low_stock_threshold,
    })),
  );

  return jsonOk({ inventory, demo: isDemoMode() });
}
