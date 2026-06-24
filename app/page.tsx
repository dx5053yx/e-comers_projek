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
    description: "Bot menjawab pertanyaan pelanggan soal produk, harga, stok, dan cara pesan. Tanpa kamu harus standby.",
  },
  {
    icon: ShoppingCart,
    title: "Catat Pesanan Otomatis",
    description: "AI membaca chat order dan langsung catat ke dashboard tanpa input ulang.",
  },
  {
    icon: BarChart3,
    title: "Insight Penjualan",
    description: "Pemilik UMKM bisa melihat order, customer, payment, dan produk terlaris.",
  },
];

const steps = [
  {
    number: "1",
    title: "Daftar UMKM",
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
    description: "Pesanan, pembayaran, pengiriman, dan review masuk otomatis.",
  },
];

const plans = [
  {
    name: "Gratis",
    price: "Rp 0",
    suffix: "/bulan",
    description: "Cocok untuk UMKM yang baru mulai.",
    features: [
      "Profil UMKM",
      "Katalog dasar",
      "Auto-reply chat",
      "Catat pesanan",
    ],
    cta: "Masuk Dashboard",
    href: "/login",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "Rp 100.000",
    suffix: "/bulan",
    description: "Untuk UMKM yang ingin grow lebih cepat.",
    features: [
      "Semua fitur Gratis",
      "Analytics lanjutan",
      "Custom AI tone",
      "Support prioritas",
    ],
    cta: "Mulai Premium",
    href: "/login",
    highlighted: true,
  },
];

export default async function Home() {
  const businesses = await getPublicBusinesses();
  const totalProducts = businesses.reduce((total, business) => total + business.product_count, 0);

  return (
    <main className="min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text)] font-sans">
      <header className="sticky top-0 z-30 bg-[color-mix(in_srgb,var(--landing-bg)_92%,transparent)] backdrop-blur border-b border-[var(--border-subtle)]">
        <div className="container-page flex min-h-16 items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/">
            <span className="relative h-9 w-9 overflow-hidden rounded bg-[var(--card)]">
              <Image src="/logo.png" alt="Logo siPandu" fill className="object-cover" />
            </span>
            <span className="text-xl font-bold text-primary">siPandu</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-bold md:flex text-[var(--muted-foreground)]">
            <Link className="transition hover:text-primary" href="#fitur">Fitur</Link>
            <Link className="transition hover:text-primary" href="#cara-kerja">Cara Kerja</Link>
            <Link className="transition hover:text-primary" href="#harga">Harga</Link>
            <Link className="transition hover:text-primary" href="#umkm">UMKM</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle showLabel={false} />
            <Link className="btn btn--ghost sm:hidden" href="/dashboard">Masuk</Link>
            <Link className="btn btn--ghost hidden sm:inline-flex" href="/dashboard">Masuk Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[var(--landing-bg)] py-16 md:py-24">
        <div className="container-page relative grid min-h-[600px] gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="chat-window shadow-xl border border-[var(--border)] max-w-lg mx-auto w-full order-2 lg:order-1 relative h-full flex flex-col justify-end min-h-[480px]">
            <div className="chat-day-separator">Rabu, 4 Juni 2026</div>
            <div className="bubble bubble--outgoing text-foreground font-medium z-10">
              <div className="bubble__sender">siPandu Bot</div>
              Selamat datang di Warung Bu Sari! Ada yang bisa kami bantu?
              <div className="bubble__time">10:00 ✓</div>
            </div>
            
            <div className="bubble bubble--incoming text-foreground font-medium z-10">
              mendoan 10 sama es teh 2, ambil jam 5
              <div className="bubble__time">10:02 ✓✓</div>
            </div>

            <div className="bubble bubble--outgoing relative z-10 text-foreground font-medium">
              <div className="bubble__sender">siPandu Bot</div>
              Siap kak! Pesanannya:<br/>
              <span className="font-mono mt-2 block">10 Mendoan — Rp 20.000</span>
              <span className="font-mono block">2 Es Teh  — Rp  8.000</span>
              <span className="font-mono font-bold block mt-1">Total: Rp 28.000 ✓</span>
              <div className="mt-3 flex items-center gap-2 rounded bg-[var(--card)] p-2">
                <div className="h-10 w-10 bg-[var(--muted)] rounded shrink-0 flex items-center justify-center text-xs font-bold text-primary border border-[var(--border)]">QRIS</div>
                <div className="text-xs text-[var(--muted-foreground)]">Silahkan scan QRIS untuk pembayaran.</div>
              </div>
              <div className="bubble__time">10:02 ✓</div>
            </div>

          </div>
          
          <div className="order-1 lg:order-2">
            <h1 className="text-5xl font-bold leading-[1.1] md:text-6xl text-[var(--foreground)] tracking-tight">
              Warung <br/><span className="text-primary">Naik Kelas</span><br/>dengan siPandu.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted-foreground)]">
              Bot WhatsApp yang bekerja 24/7 membalas pelanggan, mencatat pesanan, dan mengelola stok. Biar kamu bisa fokus jualan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn btn--primary" href="/login">Mulai Sekarang</Link>
              <Link className="btn btn--ghost" href="#cara-kerja">Lihat Cara Kerja</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Utama */}
      <section id="fitur" className="bg-[var(--landing-surface)] py-16 md:py-24 border-t border-[var(--border-subtle)]">
        <div className="container-page">
          <SectionIntro eyebrow="FITUR UTAMA" title="Bukan Sekadar Bot Biasa" description="" align="left" />
          
          <div className="mt-16 flex flex-col gap-16">
            {features.map((feature, idx) => (
              <div key={feature.title} className={`flex flex-col gap-10 md:items-center ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="flex-1 chat-window border border-[var(--border)] max-w-md w-full mx-auto shadow-md">
                  {idx === 0 ? (
                    <>
                      <div className="bubble bubble--incoming text-foreground font-medium">stok mendoan masih?</div>
                      <div className="bubble bubble--outgoing text-foreground font-medium">
                        <div className="bubble__sender">siPandu Bot</div>
                        Masih ada kak, 50 biji. Langsung digoreng anget-anget.
                      </div>
                    </>
                  ) : idx === 1 ? (
                     <>
                      <div className="bubble bubble--incoming text-foreground font-medium">pesan seblak 1 ya, pedas pol</div>
                      <div className="bubble bubble--outgoing text-foreground font-medium">
                        <div className="bubble__sender">siPandu Bot</div>
                        Dicatat! SP-20260604-001 masuk ke antrean dapur.
                      </div>
                    </>
                  ) : (
                    <div className="bg-[var(--card)] p-4 rounded-md border border-[var(--border)]">
                      <div className="font-mono text-3xl font-bold text-foreground mb-1">Rp 1.234.500</div>
                      <div className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Total penjualan hari ini</div>
                      <div className="mt-6 flex gap-2"><div className="h-2 w-full bg-primary rounded"></div><div className="h-2 w-2/3 bg-[var(--accent)] rounded"></div></div>
                    </div>
                  )}
                </div>
                <div className="flex-1 max-w-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--muted)] text-primary mb-6">
                    <feature.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section id="cara-kerja" className="bg-[var(--landing-bg)] py-16 md:py-24 border-t border-[var(--border-subtle)]">
        <div className="container-page">
          <SectionIntro eyebrow="CARA KERJA" title="4 Langkah Mudah" description="" align="center" />
          
          <div className="mt-16 relative">
            <div className="hidden md:block absolute top-6 left-12 right-12 h-[3px] bg-[var(--primary)] z-0"></div>
            <div className="grid gap-10 md:grid-cols-4 relative z-10">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-xl flex items-center justify-center border-4 border-[var(--landing-bg)] shadow-md">
                    {step.number}
                  </div>
                  <h3 className="mt-6 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)] px-2">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Harga */}
      <section id="harga" className="bg-[var(--landing-surface)] py-16 md:py-24 border-t border-[var(--border-subtle)]">
        <div className="container-page">
          <SectionIntro eyebrow="HARGA" title="Investasi Warung Digital" description="" align="center" />
          
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.highlighted
                    ? "relative rounded-xl bg-[var(--landing-premium)] p-8 text-white shadow-xl border border-[var(--landing-premium)] flex flex-col"
                    : "rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-8 shadow-sm flex flex-col"
                }
              >
                {plan.highlighted && (
                  <span className="absolute right-5 top-5 rounded bg-[var(--accent)] px-3 py-1 text-xs font-bold uppercase text-[var(--accent-foreground)]">
                    HOT
                  </span>
                )}
                <h3 className={`text-xl font-bold ${plan.highlighted ? 'text-primary' : 'text-foreground'}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-end font-mono">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`mb-1 ml-1 text-sm ${plan.highlighted ? 'text-white/70' : 'text-[var(--muted-foreground)]'}`}>
                    {plan.suffix}
                  </span>
                </div>
                <p className={`mt-4 text-sm ${plan.highlighted ? 'text-white/80' : 'text-[var(--muted-foreground)]'}`}>
                  {plan.description}
                </p>
                <div className="mt-8 space-y-4 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm font-medium">
                      <Check className={`h-4 w-4 ${plan.highlighted ? 'text-primary' : 'text-primary'}`} />
                      <span className={plan.highlighted ? 'text-white/90' : 'text-foreground'}>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  className={`mt-8 w-full ${plan.highlighted ? 'btn btn--primary' : 'btn btn--ghost'}`}
                  href={plan.href}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UMKM */}
      <section id="umkm" className="bg-[var(--landing-bg)] py-16 md:py-24 border-t border-[var(--border-subtle)] overflow-hidden">
        <div className="container-page">
          <div className="flex items-end justify-between mb-10">
            <SectionIntro eyebrow="UMKM TERDAFTAR" title="Jejaring Warung Digital" description="Mulai belanja langsung dari warung favoritmu." align="left" />
            <Link href="/umkm" className="hidden md:flex text-sm font-semibold text-primary hover:underline">Lihat Semua →</Link>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x -mx-4 px-4 md:mx-0 md:px-0">
            {businesses.length > 0 ? businesses.map((business) => {
              const waUrl = createWhatsAppUrl(business.whatsapp_number, `Halo ${business.name}...`);
              return (
                <div key={business.id} className="snap-start shrink-0 w-72 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] overflow-hidden flex flex-col shadow-sm">
                  {business.logo_url ? (
                    <div className="h-32 bg-[var(--muted)] relative">
                      <Image src={business.logo_url} alt={business.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 bg-[var(--muted)] flex items-center justify-center text-primary">
                      <Store className="h-8 w-8" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg truncate">{business.name}</h3>
                    <p className="text-xs font-bold text-[var(--muted-foreground)] mt-1 uppercase tracking-wider">{business.category ?? "UMKM"} · {business.product_count} produk</p>
                    <div className="mt-auto pt-6 flex gap-2">
                      <Link href={`/katalog/${business.slug}`} className="btn btn--ghost flex-1 text-xs h-9">Katalog</Link>
                      {waUrl && <Link href={waUrl} target="_blank" className="btn btn--accent text-[var(--accent-foreground)] px-3 h-9"><MessageSquare className="h-4 w-4"/></Link>}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="p-8 border border-[var(--border)] rounded text-center w-full text-[var(--muted-foreground)]">Belum ada UMKM aktif.</div>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-[var(--landing-footer)] py-12 text-white/70">
        <div className="container-page flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-white">
            <Bot className="h-6 w-6 text-primary" />
            siPandu
          </div>
          <div className="text-sm">© 2026 siPandu. Purbalingga.</div>
        </div>
      </footer>
    </main>
  );
}

function SectionIntro({ eyebrow, title, description, align = "center" }: any) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{eyebrow}</div>
      <h2 className="text-3xl font-bold leading-tight md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-[var(--muted-foreground)] text-lg">{description}</p>}
    </div>
  );
}
