import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getCurrentBusiness, getOrders } from "@/lib/data/queries";
import { getOrderStatusTone, orderStatusLabels, paymentStatusLabels } from "@/lib/orders/status";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function OrdersPage() {
  const business = await getCurrentBusiness();
  const orders = await getOrders(business?.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Order management" description="Daftar order dari website, WhatsApp, dan admin." />
      <Card>
        <CardContent className="p-0">
          <div className="table-scroll border-0">
            <Table>
              <thead>
                <tr>
                  <Th>Order code</Th>
                  <Th>Customer</Th>
                  <Th>Source</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                  <Th>Total</Th>
                  <Th>Created at</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <Td className="font-medium">{order.order_code}</Td>
                    <Td>{order.customer?.name ?? "Customer"}</Td>
                    <Td>{order.source}</Td>
                    <Td>
                      <Badge tone={getOrderStatusTone(order.status)}>
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </Td>
                    <Td>{paymentStatusLabels[order.payment_status]}</Td>
                    <Td>{formatCurrency(order.grand_total)}</Td>
                    <Td>{formatDate(order.created_at)}</Td>
                    <Td>
                      <Link className="font-medium text-primary" href={`/dashboard/orders/${order.id}`}>
                        Detail
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
