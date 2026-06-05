import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  ReceiptText,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { OrderActions } from "@/components/orders/order-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getCurrentBusiness, getOrder, getOrders } from "@/lib/data/queries";
import {
  getOrderStatusTone,
  orderStatusLabels,
  paymentStatusLabels,
  shipmentStatusLabels,
} from "@/lib/orders/status";
import type { Order } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

function orderHref(order?: Pick<Order, "id"> | null) {
  return order ? `/dashboard/orders/${order.id}` : null;
}

function InfoStat({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-sm font-semibold">{value}</p>
          {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getCurrentBusiness();
  const [order, orders] = await Promise.all([
    getOrder(id),
    getOrders(business?.id),
  ]);

  if (!order) {
    notFound();
  }

  const currentIndex = orders.findIndex((item) => item.id === order.id);
  const previousOrder = currentIndex > 0 ? orders[currentIndex - 1] : null;
  const nextOrder = currentIndex >= 0 ? orders[currentIndex + 1] : null;
  const previousHref = orderHref(previousOrder);
  const nextHref = orderHref(nextOrder);
  const visibleQueue = orders.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            href="/dashboard/orders"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Semua order
          </Link>
          <PageHeader
            title={order.order_code}
            description={`Dibuat ${formatDate(order.created_at)} dari ${order.source}.`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {previousHref ? (
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium shadow-sm transition hover:border-primary/30 hover:bg-muted/70"
              href={previousHref}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Order lebih baru
            </Link>
          ) : null}
          {nextHref ? (
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-md bg-secondary px-3 text-sm font-medium text-secondary-foreground shadow-sm transition hover:bg-secondary/90"
              href={nextHref}
            >
              Order berikutnya
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <InfoStat
          helper={order.customer?.whatsapp_number ?? "Nomor belum tersedia"}
          icon={UserRound}
          label="Customer"
          value={order.customer?.name ?? "Customer"}
        />
        <InfoStat
          helper={`${(order.items ?? []).length} jenis item`}
          icon={ReceiptText}
          label="Total"
          value={formatCurrency(order.grand_total)}
        />
        <InfoStat
          helper={`Payment ${paymentStatusLabels[order.payment_status]}`}
          icon={MessageSquareText}
          label="Status"
          value={orderStatusLabels[order.status]}
        />
        <InfoStat
          helper={order.shipment?.tracking_number ?? "Resi belum diisi"}
          icon={Truck}
          label="Pengiriman"
          value={order.shipment ? shipmentStatusLabels[order.shipment.status] : "Belum dibuat"}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Detail pesanan</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ringkasan item, customer, dan total transaksi.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={getOrderStatusTone(order.status)}>
                    {orderStatusLabels[order.status]}
                  </Badge>
                  <Badge tone={order.payment_status === "PAID" ? "green" : "amber"}>
                    Payment {paymentStatusLabels[order.payment_status]}
                  </Badge>
                  <Badge tone={order.shipment?.status === "DELIVERED" ? "green" : "blue"}>
                    Shipment {order.shipment ? shipmentStatusLabels[order.shipment.status] : "Belum dibuat"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Nama</p>
                  <p className="mt-1 text-sm font-medium">{order.customer?.name ?? "-"}</p>
                </div>
                <div className="rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">WhatsApp</p>
                  <p className="mt-1 text-sm font-medium">{order.customer?.whatsapp_number ?? "-"}</p>
                </div>
                <div className="rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Alamat</p>
                  <p className="mt-1 text-sm font-medium">{order.customer?.address ?? "-"}</p>
                </div>
              </div>

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

              <div className="ml-auto grid max-w-sm gap-2 text-sm">
                <p className="flex justify-between gap-10">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </p>
                <p className="flex justify-between gap-10">
                  <span className="text-muted-foreground">Diskon</span>
                  <span>{formatCurrency(order.discount_total)}</span>
                </p>
                <p className="flex justify-between gap-10">
                  <span className="text-muted-foreground">Ongkir</span>
                  <span>{formatCurrency(order.shipping_cost)}</span>
                </p>
                <p className="flex justify-between gap-10 border-t border-border pt-2 text-base font-semibold">
                  <span>Grand total</span>
                  <span>{formatCurrency(order.grand_total)}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bukti pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {order.payment?.proof_url ? (
                <a
                  className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-border bg-card px-3 font-medium transition hover:border-primary/30 hover:bg-muted/70"
                  href={order.payment.proof_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ReceiptText className="h-4 w-4" aria-hidden />
                  Buka bukti transfer
                </a>
              ) : (
                <p className="text-muted-foreground">Belum ada bukti pembayaran.</p>
              )}
              {order.payment?.note ? (
                <p className="text-muted-foreground">{order.payment.note}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <OrderActions order={order} nextOrderHref={nextHref} />

          <Card>
            <CardHeader className="border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Antrian order</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pindah order tanpa balik ke menu.
                  </p>
                </div>
                <CalendarClock className="h-5 w-5 text-primary" aria-hidden />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {visibleQueue.map((item) => {
                const active = item.id === order.id;

                return (
                  <Link
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm transition hover:border-primary/30 hover:bg-muted/60",
                      active && "border-primary/30 bg-primary/10",
                    )}
                    href={`/dashboard/orders/${item.id}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{item.order_code}</span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {item.customer?.name ?? "Customer"} · {formatCurrency(item.grand_total)}
                      </span>
                    </span>
                    <span className="shrink-0">
                      {active ? (
                        <Badge tone="green">Aktif</Badge>
                      ) : (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                      )}
                    </span>
                  </Link>
                );
              })}
              <Link
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium transition hover:border-primary/30 hover:bg-muted/70"
                href="/dashboard/orders"
              >
                Lihat semua order
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
