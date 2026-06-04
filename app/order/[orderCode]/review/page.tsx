import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/orders/review-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicOrder } from "@/lib/data/public-queries";

export default async function ReviewPage({
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
          <CardTitle>Review {order.order_code}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewForm orderCode={order.order_code} />
        </CardContent>
      </Card>
    </main>
  );
}
