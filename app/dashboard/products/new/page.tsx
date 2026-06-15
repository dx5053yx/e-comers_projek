import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductForm } from "@/components/products/product-form";
import { getCurrentBusinessAccess } from "@/lib/data/queries";

export default async function NewProductPage() {
  const access = await getCurrentBusinessAccess();

  if (access.role === "VIEWER") {
    redirect("/dashboard/products");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tambah produk" description="Input produk, varian default, dan stok awal." />
      <ProductForm businessId={access.business?.id ?? ""} />
    </div>
  );
}
