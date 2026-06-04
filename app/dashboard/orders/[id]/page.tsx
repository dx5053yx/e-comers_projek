import { notFound } from "next/navigation";
import { OrderActions } from "@/components/orders/order-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getOrder } from "@/lib/data/queries";
import { getOrderStatusTone, orderStatusLabels, paymentStatusLabels, shipmentStatusLabels } from "@/lib/orders/status";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title={order.order_code} description={`Dibuat ${formatDate(order.created_at)} dari ${order.source}.`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Info customer</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p><span className="text-muted-foreground">Nama:</span> {order.customer?.name ?? "-"}</p>
              <p><span className="text-muted-foreground">WhatsApp:</span> {order.customer?.whatsapp_number ?? "-"}</p>
              <p><span className="text-muted-foreground">Alamat:</span> {order.customer?.address ?? "-"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="table-scroll">
                <Table>
                  <thead>
                    <tr>
                      <Th>Produk</Th>
                      <Th>Varian</Th>
                      <Th>Qty</Th>
                      <Th>Harga</Th>
                      <Th>Total</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items ?? []).map((item) => (
                      <tr key={item.id}>
                        <Td className="font-medium">{item.product_name}</Td>
                        <Td>{item.variant_name ?? "-"}</Td>
                        <Td>{item.quantity}</Td>
                        <Td>{formatCurrency(item.price)}</Td>
                        <Td>{formatCurrency(item.total)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <div className="mt-4 grid gap-1 text-sm">
                <p className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></p>
                <p className="flex justify-between"><span>Diskon</span><span>{formatCurrency(order.discount_total)}</span></p>
                <p className="flex justify-between"><span>Ongkir</span><span>{formatCurrency(order.shipping_cost)}</span></p>
                <p className="flex justify-between font-semibold"><span>Grand total</span><span>{formatCurrency(order.grand_total)}</span></p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge tone={getOrderStatusTone(order.status)}>{orderStatusLabels[order.status]}</Badge>
              <Badge tone={order.payment_status === "PAID" ? "green" : "amber"}>
                Payment {paymentStatusLabels[order.payment_status]}
              </Badge>
              <Badge tone={order.shipment?.status === "DELIVERED" ? "green" : "blue"}>
                Shipment {order.shipment ? shipmentStatusLabels[order.shipment.status] : "Belum dibuat"}
              </Badge>
            </CardContent>
          </Card>
        </div>
        <OrderActions order={order} />
      </div>
    </div>
  );
}
