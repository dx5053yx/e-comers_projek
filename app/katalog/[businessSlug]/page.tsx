import Image from "next/image";
import { notFound } from "next/navigation";
import { CatalogOrderForm } from "@/components/orders/catalog-order-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoBusiness, demoProducts } from "@/lib/data/demo";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { Business, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

async function getPublicCatalog(slug: string) {
  if (!isSupabaseAdminConfigured()) {
    return slug === demoBusiness.slug
      ? { business: demoBusiness, products: demoProducts }
      : null;
  }

  const supabase = createSupabaseAdminClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!business) {
    return null;
  }

  const { data: products } = await supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .eq("business_id", business.id)
    .eq("is_active", true);

  return {
    business: business as Business,
    products: (products ?? []).map((product) => ({
      ...(product as Product),
      price: Number(product.price ?? 0),
    })) as Product[],
  };
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;
  const catalog = await getPublicCatalog(businessSlug);

  if (!catalog) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card py-10">
        <div className="container-page">
          <p className="text-sm font-medium text-primary">Katalog UMKM</p>
          <h1 className="mt-2 text-3xl font-semibold">{catalog.business.name}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{catalog.business.description}</p>
        </div>
      </section>
      <section className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {catalog.products.map((product) => (
            <Card key={product.id}>
              <div className="relative h-44 rounded-t-lg bg-muted">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Foto produk
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
                  <Badge tone="green">Ready</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <CatalogOrderForm business={catalog.business} products={catalog.products} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
