import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getCurrentBusiness, getOrders } from "@/lib/data/queries";
import { paymentStatusLabels } from "@/lib/orders/status";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PaymentsPage() {
  const business = await getCurrentBusiness();
  const orders = await getOrders(business?.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Payment management" description="Verifikasi pembayaran manual dan bukti transfer." />
      <Card>
        <CardContent className="p-0">
          <div className="table-scroll border-0">
            <Table>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Status payment</Th>
                  <Th>Amount</Th>
                  <Th>Tanggal</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <Td>{order.order_code}</Td>
                    <Td>{order.customer?.name ?? "-"}</Td>
                    <Td>
                      <Badge tone={order.payment_status === "PAID" ? "green" : "amber"}>
                        {paymentStatusLabels[order.payment_status]}
                      </Badge>
                    </Td>
                    <Td>{formatCurrency(order.grand_total)}</Td>
                    <Td>{formatDate(order.created_at)}</Td>
                    <Td>
                      <Link className="font-medium text-primary" href={`/dashboard/orders/${order.id}`}>
                        Verifikasi
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
