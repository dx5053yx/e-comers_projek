import { ArrowRight, ClipboardList, CreditCard, PackageCheck, Timer } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getCurrentBusiness, getOrders } from "@/lib/data/queries";
import { getOrderStatusTone, orderStatusLabels, paymentStatusLabels } from "@/lib/orders/status";
import { formatCurrency, formatDate } from "@/lib/utils";

function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </CardContent>
    </Card>
  );
}

export default async function OrdersPage() {
  const business = await getCurrentBusiness();
  const orders = await getOrders(business?.id);
  const activeOrders = orders.filter((order) =>
    ["PENDING_PAYMENT", "PAID", "PROCESSING", "PACKING", "SHIPPED"].includes(order.status),
  );
  const pendingPayments = orders.filter((order) => order.payment_status === "PENDING");
  const completedOrders = orders.filter((order) => order.status === "COMPLETED");
  const todayTotal = orders
    .filter((order) => new Date(order.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, order) => sum + Number(order.grand_total ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order management"
        description="Kelola pesanan WhatsApp, katalog, pembayaran, dan pengiriman dari satu daftar kerja."
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          helper="Perlu diproses atau dicek"
          icon={ClipboardList}
          label="Order aktif"
          value={String(activeOrders.length)}
        />
        <SummaryCard
          helper="Menunggu bukti/verifikasi"
          icon={CreditCard}
          label="Belum bayar"
          value={String(pendingPayments.length)}
        />
        <SummaryCard
          helper="Order sudah beres"
          icon={PackageCheck}
          label="Selesai"
          value={String(completedOrders.length)}
        />
        <SummaryCard
          helper="Dari order yang dibuat hari ini"
          icon={Timer}
          label="Omzet hari ini"
          value={formatCurrency(todayTotal)}
        />
      </section>

      <Card>
        <CardContent className="p-0">
          <div className="table-scroll border-0">
            <Table>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Channel</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                  <Th>Total</Th>
                  <Th>Dibuat</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-muted/40">
                    <Td>
                      <Link
                        className="font-semibold text-foreground transition hover:text-primary"
                        href={`/dashboard/orders/${order.id}`}
                      >
                        {order.order_code}
                      </Link>
                    </Td>
                    <Td>
                      <div className="min-w-44">
                        <p className="font-medium">{order.customer?.name ?? "Customer"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {order.customer?.whatsapp_number ?? "-"}
                        </p>
                      </div>
                    </Td>
                    <Td>
                      <Badge tone={order.source === "WHATSAPP" ? "green" : "blue"}>
                        {order.source}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge tone={getOrderStatusTone(order.status)}>
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge tone={order.payment_status === "PAID" ? "green" : "amber"}>
                        {paymentStatusLabels[order.payment_status]}
                      </Badge>
                    </Td>
                    <Td className="font-semibold">{formatCurrency(order.grand_total)}</Td>
                    <Td>{formatDate(order.created_at)}</Td>
                    <Td>
                      <Link
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium transition hover:border-primary/30 hover:bg-muted/70"
                        href={`/dashboard/orders/${order.id}`}
                      >
                        Kelola
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </Td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <Td className="py-10 text-center text-muted-foreground" colSpan={8}>
                      Belum ada order masuk.
                    </Td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
