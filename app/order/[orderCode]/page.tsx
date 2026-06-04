import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getPublicOrder } from "@/lib/data/public-queries";
import { orderStatusLabels, paymentStatusLabels } from "@/lib/orders/status";
import { formatCurrency } from "@/lib/utils";

export default async function PublicOrderPage({
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
      <div className="mb-6">
        <p className="text-sm font-medium text-primary">Status pesanan</p>
        <h1 className="mt-2 text-3xl font-semibold">{order.order_code}</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Detail order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="table-scroll">
              <Table>
                <thead>
                  <tr>
                    <Th>Produk</Th>
                    <Th>Qty</Th>
                    <Th>Total</Th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items ?? []).map((item) => (
                    <tr key={item.id}>
                      <Td>{item.product_name}</Td>
                      <Td>{item.quantity}</Td>
                      <Td>{formatCurrency(item.total)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex justify-between"><span>Status</span><span>{orderStatusLabels[order.status]}</span></p>
            <p className="flex justify-between"><span>Payment</span><span>{paymentStatusLabels[order.payment_status]}</span></p>
            <p className="flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(order.grand_total)}</span></p>
            <div className="flex flex-col gap-2 pt-3">
              <Link href={`/order/${order.order_code}/payment`}><Button className="w-full">Upload bukti bayar</Button></Link>
              <Link href={`/order/${order.order_code}/tracking`}><Button className="w-full" variant="outline">Cek tracking</Button></Link>
              <Link href={`/order/${order.order_code}/review`}><Button className="w-full" variant="outline">Beri review</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
