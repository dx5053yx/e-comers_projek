import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  MessageSquare,
  Package,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Store,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getPublicBusinesses } from "@/lib/data/public-queries";
import type { PublicBusinessSummary } from "@/lib/data/public-queries";
import { createWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: MessageSquare,
    title: "Auto-Reply 24/7",
    description: "Bot menjawab pertanyaan pelanggan soal produk, harga, stok, dan cara pesan.",
  },
  {
    icon: ShoppingCart,
    title: "Catat Pesanan Otomatis",
    description: "AI membaca chat order dan mencatat pesanan ke dashboard tanpa input ulang.",
  },
  {
    icon: BarChart3,
    title: "Insight Penjualan",
    description: "Pemilik UMKM bisa melihat order, customer, payment, dan produk terlaris.",
  },
  {
    icon: Package,
    title: "Kelola Katalog Produk",
    description: "Tambah produk, foto, harga, stok, dan status produk dari satu tempat.",
  },
  {
    icon: Users,
    title: "Multi-UMKM",
    description: "Satu platform untuk banyak toko dengan data yang tetap terpisah per UMKM.",
  },
  {
    icon: ShieldCheck,
    title: "Aman & Terpercaya",
    description: "Data bisnis tersimpan di Supabase dan akses dashboard memakai autentikasi.",
  },
];

const steps = [
  {
    number: "1",
    title: "Daftarkan UMKM",
    description: "Isi nama toko, kategori, alamat, dan profil bisnis.",
  },
  {
    number: "2",
    title: "Input Produk",
    description: "Masukkan produk, harga, foto, dan stok ke katalog digital.",
  },
  {
    number: "3",
    title: "Hubungkan WhatsApp",
    description: "Scan QR dari dashboard, lalu bot siap menerima chat customer.",
  },
  {
    number: "4",
    title: "Order Tercatat",
    description: "Pesanan, pembayaran, pengiriman, dan review masuk ke dashboard.",
  },
];

const plans = [
  {
    name: "Gratis",
    price: "Rp0",
    suffix: "/bulan",
    description: "Cocok untuk UMKM yang baru mulai.",
    features: [
      "Profil UMKM",
      "Katalog produk dasar",
      "Auto-reply chat",
      "Pencatatan pesanan",
      "Dashboard sederhana",
    ],
    cta: "Masuk Dashboard",
    href: "/login",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "Rp100.000",
    suffix: "/bulan",
    description: "Untuk UMKM yang ingin grow lebih cepat.",
    features: [
      "Semua fitur Gratis",
      "Prioritas rekomendasi",
      "Analytics lanjutan",
      "Support prioritas",
      "Custom AI tone",
    ],
    cta: "Masuk Dashboard",
    href: "/login",
    highlighted: true,
  },
];

export default async function Home() {
  const businesses = await getPublicBusinesses();
  const featuredBusinesses = businesses.slice(0, 3);
  const totalProducts = businesses.reduce((total, business) => total + business.product_count, 0);

  return (
    <main className="min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text)]">
      <header className="sticky top-0 z-30 border-b border-[var(--landing-border)] bg-[color-mix(in_srgb,var(--landing-bg)_92%,transparent)] backdrop-blur">
        <div className="container-page flex min-h-16 items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/">
            <span className="relative h-9 w-9 overflow-hidden rounded-md bg-card">
              <Image src="/logo.png" alt="Logo siPandu" fill className="object-cover" />
            </span>
            <span className="text-xl font-semibold text-primary">siPandu</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link className="transition hover:text-primary" href="#fitur">Fitur</Link>
            <Link className="transition hover:text-primary" href="#cara-kerja">Cara Kerja</Link>
            <Link className="transition hover:text-primary" href="#harga">Harga</Link>
            <Link className="transition hover:text-primary" href="#umkm">UMKM</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle showLabel={false} />
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 sm:px-4"
              href="/dashboard"
            >
              <span className="sm:hidden">Masuk</span>
              <span className="hidden sm:inline">Masuk Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[var(--landing-border)] bg-[var(--landing-bg)] py-16 md:py-20">
        <Image
          src="/hero-sipandu.png"
          alt="Pemilik UMKM memakai WhatsApp dan dashboard siPandu"
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-[var(--landing-hero-overlay)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[var(--landing-hero-fade)]" />

        <div className="container-page relative grid min-h-[680px] gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md bg-[var(--landing-soft)] px-3 py-2 text-xs font-bold uppercase text-primary">
              <Zap className="h-4 w-4" aria-hidden />
              Platform AI untuk UMKM
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.03] text-[var(--landing-text)] md:text-6xl">
              Chatbot <span className="text-primary">AI</span> untuk UMKM Purbalingga
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--landing-muted)]">
              siPandu membantu UMKM menjawab chat pelanggan 24/7, mencatat pesanan otomatis,
              mengelola katalog, dan membaca insight penjualan lewat WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
                href="/login"
              >
                Masuk Dashboard
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-md border-2 border-primary bg-[var(--landing-surface)] px-6 text-base font-semibold text-primary transition hover:bg-[var(--landing-soft)]"
                href="/umkm"
              >
                Lihat UMKM
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[560px] rounded-md border border-[var(--landing-border)] bg-[color-mix(in_srgb,var(--landing-surface)_94%,transparent)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur">
            <div className="flex items-center gap-2 border-b border-[var(--landing-border)] pb-3 text-sm font-semibold text-primary">
              <MessageSquare className="h-5 w-5" aria-hidden />
              Warung Mendoan Bu Sari
            </div>
            <div className="mt-4 space-y-4">
              <ChatBubble label="Pelanggan" side="left">
                Halo, mendoan ready?
              </ChatBubble>
              <ChatBubble label="siPandu Bot" side="right">
                Halo Kak, mendoan ready ya. Harganya Rp2.000/pcs. Mau pesan berapa?
              </ChatBubble>
              <ChatBubble label="Pelanggan" side="left">
                Pesan 10 mendoan sama 2 es teh, ambil jam 5 sore
              </ChatBubble>
              <ChatBubble label="siPandu Bot" side="right">
                <span className="block">Siap Kak, pesanannya:</span>
                <span className="mt-1 block">10 Mendoan - Rp20.000</span>
                <span className="block">2 Es Teh - Rp8.000</span>
                <span className="mt-1 block font-semibold">Total: Rp28.000</span>
                <span className="block">Pickup jam 17.00. Konfirmasi nama pemesan ya.</span>
              </ChatBubble>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="bg-[var(--landing-bg)] py-16 md:py-24">
        <div className="container-page">
          <SectionIntro
            eyebrow="Fitur Utama"
            title="Semua yang UMKM Butuhkan"
            description="Dari balasan otomatis sampai analisis penjualan, siPandu siap bantu UMKM kamu naik level."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-md border border-[var(--landing-border)] bg-[var(--landing-surface)] p-8 text-center shadow-[0_12px_36px_rgba(0,0,0,0.08)]"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-[var(--landing-soft)] text-primary">
                  <feature.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-6 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="bg-[var(--landing-surface)] py-16 md:py-24">
        <div className="container-page">
          <SectionIntro
            eyebrow="Cara Kerja"
            title="Mulai dalam 4 Langkah"
            description="Setup cepat, langsung bisa dipakai. Tidak perlu skill teknis."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="rounded-md border border-[var(--landing-border)] bg-[var(--landing-surface)] p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-base font-bold text-primary-foreground">
                  {step.number}
                </div>
                <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="harga" className="bg-[var(--landing-bg)] py-16 md:py-24">
        <div className="container-page">
          <SectionIntro
            eyebrow="Harga"
            title="Pilih Paket yang Cocok"
            description="Mulai gratis, upgrade kapan saja."
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.highlighted
                    ? "relative rounded-md bg-[var(--landing-premium)] p-8 text-white shadow-[0_22px_52px_rgba(0,0,0,0.22)]"
                    : "rounded-md border border-[var(--landing-border)] bg-[var(--landing-surface)] p-8 shadow-[0_14px_42px_rgba(0,0,0,0.08)]"
                }
              >
                {plan.highlighted ? (
                  <span className="absolute right-5 top-5 rounded-md bg-primary px-3 py-1 text-xs font-bold uppercase text-primary-foreground">
                    Populer
                  </span>
                ) : null}
                <p className={plan.highlighted ? "text-lg text-primary" : "text-lg text-[var(--landing-text)]"}>
                  {plan.name}
                </p>
                <div className="mt-6 flex items-end">
                  <span className="text-4xl font-semibold md:text-5xl">{plan.price}</span>
                  <span className={plan.highlighted ? "mb-2 text-sm text-white/75" : "mb-2 text-sm text-[var(--landing-muted)]"}>
                    {plan.suffix}
                  </span>
                </div>
                <p className={plan.highlighted ? "mt-6 leading-7 text-white/75" : "mt-6 leading-7 text-[var(--landing-muted)]"}>
                  {plan.description}
                </p>
                <div className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm">
                      <Check className={plan.highlighted ? "h-4 w-4 text-primary" : "h-4 w-4 text-primary"} aria-hidden />
                      {feature}
                    </div>
                  ))}
                </div>
                <Link
                  className={
                    plan.highlighted
                      ? "mt-8 inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                      : "mt-8 inline-flex h-12 w-full items-center justify-center rounded-md border-2 border-primary bg-[var(--landing-surface)] px-4 text-sm font-semibold text-primary transition hover:bg-[var(--landing-soft)]"
                  }
                  href={plan.href}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="umkm" className="bg-[var(--landing-surface)] py-16 md:py-24">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionIntro
              align="left"
              eyebrow="Direktori UMKM"
              title="UMKM yang Sudah Terdaftar"
              description={`${businesses.length} UMKM dan ${totalProducts} produk aktif bisa tampil di direktori siPandu.`}
            />
            <Link href="/umkm">
              <Button variant="secondary">
                Lihat semua UMKM
                <Store className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {featuredBusinesses.map((business) => {
              const waUrl = createWhatsAppUrl(
                business.whatsapp_number,
                `Halo ${business.name}, saya mau tanya produk yang tersedia.`,
              );

              return (
                <div key={business.id} className="overflow-hidden rounded-md border border-[var(--landing-border)] bg-[var(--landing-bg)]">
                  {business.logo_url ? (
                    <div className="relative h-36 bg-[var(--landing-soft)]">
                      <Image
                        src={business.logo_url}
                        alt={`Thumbnail ${business.name}`}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      {business.logo_url ? null : <BusinessLogo business={business} />}
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{business.name}</h3>
                        <p className="mt-1 text-xs text-[var(--landing-muted)]">
                          {business.category ?? "UMKM"} - {business.product_count} produk
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--landing-muted)]">
                      {business.description ?? "UMKM terdaftar di siPandu."}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link href={`/katalog/${business.slug}`}>
                        <Button size="sm" variant="outline">Katalog</Button>
                      </Link>
                      {waUrl ? (
                        <Link href={waUrl} target="_blank">
                          <Button size="sm" variant="secondary">WhatsApp</Button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
            {featuredBusinesses.length === 0 ? (
              <div className="rounded-md border border-[var(--landing-border)] bg-[var(--landing-bg)] p-6 text-sm text-[var(--landing-muted)] md:col-span-3">
                Belum ada UMKM aktif yang ditampilkan.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-[var(--landing-surface)] py-16 text-center md:py-24">
        <div className="container-page">
          <h2 className="text-3xl font-semibold md:text-4xl">
            Siap Tingkatkan Penjualan UMKM Kamu?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-[var(--landing-muted)]">
            Gabung dengan UMKM Purbalingga lainnya yang sudah pakai siPandu.
          </p>
          <Link
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
            href="/login"
          >
            Masuk Dashboard
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <footer className="bg-[var(--landing-footer)] py-10 text-white/72">
        <div className="container-page flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link className="flex items-center gap-3 font-semibold" href="/">
            <Bot className="h-5 w-5" aria-hidden />
            siPandu
          </Link>
          <p className="text-sm">2026 siPandu - Platform Chatbot AI untuk UMKM Purbalingga</p>
        </div>
      </footer>
    </main>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-[var(--landing-muted)]">{description}</p>
    </div>
  );
}

function ChatBubble({
  label,
  side,
  children,
}: {
  label: string;
  side: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <div className={side === "right" ? "ml-auto max-w-[78%]" : "max-w-[78%]"}>
      <div
        className={
          side === "right"
            ? "rounded-md bg-[var(--landing-chat-right)] px-4 py-3 text-sm leading-6"
            : "rounded-md bg-[var(--landing-chat-left)] px-4 py-3 text-sm leading-6"
        }
      >
        <p className="mb-1 text-xs font-bold text-[var(--landing-muted)]">{label}</p>
        {children}
      </div>
    </div>
  );
}

function BusinessLogo({ business }: { business: PublicBusinessSummary }) {
  if (business.logo_url) {
    return (
      <div
        className="h-11 w-11 shrink-0 rounded-md border border-[var(--landing-border)] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${business.logo_url}")` }}
        aria-label={`Logo ${business.name}`}
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--landing-soft)] text-primary">
      <PackageCheck className="h-5 w-5" aria-hidden />
    </div>
  );
}
