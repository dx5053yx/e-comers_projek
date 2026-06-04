import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getCurrentBusiness, getOrders } from "@/lib/data/queries";
import { shipmentStatusLabels } from "@/lib/orders/status";

export default async function ShipmentsPage() {
  const business = await getCurrentBusiness();
  const orders = await getOrders(business?.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Shipping & delivery" description="Input kurir, nomor resi, dan status pengiriman manual." />
      <Card>
        <CardContent className="p-0">
          <div className="table-scroll border-0">
            <Table>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Kurir</Th>
                  <Th>Resi</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <Td>{order.order_code}</Td>
                    <Td>{order.shipment?.courier ?? "-"}</Td>
                    <Td>{order.shipment?.tracking_number ?? "-"}</Td>
                    <Td>
                      <Badge tone={order.shipment?.status === "DELIVERED" ? "green" : "blue"}>
                        {order.shipment ? shipmentStatusLabels[order.shipment.status] : "Belum dibuat"}
                      </Badge>
                    </Td>
                    <Td>
                      <Link className="font-medium text-primary" href={`/dashboard/orders/${order.id}`}>
                        Update
                      </Link>
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
