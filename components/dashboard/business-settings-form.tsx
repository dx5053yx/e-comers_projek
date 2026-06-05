"use client";

import { ImageUp, Save } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Business } from "@/lib/types";
import { slugify } from "@/lib/utils";

export function BusinessSettingsForm({ business }: { business: Business }) {
  const [message, setMessage] = useState<string | null>(null);
  const [qrisImageUrl, setQrisImageUrl] = useState(business.qris_image_url ?? "");
  const [isUploadingQris, setIsUploadingQris] = useState(false);
  const router = useRouter();

  function validateWhatsapp(value: string) {
    if (!value) {
      return true;
    }

    return /^(\+62|62|0)8[0-9]{7,12}$/.test(value.replace(/\s|-/g, ""));
  }

  async function uploadQris(file: File) {
    if (!file.type.startsWith("image/")) {
      setMessage("File QRIS harus berupa gambar.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setMessage("Ukuran QRIS maksimal 3 MB.");
      return;
    }

    try {
      setIsUploadingQris(true);
      setMessage("Mengupload QRIS...");

      const supabase = createSupabaseBrowserClient();
      const bucket =
        process.env.NEXT_PUBLIC_SUPABASE_QRIS_IMAGES_BUCKET ?? "qris-images";
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${business.id}/qris-${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        setMessage(`Upload QRIS gagal: ${error.message}`);
        return;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);

      setQrisImageUrl(data.publicUrl);
      setMessage("QRIS berhasil diupload. Klik Simpan setting untuk menyimpan ke profil bisnis.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload QRIS gagal.");
    } finally {
      setIsUploadingQris(false);
    }
  }

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const name = String(form.get("name") ?? "").trim();
        const slug = String(form.get("slug") ?? "").trim() || slugify(name);
        const whatsappNumber = String(form.get("whatsapp_number") ?? "").trim();
        const description = String(form.get("description") ?? "").trim();
        const address = String(form.get("address") ?? "").trim();
        const paymentInstructions = String(form.get("payment_instructions") ?? "").trim();
        const qrisUrl = String(form.get("qris_image_url") ?? "").trim();

        if (name.length < 2) {
          setMessage("Nama bisnis minimal 2 karakter.");
          return;
        }

        if (!/^[a-z0-9-]+$/.test(slug)) {
          setMessage("Slug hanya boleh huruf kecil, angka, dan tanda hubung.");
          return;
        }

        if (!validateWhatsapp(whatsappNumber)) {
          setMessage("Nomor WhatsApp harus format Indonesia, contoh +6281234567890.");
          return;
        }

        if (description.length > 1000) {
          setMessage("Deskripsi maksimal 1000 karakter.");
          return;
        }

        if (paymentInstructions.length > 1000) {
          setMessage("Instruksi pembayaran maksimal 1000 karakter.");
          return;
        }

        if (qrisUrl && !URL.canParse(qrisUrl)) {
          setMessage("URL QRIS tidak valid.");
          return;
        }

        setMessage("Menyimpan profil bisnis...");
        const response = await fetch(`/api/businesses/${business.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            slug,
            category: String(form.get("category") ?? "").trim() || null,
            whatsapp_number: whatsappNumber || null,
            description: description || null,
            address: address || null,
            payment_instructions: paymentInstructions || null,
            qris_image_url: qrisUrl || null,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          setMessage(payload?.error ?? "Gagal menyimpan profil bisnis.");
          return;
        }

        setMessage("Profil bisnis tersimpan.");
        router.refresh();
      }}
    >
      {message ? (
        <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm md:col-span-2">
          {message}
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="name">Nama bisnis</Label>
        <Input
          id="name"
          name="name"
          defaultValue={business.name}
          placeholder="Contoh: Warung Bakso Pak Budi"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Slug katalog</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={business.slug}
          placeholder="Contoh: warung-bakso-pak-budi"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category">Kategori</Label>
        <Input
          id="category"
          name="category"
          defaultValue={business.category ?? ""}
          placeholder="Contoh: Kuliner / Fashion / Kerajinan"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="whatsapp_number">Nomor WhatsApp</Label>
        <Input
          id="whatsapp_number"
          name="whatsapp_number"
          defaultValue={business.whatsapp_number ?? ""}
          placeholder="Contoh: +6281234567890"
        />
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="address">Alamat</Label>
        <Textarea
          id="address"
          name="address"
          defaultValue={business.address ?? ""}
          placeholder="Contoh: Jl. Letkol Iskandar No. 10, Purbalingga"
        />
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={business.description ?? ""}
          placeholder="Contoh: Menjual bakso rumahan, minuman dingin, dan menerima pesanan lewat WhatsApp."
        />
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="payment_instructions">Instruksi pembayaran</Label>
        <Textarea
          id="payment_instructions"
          name="payment_instructions"
          defaultValue={business.payment_instructions ?? ""}
          placeholder="Contoh: Transfer/scan QRIS sesuai nominal order, lalu kirim bukti pembayaran ke WhatsApp."
        />
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="qris_file">QRIS toko untuk order WhatsApp</Label>
        <div className="grid gap-3 rounded-md border border-border bg-muted/30 p-4 md:grid-cols-[180px_1fr]">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-card">
            {qrisImageUrl ? (
              <Image
                src={qrisImageUrl}
                alt="Preview QRIS toko"
                fill
                className="object-contain p-2"
              />
            ) : (
              <ImageUp className="h-8 w-8 text-muted-foreground" aria-hidden />
            )}
          </div>
          <div className="space-y-3">
            <Input
              id="qris_file"
              type="file"
              accept="image/*"
              disabled={isUploadingQris}
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  uploadQris(file);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              QRIS ini akan dikirim sebagai link pembayaran saat customer membuat order lewat WhatsApp.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="qris_image_url">URL QRIS</Label>
        <Input
          id="qris_image_url"
          name="qris_image_url"
          type="url"
          value={qrisImageUrl}
          onChange={(event) => setQrisImageUrl(event.target.value)}
          placeholder="Contoh: https://domain.com/qris-toko.jpg"
        />
      </div>
      <div className="md:col-span-2">
        <Button disabled={isUploadingQris} type="submit">
          <Save className="h-4 w-4" aria-hidden />
          Simpan setting
        </Button>
      </div>
    </form>
  );
}
