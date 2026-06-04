import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductForm } from "@/components/products/product-form";
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
    </div>
  );
}
