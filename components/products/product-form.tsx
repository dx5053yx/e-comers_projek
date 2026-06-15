"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUp, Save } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/form";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import { parseRupiahInput, slugify } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().trim().min(2, "Nama produk minimal 2 karakter."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung.")
    .optional(),
  sku: z.string().trim().max(64, "SKU maksimal 64 karakter.").optional(),
  description: z.string().trim().max(1000, "Deskripsi maksimal 1000 karakter.").optional(),
  price: z.preprocess(
    parseRupiahInput,
    z.coerce.number().positive("Harga harus lebih dari 0."),
  ),
  image_url: z
    .string()
    .trim()
    .refine(
      (value) => !value || value.startsWith("/") || URL.canParse(value),
      "URL foto tidak valid.",
    )
    .optional()
    .or(z.literal("")),
  is_active: z.coerce.boolean().default(true),
  variant_name: z.string().trim().min(1, "Nama varian wajib diisi."),
  variant_sku: z.string().optional(),
  stock: z.coerce.number().int("Stok harus angka bulat.").min(0, "Stok tidak boleh minus."),
  low_stock_threshold: z.coerce
    .number()
    .int("Threshold harus angka bulat.")
    .min(0, "Threshold tidak boleh minus."),
});

type ProductFormInput = z.input<typeof formSchema>;
type ProductFormValues = z.output<typeof formSchema>;

function FieldError({ message }: { message?: unknown }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-danger">{String(message)}</p>;
}

export function ProductForm({
  businessId,
  product,
}: {
  businessId: string;
  product?: Product | null;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const defaultVariant = product?.variants?.[0];
  const defaultValues = useMemo<ProductFormInput>(
    () => ({
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      sku: product?.sku ?? "",
      description: product?.description ?? "",
      price: product?.price ?? "",
      image_url: product?.image_url ?? "",
      is_active: product?.is_active ?? true,
      variant_name: defaultVariant?.name ?? "Default",
      variant_sku: defaultVariant?.sku ?? "",
      stock: defaultVariant?.stock ?? "",
      low_stock_threshold: defaultVariant?.low_stock_threshold ?? 5,
    }),
    [defaultVariant, product],
  );
  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const imageUrl = useWatch({
    control: form.control,
    name: "image_url",
  });

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setMessage("File harus berupa gambar.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setMessage("Ukuran gambar maksimal 3 MB.");
      return;
    }

    try {
      setIsUploading(true);
      setMessage("Mengupload foto produk...");

      const supabase = createSupabaseBrowserClient();
      const bucket =
        process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET ?? "product-images";
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const safeName = slugify(form.getValues("name") || "produk");
      const path = `${businessId}/${safeName}-${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        setMessage(`Upload gagal: ${error.message}`);
        return;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);

      form.setValue("image_url", data.publicUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setMessage("Foto produk berhasil diupload.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload foto gagal.");
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmit(values: ProductFormValues) {
    setMessage("Menyimpan produk...");
    const endpoint = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PATCH" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_id: businessId,
        name: values.name,
        slug: values.slug || slugify(values.name),
        sku: values.sku || null,
        description: values.description || null,
        price: values.price,
        image_url: values.image_url || null,
        is_active: values.is_active,
        variants: [
          {
            id: defaultVariant?.id,
            name: values.variant_name,
            sku: values.variant_sku || null,
            price_adjustment: 0,
            stock: values.stock,
            low_stock_threshold: values.low_stock_threshold,
            is_active: true,
          },
        ],
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setMessage(payload?.error ?? "Gagal menyimpan produk.");
      return;
    }

    setMessage("Produk tersimpan.");
    router.push("/dashboard/products");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? "Edit produk" : "Produk baru"}</CardTitle>
      </CardHeader>
      <CardContent>
        {message ? (
          <div className="mb-4 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
            {message}
          </div>
        ) : null}
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Nama produk</Label>
            <Input
              id="name"
              placeholder="Contoh: Bakso mantap-mantep"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="Contoh: bakso-mantap-mantep"
              aria-invalid={Boolean(form.formState.errors.slug)}
              {...form.register("slug")}
            />
            <FieldError message={form.formState.errors.slug?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              placeholder="Contoh: BKS-001"
              aria-invalid={Boolean(form.formState.errors.sku)}
              {...form.register("sku")}
            />
            <FieldError message={form.formState.errors.sku?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Harga</Label>
            <Input
              id="price"
              inputMode="numeric"
              placeholder="Contoh: 15.000"
              aria-invalid={Boolean(form.formState.errors.price)}
              {...form.register("price")}
            />
            <p className="text-xs text-muted-foreground">
              Boleh pakai titik ribuan, contoh 13.000.
            </p>
            <FieldError message={form.formState.errors.price?.message} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="is_active">Status produk</Label>
            <label className="flex items-center gap-3 rounded-md border border-border bg-white px-3 py-2 text-sm">
              <input
                id="is_active"
                type="checkbox"
                className="h-4 w-4"
                {...form.register("is_active")}
              />
              Aktif dan tampil di katalog/chatbot
            </label>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Contoh: Bakso pedas isi 10, cocok untuk makan siang."
              aria-invalid={Boolean(form.formState.errors.description)}
              {...form.register("description")}
            />
            <FieldError message={form.formState.errors.description?.message} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="image_file">Upload foto produk</Label>
            <div className="grid gap-3 rounded-md border border-border bg-muted/30 p-4 md:grid-cols-[160px_1fr]">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-card">
                {imageUrl ? (
                  <Image
                    src={String(imageUrl)}
                    alt="Preview foto produk"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <ImageUp className="h-8 w-8 text-muted-foreground" aria-hidden />
                )}
              </div>
              <div className="space-y-3">
                <Input
                  id="image_file"
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      uploadImage(file);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Format gambar bebas, maksimal 3 MB. URL hasil upload akan otomatis masuk ke field di bawah.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="image_url">URL foto produk</Label>
            <Input
              id="image_url"
              type="url"
              placeholder="Contoh: https://domain.com/foto-produk.jpg"
              aria-invalid={Boolean(form.formState.errors.image_url)}
              {...form.register("image_url")}
            />
            <FieldError message={form.formState.errors.image_url?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variant_name">Nama varian</Label>
            <Input
              id="variant_name"
              placeholder="Contoh: Default / Pedas / Original"
              aria-invalid={Boolean(form.formState.errors.variant_name)}
              {...form.register("variant_name")}
            />
            <FieldError message={form.formState.errors.variant_name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variant_sku">SKU varian</Label>
            <Input id="variant_sku" placeholder="Contoh: BKS-PDS-001" {...form.register("variant_sku")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stok</Label>
            <Input
              id="stock"
              min={0}
              step={1}
              type="number"
              placeholder="Contoh: 25"
              aria-invalid={Boolean(form.formState.errors.stock)}
              {...form.register("stock")}
            />
            <FieldError message={form.formState.errors.stock?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="low_stock_threshold">Low stock threshold</Label>
            <Input
              id="low_stock_threshold"
              min={0}
              placeholder="Contoh: 5"
              step={1}
              type="number"
              aria-invalid={Boolean(form.formState.errors.low_stock_threshold)}
              {...form.register("low_stock_threshold")}
            />
            <FieldError message={form.formState.errors.low_stock_threshold?.message} />
          </div>
          <div className="md:col-span-2">
            <Button disabled={isUploading} type="submit">
              <Save className="h-4 w-4" aria-hidden />
              Simpan produk
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
