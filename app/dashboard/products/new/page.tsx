import { PageHeader } from "@/components/dashboard/page-header";
import { ProductForm } from "@/components/products/product-form";
import { getCurrentBusiness } from "@/lib/data/queries";

export default async function NewProductPage() {
  const business = await getCurrentBusiness();

  return (
    <div className="space-y-6">
      <PageHeader title="Tambah produk" description="Input produk, varian default, dan stok awal." />
      <ProductForm businessId={business?.id ?? ""} />
    </div>
  );
}
