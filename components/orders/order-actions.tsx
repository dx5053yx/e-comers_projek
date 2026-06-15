"use client";

import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  PackageCheck,
  ReceiptText,
  Save,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import {
  getOrderStatusTone,
  orderStatusLabels,
  paymentStatusLabels,
  shipmentStatusLabels,
} from "@/lib/orders/status";
import type { Order, OrderStatus, ShipmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const quickOrderStatuses: OrderStatus[] = [
  "PROCESSING",
  "PACKING",
  "SHIPPED",
  "COMPLETED",
];

const allOrderStatuses: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "PACKING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
];

const shipmentStatuses: ShipmentStatus[] = [
  "NOT_SHIPPED",
  "READY_TO_SHIP",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
];

export function OrderActions({
  order,
  nextOrderHref,
  readOnly = false,
}: {
  order: Order;
  nextOrderHref?: string | null;
  readOnly?: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const router = useRouter();

  async function send(
    endpoint: string,
    method: string,
    body?: unknown,
    actionId = endpoint,
  ) {
    setActiveAction(actionId);
    setMessage("Menyimpan perubahan...");
    const response = await fetch(endpoint, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    setActiveAction(null);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setMessage(payload?.error ?? "Gagal menyimpan. Coba cek data lalu ulangi.");
      return;
    }

    setMessage("Tersimpan. Data order sudah diperbarui.");
    router.refresh();
  }

  function quickUpdateStatus(status: OrderStatus) {
    send(
      `/api/orders/${order.id}/status`,
      "PATCH",
      {
        status,
        note: `Status diubah cepat ke ${orderStatusLabels[status]}.`,
      },
      `status-${status}`,
    );
  }

  const paymentTone = order.payment_status === "PAID" ? "green" : "amber";

  if (readOnly) {
    return (
      <Card className="xl:sticky xl:top-24">
        <CardHeader className="border-b border-border">
          <CardTitle>Status order</CardTitle>
          <p className="text-sm text-muted-foreground">
            Mode tamu menampilkan status tanpa kontrol perubahan.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Pesanan</span>
            <Badge tone={getOrderStatusTone(order.status)}>
              {orderStatusLabels[order.status]}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Pembayaran</span>
            <Badge tone={paymentTone}>{paymentStatusLabels[order.payment_status]}</Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Pengiriman</span>
            <span className="text-right text-sm font-semibold">
              {shipmentStatusLabels[order.shipment?.status ?? "NOT_SHIPPED"]}
            </span>
          </div>
          {order.payment?.proof_url ? (
            <a
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium transition hover:border-primary/30 hover:bg-muted/70"
              href={order.payment.proof_url}
              rel="noreferrer"
              target="_blank"
            >
              <ReceiptText className="h-4 w-4" aria-hidden />
              Lihat bukti transfer
            </a>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="xl:sticky xl:top-24">
      <CardHeader className="border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Kontrol order</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Ubah status, pembayaran, dan pengiriman dari satu panel.
            </p>
          </div>
          <Badge tone={getOrderStatusTone(order.status)}>
            {orderStatusLabels[order.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {message ? (
          <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
            <div>{message}</div>
            {nextOrderHref && message.startsWith("Tersimpan") ? (
              <Link
                className="mt-2 inline-flex items-center gap-1 font-medium text-primary"
                href={nextOrderHref}
              >
                Lanjut ke order berikutnya
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
          </div>
        ) : null}

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Status cepat</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Cocok untuk operasional harian.
              </p>
            </div>
            <PackageCheck className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickOrderStatuses.map((status) => (
              <Button
                key={status}
                className={cn(
                  "justify-start px-3",
                  order.status === status && "ring-2 ring-primary/20",
                )}
                disabled={activeAction !== null || order.status === status}
                onClick={() => quickUpdateStatus(status)}
                variant={order.status === status ? "default" : "outline"}
              >
                {orderStatusLabels[status]}
              </Button>
            ))}
          </div>
        </section>

        <form
          className="grid gap-3 border-t border-border pt-5"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const note = String(form.get("note") ?? "").trim();

            if (note.length > 500) {
              setMessage("Catatan status maksimal 500 karakter.");
              return;
            }

            send(
              `/api/orders/${order.id}/status`,
              "PATCH",
              {
                status: form.get("status"),
                note,
              },
              "status-form",
            );
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="status">Status lengkap</Label>
            <Select id="status" name="status" defaultValue={order.status}>
              {allOrderStatuses.map((status) => (
                <option key={status} value={status}>
                  {orderStatusLabels[status]}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note">Catatan internal</Label>
            <Textarea
              className="min-h-20"
              id="note"
              name="note"
              placeholder="Contoh: Customer minta kirim sore, status dipindah ke packing."
            />
          </div>
          <Button disabled={activeAction !== null} type="submit" variant="secondary">
            <Save className="h-4 w-4" aria-hidden />
            Simpan status
          </Button>
        </form>

        <section className="space-y-3 border-t border-border pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Pembayaran</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Status saat ini: {paymentStatusLabels[order.payment_status]}.
              </p>
            </div>
            <Badge tone={paymentTone}>{paymentStatusLabels[order.payment_status]}</Badge>
          </div>
          {order.payment?.proof_url ? (
            <a
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium transition hover:border-primary/30 hover:bg-muted/70"
              href={order.payment.proof_url}
              rel="noreferrer"
              target="_blank"
            >
              <ReceiptText className="h-4 w-4" aria-hidden />
              Buka bukti transfer
            </a>
          ) : null}
          {order.payment?.id ? (
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={activeAction !== null || order.payment.status === "PAID"}
                onClick={() =>
                  send(
                    `/api/payments/${order.payment?.id}/verify`,
                    "PATCH",
                    undefined,
                    "payment-verify",
                  )
                }
              >
                <CheckCircle className="h-4 w-4" aria-hidden />
                {order.payment.status === "PAID" ? "Sudah terbayar" : "Verifikasi bayar"}
              </Button>
              <Button
                disabled={activeAction !== null}
                onClick={() => {
                  if (!window.confirm("Tolak pembayaran ini dan kembalikan order ke menunggu bayar?")) {
                    return;
                  }

                  send(
                    `/api/payments/${order.payment?.id}/reject`,
                    "PATCH",
                    {
                      note: "Bukti pembayaran ditolak admin.",
                    },
                    "payment-reject",
                  );
                }}
                variant="danger"
              >
                <XCircle className="h-4 w-4" aria-hidden />
                Tolak pembayaran
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" aria-hidden />
              Belum ada record pembayaran.
            </div>
          )}
        </section>

        <form
          className="grid gap-3 border-t border-border pt-5"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const courier = String(form.get("courier") ?? "").trim();
            const trackingNumber = String(form.get("tracking_number") ?? "").trim();

            if (trackingNumber && trackingNumber.length < 4) {
              setMessage("Nomor resi minimal 4 karakter.");
              return;
            }

            send(
              `/api/orders/${order.id}/shipment`,
              "POST",
              {
                courier: courier || null,
                tracking_number: trackingNumber || null,
                status: form.get("shipment_status"),
              },
              "shipment",
            );
          }}
        >
          <div>
            <h3 className="text-sm font-semibold">Pengiriman</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Kurir dan resi boleh dikosongkan kalau belum ada.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <div className="grid gap-2">
              <Label htmlFor="courier">Kurir</Label>
              <Input
                id="courier"
                name="courier"
                defaultValue={order.shipment?.courier ?? ""}
                placeholder="JNE, kurir toko, ojek, dll"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tracking_number">Nomor resi</Label>
              <Input
                id="tracking_number"
                name="tracking_number"
                defaultValue={order.shipment?.tracking_number ?? ""}
                placeholder="Contoh: JNE123456789"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shipment_status">Status pengiriman</Label>
            <Select
              id="shipment_status"
              name="shipment_status"
              defaultValue={order.shipment?.status ?? "READY_TO_SHIP"}
            >
              {shipmentStatuses.map((status) => (
                <option key={status} value={status}>
                  {shipmentStatusLabels[status]}
                </option>
              ))}
            </Select>
          </div>
          <Button disabled={activeAction !== null} type="submit" variant="outline">
            <Truck className="h-4 w-4" aria-hidden />
            Simpan pengiriman
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
