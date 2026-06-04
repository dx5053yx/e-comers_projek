import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicOrder } from "@/lib/data/public-queries";
import { orderStatusLabels, shipmentStatusLabels } from "@/lib/orders/status";

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const { orderCode } = await params;
  const order = await getPublicOrder(orderCode);

  if (!order) {
    notFound();
  }

  return (
    <main className="container-page min-h-screen py-10">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Tracking {order.order_code}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <p><span className="text-muted-foreground">Order:</span> {orderStatusLabels[order.status]}</p>
          <p><span className="text-muted-foreground">Shipment:</span> {order.shipment ? shipmentStatusLabels[order.shipment.status] : "Belum dikirim"}</p>
          <p><span className="text-muted-foreground">Kurir:</span> {order.shipment?.courier ?? "-"}</p>
          <p><span className="text-muted-foreground">Resi:</span> {order.shipment?.tracking_number ?? "-"}</p>
        </CardContent>
      </Card>
    </main>
  );
}
