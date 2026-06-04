"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import type { Business, Product } from "@/lib/types";

export function CatalogOrderForm({
  business,
  products,
}: {
  business: Business;
  products: Product[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  function validateWhatsapp(value: string) {
    return /^(\+62|62|0)8[0-9]{7,12}$/.test(value.replace(/\s|-/g, ""));
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const product = products.find((item) => item.id === form.get("product_id"));

        setOrderCode(null);

        if (!product) {
          setMessage("Pilih produk dulu.");
          return;
        }

        const quantity = Number(form.get("quantity") ?? 1);
        const name = String(form.get("name") ?? "").trim();
        const whatsappNumber = String(form.get("whatsapp_number") ?? "").trim();
        const address = String(form.get("address") ?? "").trim();
        const notes = String(form.get("notes") ?? "").trim();
        const variant = product.variants?.[0] ?? null;

        if (!product.is_active) {
          setMessage("Produk ini sedang nonaktif.");
          return;
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
          setMessage("Jumlah harus angka bulat minimal 1.");
          return;
        }

        if (variant && quantity > variant.stock) {
          setMessage(`Stok ${product.name} hanya tersisa ${variant.stock}.`);
          return;
        }

        if (name.length < 2) {
          setMessage("Nama minimal 2 karakter.");
          return;
        }

        if (!validateWhatsapp(whatsappNumber)) {
          setMessage("Nomor WhatsApp harus format Indonesia, contoh +6281234567890.");
          return;
        }

        if (address.length < 5) {
          setMessage("Alamat minimal 5 karakter.");
          return;
        }

        if (notes.length > 500) {
          setMessage("Catatan maksimal 500 karakter.");
          return;
        }

        setMessage("Membuat order...");
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_id: business.id,
            source: "WEB",
            customer: {
              name,
              whatsapp_number: whatsappNumber,
              phone: whatsappNumber,
              address,
              segment: "NEW",
            },
            shipping_cost: 0,
            discount_total: 0,
            notes,
            items: [
              {
                product_id: product.id,
                product_variant_id: variant?.id ?? null,
                product_name: product.name,
                variant_name: variant?.name ?? null,
                quantity,
                price: product.price,
              },
            ],
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          setMessage(payload?.error ?? "Gagal membuat order.");
          return;
        }

        setOrderCode(payload?.order?.order_code ?? null);
        event.currentTarget.reset();
        setMessage("Order berhasil dibuat.");
      }}
    >
      {message ? (
        <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
          {message}
          {orderCode ? (
            <a className="ml-2 font-medium text-primary" href={`/order/${orderCode}`}>
              Lihat {orderCode}
            </a>
          ) : null}
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="product_id">Produk</Label>
        <Select id="product_id" name="product_id" required>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="quantity">Jumlah</Label>
        <Input id="quantity" name="quantity" type="number" min={1} step={1} defaultValue={1} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="name">Nama</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="whatsapp_number">WhatsApp</Label>
        <Input id="whatsapp_number" name="whatsapp_number" placeholder="+628..." required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Alamat</Label>
        <Textarea id="address" name="address" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea id="notes" maxLength={500} name="notes" />
      </div>
      <Button type="submit">
        <ShoppingBag className="h-4 w-4" aria-hidden />
        Checkout
      </Button>
    </form>
  );
}
