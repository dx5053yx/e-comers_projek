"use client";

import { Gift, Percent, RotateCcw, Save, Ticket, ToggleLeft, ToggleRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Td, Th, Table } from "@/components/ui/table";
import type { PromoKind, Voucher, VoucherType } from "@/lib/types";
import { describeVoucher, isVoucherCurrentlyActive } from "@/lib/promos";
import { formatCurrency, formatDate } from "@/lib/utils";

function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function numberOrNull(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  return raw ? Number(raw) : null;
}

export function VoucherManager({
  businessId,
  vouchers,
}: {
  businessId: string;
  vouchers: Voucher[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [promoKind, setPromoKind] = useState<PromoKind>("DISCOUNT");
  const [discountType, setDiscountType] = useState<VoucherType>("PERCENTAGE");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const activeCount = vouchers.filter((voucher) => isVoucherCurrentlyActive(voucher)).length;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("Menyimpan promo...");

    try {
      const form = new FormData(event.currentTarget);
      const payload = {
        business_id: businessId,
        code: String(form.get("code") ?? "").trim(),
        title: String(form.get("title") ?? "").trim(),
        description: String(form.get("description") ?? "").trim(),
        promo_kind: promoKind,
        type: promoKind === "BUY_X_GET_Y" ? "FIXED" : discountType,
        value: promoKind === "BUY_X_GET_Y" ? 0 : String(form.get("value") ?? "").trim(),
        min_purchase: String(form.get("min_purchase") ?? "").trim(),
        min_quantity: promoKind === "DISCOUNT" ? Number(form.get("min_quantity") ?? 0) : 0,
        buy_quantity: promoKind === "BUY_X_GET_Y" ? Number(form.get("buy_quantity") ?? 0) : 0,
        free_quantity: promoKind === "BUY_X_GET_Y" ? Number(form.get("free_quantity") ?? 0) : 0,
        max_uses: numberOrNull(form.get("max_uses")),
        starts_at: toIsoDateTime(String(form.get("starts_at") ?? "")),
        ends_at: toIsoDateTime(String(form.get("ends_at") ?? "")),
        is_active: form.get("is_active") === "on",
      };

      const response = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(result?.error ?? "Gagal menyimpan promo.");
        return;
      }

      event.currentTarget.reset();
      setPromoKind("DISCOUNT");
      setDiscountType("PERCENTAGE");
      setMessage("Promo tersimpan. AI akan menawarkan promo ini kalau statusnya aktif.");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleVoucher(voucher: Voucher) {
    setMessage(voucher.is_active ? "Menonaktifkan promo..." : "Mengaktifkan promo...");
    const response = await fetch(`/api/vouchers/${voucher.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !voucher.is_active }),
    });

    setMessage(response.ok ? "Status promo diperbarui." : "Gagal mengubah status promo.");
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Tambah promo</CardTitle>
              <CardDescription>
                Promo aktif otomatis ditawarkan AI dan diterapkan ke order yang memenuhi syarat.
              </CardDescription>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted text-primary">
              <Gift className="h-5 w-5" aria-hidden />
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="mb-4 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
              {message}
            </div>
          ) : null}
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-2">
              <Label htmlFor="promo_kind">Jenis promo</Label>
              <Select
                id="promo_kind"
                name="promo_kind"
                value={promoKind}
                onChange={(event) => setPromoKind(event.target.value as PromoKind)}
              >
                <option value="DISCOUNT">Voucher diskon</option>
                <option value="BUY_X_GET_Y">Beli X gratis Y</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Nama promo</Label>
              <Input id="title" name="title" placeholder="Contoh: Diskon Akhir Pekan" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Kode promo</Label>
              <Input id="code" name="code" placeholder="Contoh: HEMAT10" required />
            </div>
            {promoKind === "DISCOUNT" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipe diskon</Label>
                  <Select
                    id="type"
                    name="type"
                    value={discountType}
                    onChange={(event) => setDiscountType(event.target.value as VoucherType)}
                  >
                    <option value="PERCENTAGE">Persen</option>
                    <option value="FIXED">Nominal</option>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Nilai diskon</Label>
                  <Input
                    id="value"
                    inputMode="numeric"
                    name="value"
                    placeholder={discountType === "PERCENTAGE" ? "Contoh: 10" : "Contoh: 5.000"}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="buy_quantity">Beli</Label>
                  <Input id="buy_quantity" min={1} name="buy_quantity" placeholder="Contoh: 3" required type="number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="free_quantity">Gratis</Label>
                  <Input id="free_quantity" min={1} name="free_quantity" placeholder="Contoh: 1" required type="number" />
                </div>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="min_purchase">Minimal belanja</Label>
                <Input id="min_purchase" inputMode="numeric" name="min_purchase" placeholder="Contoh: 50.000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="min_quantity">Minimal item</Label>
                <Input
                  disabled={promoKind === "BUY_X_GET_Y"}
                  id="min_quantity"
                  min={0}
                  name="min_quantity"
                  placeholder="Contoh: 2"
                  type="number"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max_uses">Kuota penggunaan</Label>
              <Input id="max_uses" min={1} name="max_uses" placeholder="Contoh: 100, kosongkan jika bebas" type="number" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="starts_at">Mulai</Label>
                <Input id="starts_at" name="starts_at" type="datetime-local" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ends_at">Berakhir</Label>
                <Input id="ends_at" name="ends_at" type="datetime-local" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Catatan promo</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Contoh: Berlaku untuk semua menu, otomatis dipakai saat order memenuhi syarat."
              />
            </div>
            <label className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm">
              <input id="is_active" name="is_active" type="checkbox" defaultChecked className="h-4 w-4" />
              Aktifkan promo
            </label>
            <Button disabled={isSaving} type="submit">
              {isSaving ? (
                <RotateCcw className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              Simpan promo
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Daftar promo</CardTitle>
              <CardDescription>
                {activeCount} promo sedang aktif dan bisa ditawarkan AI ke customer.
              </CardDescription>
            </div>
            <Badge tone="green">{activeCount} aktif</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="table-scroll border-0">
            <Table>
              <thead>
                <tr>
                  <Th>Promo</Th>
                  <Th>Jenis</Th>
                  <Th>Syarat</Th>
                  <Th>Pakai</Th>
                  <Th>Periode</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <Td>
                      <div className="min-w-56">
                        <p className="font-semibold">{voucher.title || voucher.code}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{describeVoucher(voucher)}</p>
                      </div>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-2">
                        {voucher.promo_kind === "BUY_X_GET_Y" ? (
                          <Gift className="h-4 w-4 text-primary" aria-hidden />
                        ) : (
                          <Percent className="h-4 w-4 text-primary" aria-hidden />
                        )}
                        {voucher.promo_kind === "BUY_X_GET_Y" ? "Beli X Gratis Y" : "Diskon"}
                      </span>
                    </Td>
                    <Td>
                      <div className="text-sm">
                        <p>Belanja: {Number(voucher.min_purchase) > 0 ? formatCurrency(voucher.min_purchase) : "Bebas"}</p>
                        <p>Item: {Number(voucher.min_quantity) > 0 ? `${voucher.min_quantity}+` : "Bebas"}</p>
                      </div>
                    </Td>
                    <Td>
                      {voucher.max_uses ? `${voucher.used_count}/${voucher.max_uses}` : `${voucher.used_count}x`}
                    </Td>
                    <Td>
                      <div className="min-w-36 text-xs text-muted-foreground">
                        <p>{voucher.starts_at ? formatDate(voucher.starts_at) : "Mulai sekarang"}</p>
                        <p>{voucher.ends_at ? formatDate(voucher.ends_at) : "Tanpa batas"}</p>
                      </div>
                    </Td>
                    <Td>
                      <Badge tone={isVoucherCurrentlyActive(voucher) ? "green" : voucher.is_active ? "amber" : "gray"}>
                        {isVoucherCurrentlyActive(voucher) ? "Aktif" : voucher.is_active ? "Terjadwal/habis" : "Nonaktif"}
                      </Badge>
                    </Td>
                    <Td>
                      <Button
                        onClick={() => toggleVoucher(voucher)}
                        size="sm"
                        variant={voucher.is_active ? "outline" : "secondary"}
                      >
                        {voucher.is_active ? (
                          <ToggleLeft className="h-4 w-4" aria-hidden />
                        ) : (
                          <ToggleRight className="h-4 w-4" aria-hidden />
                        )}
                        {voucher.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                    </Td>
                  </tr>
                ))}
                {!vouchers.length ? (
                  <tr>
                    <Td colSpan={7}>
                      <div className="grid justify-items-center gap-2 py-10 text-center text-muted-foreground">
                        <Ticket className="h-8 w-8" aria-hidden />
                        Belum ada promo. Buat promo pertama dari form di sebelah kiri.
                      </div>
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
