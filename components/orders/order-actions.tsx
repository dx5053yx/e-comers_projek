"use client";

import { CheckCircle, CreditCard, Save, Truck, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import type { Order } from "@/lib/types";

export function OrderActions({ order }: { order: Order }) {
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function send(endpoint: string, method: string, body?: unknown) {
    setMessage("Memproses perubahan...");
    const response = await fetch(endpoint, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setMessage(payload?.error ?? "Gagal memproses perubahan.");
      return;
    }

    setMessage("Perubahan tersimpan.");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aksi order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {message ? (
          <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
            {message}
          </div>
        ) : null}
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const note = String(form.get("note") ?? "").trim();

            if (note.length > 500) {
              setMessage("Catatan status maksimal 500 karakter.");
              return;
            }

            send(`/api/orders/${order.id}/status`, "PATCH", {
              status: form.get("status"),
              note,
            });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="status">Status order</Label>
            <Select id="status" name="status" defaultValue={order.status}>
              {[
                "PENDING_PAYMENT",
                "PAID",
                "PROCESSING",
                "PACKING",
                "SHIPPED",
                "COMPLETED",
                "CANCELLED",
                "REFUNDED",
              ].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note">Catatan status</Label>
            <Textarea id="note" name="note" />
          </div>
          <Button type="submit" variant="secondary">
            <Save className="h-4 w-4" aria-hidden />
            Update status
          </Button>
        </form>

        {order.payment?.id ? (
          <div className="space-y-3">
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              Status payment saat ini: <span className="font-medium">{order.payment.status}</span>.
              {order.payment.status === "PAID"
                ? " Jika ditolak ulang, stok order akan dikembalikan."
                : " Verifikasi akan mengurangi stok sesuai item order."}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => send(`/api/payments/${order.payment?.id}/verify`, "PATCH")}>
                <CheckCircle className="h-4 w-4" aria-hidden />
                {order.payment.status === "PAID" ? "Sudah PAID" : "Verifikasi payment"}
              </Button>
              <Button
                onClick={() =>
                  send(`/api/payments/${order.payment?.id}/reject`, "PATCH", {
                    note: "Bukti pembayaran ditolak admin.",
                  })
                }
                variant="danger"
              >
                <XCircle className="h-4 w-4" aria-hidden />
                Tolak / koreksi payment
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" aria-hidden />
            Payment record belum tersedia.
          </div>
        )}

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const courier = String(form.get("courier") ?? "").trim();
            const trackingNumber = String(form.get("tracking_number") ?? "").trim();

            if (courier.length < 2) {
              setMessage("Nama kurir minimal 2 karakter.");
              return;
            }

            if (trackingNumber && trackingNumber.length < 4) {
              setMessage("Nomor resi minimal 4 karakter.");
              return;
            }

            send(`/api/orders/${order.id}/shipment`, "POST", {
              courier,
              tracking_number: trackingNumber || null,
              status: form.get("shipment_status"),
            });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="courier">Kurir</Label>
            <Input id="courier" name="courier" defaultValue={order.shipment?.courier ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tracking_number">Nomor resi</Label>
            <Input
              id="tracking_number"
              name="tracking_number"
              defaultValue={order.shipment?.tracking_number ?? ""}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shipment_status">Status shipment</Label>
            <Select id="shipment_status" name="shipment_status" defaultValue={order.shipment?.status ?? "READY_TO_SHIP"}>
              {["NOT_SHIPPED", "READY_TO_SHIP", "SHIPPED", "DELIVERED", "RETURNED"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" variant="outline">
            <Truck className="h-4 w-4" aria-hidden />
            {order.shipment ? "Update shipment" : "Simpan shipment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
