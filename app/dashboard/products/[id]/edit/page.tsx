import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductActions } from "@/components/products/product-actions";
import { ProductForm } from "@/components/products/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentBusiness, getProduct } from "@/lib/data/queries";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [business, product] = await Promise.all([getCurrentBusiness(), getProduct(id)]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit produk" description={product.name} />
      <ProductForm businessId={business?.id ?? ""} product={product} />
      <Card>
        <CardHeader>
          <CardTitle>Aksi produk</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-muted-foreground">
            Nonaktifkan produk untuk menghapusnya dari katalog dan chatbot tanpa merusak riwayat order.
          </p>
          <ProductActions
            productId={product.id}
            productName={product.name}
            isActive={product.is_active}
            showEdit={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
