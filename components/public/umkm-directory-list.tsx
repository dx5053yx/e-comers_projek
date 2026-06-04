"use client";

import { MapPin, MessageCircle, Package, Search, Store } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { PublicBusinessSummary } from "@/lib/data/public-queries";
import { createWhatsAppUrl } from "@/lib/whatsapp";

type UmkmDirectoryListProps = {
  businesses: PublicBusinessSummary[];
};

export function UmkmDirectoryList({ businesses }: UmkmDirectoryListProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");

  const categories = useMemo(() => {
    const items = new Set(
      businesses
        .map((business) => business.category?.trim())
        .filter((item): item is string => Boolean(item)),
    );

    return ["Semua", ...Array.from(items).sort()];
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return businesses.filter((business) => {
      const matchesCategory = category === "Semua" || business.category === category;
      const searchableText = [
        business.name,
        business.category,
        business.description,
        business.address,
        business.whatsapp_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [businesses, category, query]);

  if (!businesses.length) {
    return (
      <EmptyState
        title="Belum ada UMKM aktif"
        description="UMKM yang sudah membuat profil bisnis akan muncul di halaman ini."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Cari nama toko, kategori, atau lokasi"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                className={
                  item === category
                    ? "h-10 shrink-0 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                    : "h-10 shrink-0 rounded-md border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                }
                type="button"
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredBusinesses.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredBusinesses.map((business) => {
            const waUrl = createWhatsAppUrl(
              business.whatsapp_number,
              `Halo ${business.name}, saya mau tanya produk yang tersedia.`,
            );

            return (
              <article key={business.id} className="rounded-md border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <BusinessLogo business={business} />
                  <div>
                    <h2 className="text-lg font-semibold">{business.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {business.category ?? "UMKM"}
                    </p>
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {business.description ?? "UMKM terdaftar di siPandu."}
                </p>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" aria-hidden />
                    {business.product_count} produk aktif
                  </div>
                  {business.address ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" aria-hidden />
                      {business.address}
                    </div>
                  ) : null}
                  {business.whatsapp_number ? (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-primary" aria-hidden />
                      {business.whatsapp_number}
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/katalog/${business.slug}`}>
                    <Button size="sm" variant="outline">
                      Buka katalog
                    </Button>
                  </Link>
                  {waUrl ? (
                    <Link href={waUrl} target="_blank">
                      <Button size="sm" variant="secondary">
                        Chat WhatsApp
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Tidak ada UMKM yang cocok"
          description="Coba ubah kata pencarian atau pilih kategori lain."
        />
      )}
    </div>
  );
}

function BusinessLogo({ business }: { business: PublicBusinessSummary }) {
  if (business.logo_url) {
    return (
      <div
        className="h-12 w-12 shrink-0 rounded-md border border-border bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${business.logo_url}")` }}
        aria-label={`Logo ${business.name}`}
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
      <Store className="h-6 w-6" aria-hidden />
    </div>
  );
}
