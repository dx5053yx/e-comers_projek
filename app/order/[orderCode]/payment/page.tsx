import { notFound } from "next/navigation";
import { PaymentProofForm } from "@/components/orders/payment-proof-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicOrder } from "@/lib/data/public-queries";

export default async function PaymentPage({
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
          <CardTitle>Upload bukti bayar {order.order_code}</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentProofForm orderId={order.id} />
        </CardContent>
      </Card>
    </main>
  );
}
