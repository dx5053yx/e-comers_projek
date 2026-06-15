import Image from "next/image";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductActions } from "@/components/products/product-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getCurrentBusinessAccess, getProducts } from "@/lib/data/queries";
import { formatCurrency } from "@/lib/utils";

export default async function ProductsPage() {
  const access = await getCurrentBusinessAccess();
  const business = access.business;
  const readOnly = access.role === "VIEWER";
  const products = await getProducts(business?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product management"
        description="Kelola produk, varian, harga, status, dan stok dasar."
        action={readOnly ? undefined : { label: "Tambah produk", href: "/dashboard/products/new" }}
      />
      <Card>
        <CardContent className="p-0">
          <div className="table-scroll border-0">
            <Table>
              <thead>
                <tr>
                  <Th>Foto</Th>
                  <Th>Nama produk</Th>
                  <Th>SKU</Th>
                  <Th>Kategori</Th>
                  <Th>Harga</Th>
                  <Th>Stok total</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <Td>
                      <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                        ) : null}
                      </div>
                    </Td>
                    <Td className="font-medium">{product.name}</Td>
                    <Td>{product.sku ?? "-"}</Td>
                    <Td>{product.category?.name ?? "-"}</Td>
                    <Td>{formatCurrency(product.price)}</Td>
                    <Td>{product.variants?.reduce((sum, variant) => sum + variant.stock, 0) ?? 0}</Td>
                    <Td>
                      <Badge tone={product.is_active ? "green" : "gray"}>
                        {product.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </Td>
                    <Td>
                      <ProductActions
                        productId={product.id}
                        productName={product.name}
                        isActive={product.is_active}
                        readOnly={readOnly}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
