import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getCurrentBusiness, getProducts } from "@/lib/data/queries";

export default async function InventoryPage() {
  const business = await getCurrentBusiness();
  const products = await getProducts(business?.id);
  const rows = products.flatMap((product) =>
    (product.variants ?? []).map((variant) => ({ product, variant })),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Pantau stok real-time sederhana dan low stock warning."
        action={{ label: "Riwayat stok", href: "/dashboard/inventory/movements" }}
      />
      <Card>
        <CardContent className="p-0">
          <div className="table-scroll border-0">
            <Table>
              <thead>
                <tr>
                  <Th>Produk</Th>
                  <Th>Varian</Th>
                  <Th>SKU</Th>
                  <Th>Stok</Th>
                  <Th>Threshold</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ product, variant }) => (
                  <tr key={variant.id}>
                    <Td className="font-medium">{product.name}</Td>
                    <Td>{variant.name}</Td>
                    <Td>{variant.sku ?? "-"}</Td>
                    <Td>{variant.stock}</Td>
                    <Td>{variant.low_stock_threshold}</Td>
                    <Td>
                      <Badge tone={variant.stock <= variant.low_stock_threshold ? "amber" : "green"}>
                        {variant.stock <= variant.low_stock_threshold ? "Low stock" : "In stock"}
                      </Badge>
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
