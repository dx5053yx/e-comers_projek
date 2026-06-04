import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getCustomerDisplayName, getCustomerDisplayPhone } from "@/lib/customers";
import { getCustomers, getOrders } from "@/lib/data/queries";
import { orderStatusLabels } from "@/lib/orders/status";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customers, orders] = await Promise.all([getCustomers(), getOrders()]);
  const customer = customers.find((item) => item.id === id);

  if (!customer) {
    notFound();
  }

  const customerOrders = orders.filter((order) => order.customer_id === customer.id);
  const customerName = getCustomerDisplayName(customer);
  const customerPhone = getCustomerDisplayPhone(customer);

  return (
    <div className="space-y-6">
      <PageHeader title={customerName} description={customerPhone} />
      <Card>
        <CardHeader>
          <CardTitle>Profil customer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <p><span className="text-muted-foreground">WhatsApp:</span> {customerPhone}</p>
          <p><span className="text-muted-foreground">Email:</span> {customer.email ?? "-"}</p>
          <p><span className="text-muted-foreground">Alamat:</span> {customer.address ?? "-"}</p>
          <p><span className="text-muted-foreground">Segment:</span> <Badge tone="blue">{customer.segment}</Badge></p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Riwayat order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-scroll">
            <Table>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Status</Th>
                  <Th>Total</Th>
                  <Th>Tanggal</Th>
                </tr>
              </thead>
              <tbody>
                {customerOrders.map((order) => (
                  <tr key={order.id}>
                    <Td>{order.order_code}</Td>
                    <Td>{orderStatusLabels[order.status]}</Td>
                    <Td>{formatCurrency(order.grand_total)}</Td>
                    <Td>{formatDate(order.created_at)}</Td>
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
