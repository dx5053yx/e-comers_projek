import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UmkmDirectoryList } from "@/components/public/umkm-directory-list";
import { getPublicBusinesses } from "@/lib/data/public-queries";

export const dynamic = "force-dynamic";

export default async function UmkmDirectoryPage() {
  const businesses = await getPublicBusinesses();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4">
          <Link className="flex items-center gap-3" href="/">
            <span className="relative h-11 w-11 overflow-hidden rounded-md bg-white">
              <Image src="/logo.png" alt="Logo siPandu" fill className="object-cover" />
            </span>
            <span>
              <span className="block text-lg font-semibold leading-none">siPandu</span>
              <span className="mt-1 block text-xs text-muted-foreground">Direktori UMKM</span>
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium">
            <ThemeToggle showLabel={false} />
            <Link className="text-muted-foreground hover:text-foreground" href="/#tentang">
              Tentang
            </Link>
            <Link className="text-muted-foreground hover:text-foreground" href="/#simulasi">
              Simulasi
            </Link>
            <Link href="/login">
              <Button size="sm">Masuk Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-border bg-[#062d2f] py-14 text-white">
        <div className="container-page grid gap-8 md:grid-cols-[1fr_360px] md:items-end">
          <div>
            <p className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-1 text-sm">
              Informasi UMKM terdaftar
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold sm:text-5xl">
              Temukan toko lokal yang memakai siPandu.
            </h1>
            <p className="mt-4 max-w-2xl text-white/75">
              Pengunjung bisa melihat katalog, kontak WhatsApp, kategori usaha, dan jumlah produk
              aktif dari UMKM yang sudah masuk ke sistem.
            </p>
          </div>
          <div className="rounded-md border border-white/20 bg-white/10 p-5">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-accent" aria-hidden />
              <p className="font-medium">Total UMKM</p>
            </div>
            <p className="mt-4 text-4xl font-semibold">{businesses.length}</p>
            <p className="mt-2 text-sm text-white/70">Data aktif dari profil bisnis siPandu.</p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <UmkmDirectoryList businesses={businesses} />
        </div>
      </section>
    </main>
  );
}
