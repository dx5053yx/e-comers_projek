import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  PackageCheck,
  Sparkles,
  Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPublicBusinesses } from "@/lib/data/public-queries";
import type { PublicBusinessSummary } from "@/lib/data/public-queries";
import { createWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const workflow = [
  {
    icon: MessageCircle,
    title: "WhatsApp terhubung",
    description: "Pemilik toko cukup scan QR dari dashboard. Slug toko otomatis ikut terhubung.",
  },
  {
    icon: Bot,
    title: "AI membalas customer",
    description: "AI membaca chat, menjawab pertanyaan, membuat order, dan mengirim QRIS jika sudah disiapkan.",
  },
  {
    icon: ClipboardList,
    title: "Order masuk rapi",
    description: "Pesanan, customer, payment, pengiriman, review, dan stok tercatat di satu dashboard.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Rp0",
    description: "Simulasi untuk UMKM yang baru mencoba katalog dan dashboard order.",
    features: ["Katalog publik", "Dashboard order", "Upload produk", "Payment manual"],
  },
  {
    name: "Growth",
    price: "Rp49rb",
    description: "Simulasi paket untuk toko yang ingin WhatsApp AI aktif harian.",
    features: ["WhatsApp AI", "QRIS statis", "Prompt custom", "Laporan penjualan"],
  },
  {
    name: "Partner",
    price: "Custom",
    description: "Simulasi untuk komunitas UMKM, koperasi, atau pendamping digital.",
    features: ["Multi bisnis", "Onboarding seller", "Monitoring bisnis", "Dukungan setup"],
  },
];

export default async function Home() {
  const businesses = await getPublicBusinesses();
  const featuredBusinesses = businesses.slice(0, 3);
  const totalProducts = businesses.reduce((total, business) => total + business.product_count, 0);
  const stats = [
    { label: "UMKM terdaftar", value: businesses.length.toString() },
    { label: "Produk aktif", value: totalProducts.toString() },
    { label: "Alur demo", value: "WA + order" },
  ];

  return (
    <main>
      <section className="relative min-h-[88vh] overflow-hidden bg-[#062d2f] text-white">
        <Image
          src="/hero-sipandu.png"
          alt="Pemilik UMKM memakai chat WhatsApp dan dashboard penjualan"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#052d2f]/78" />
        <div className="container-page relative flex min-h-[88vh] flex-col justify-between py-5">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link className="flex items-center gap-3" href="/">
              <span className="relative h-12 w-12 overflow-hidden rounded-md bg-white">
                <Image src="/logo.png" alt="Logo siPandu" fill className="object-cover" />
              </span>
              <span>
                <span className="block text-xl font-semibold leading-none">siPandu</span>
                <span className="mt-1 block text-xs text-white/70">Asisten Pintar UMKM</span>
              </span>
            </Link>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/82">
              <Link className="hover:text-white" href="#tentang">Tentang</Link>
              <Link className="hover:text-white" href="#fitur">Fitur</Link>
              <Link className="hover:text-white" href="#simulasi">Simulasi</Link>
              <Link className="hover:text-white" href="/umkm">UMKM</Link>
              <Link className="hover:text-white" href="/login">Login</Link>
              <Link href="/register">
                <Button size="sm">Daftar</Button>
              </Link>
            </div>
          </nav>

          <div className="max-w-3xl pb-10">
            <p className="mb-4 inline-flex rounded-md border border-white/25 bg-white/12 px-3 py-1 text-sm text-white/90 backdrop-blur">
              WhatsApp AI, katalog, order, stok, dan laporan untuk UMKM lokal
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-tight sm:text-6xl">
              Asisten toko yang bantu UMKM jualan dari chat WhatsApp.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
              siPandu membantu pemilik usaha membalas customer, mencatat order, menampilkan katalog,
              mengelola stok, dan memantau penjualan tanpa harus mengurus sistem rumit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg">
                  Mulai hubungkan toko
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <Link href="/umkm">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/35 bg-white/10 text-white hover:bg-white/20"
                >
                  Lihat UMKM terdaftar
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-md border border-white/18 bg-white/10 px-4 py-3 backdrop-blur"
                >
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-white/65">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="tentang" className="border-b border-border bg-background py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Tentang siPandu
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Dibuat untuk UMKM yang kuat di produk, tapi butuh sistem yang lebih rapi.
            </h2>
          </div>
          <div className="space-y-4 text-base leading-8 text-muted-foreground">
            <p>
              Banyak UMKM sudah aktif di WhatsApp, tapi order masih tercecer, stok sulit dipantau,
              dan customer menunggu lama. siPandu menjadi lapisan kerja yang membantu toko tetap
              responsif tanpa mengganti kebiasaan jualan yang sudah ada.
            </p>
            <p>
              Pemilik toko cukup mengelola produk, upload QRIS, dan menghubungkan WhatsApp dari
              dashboard. Setelah itu AI membantu percakapan awal, sementara admin tetap bisa
              mengambil alih saat dibutuhkan.
            </p>
          </div>
        </div>
      </section>

      <section id="fitur" className="bg-card py-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Fitur utama
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Satu alur dari chat sampai laporan.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {workflow.map((item) => (
              <div key={item.title} className="rounded-md border border-border bg-background p-5">
                <item.icon className="h-6 w-6 text-primary" aria-hidden />
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              "Katalog publik",
              "Upload foto produk",
              "Verifikasi pembayaran",
              "Pengiriman dan review",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-md border border-border bg-background px-4 py-3 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="simulasi" className="border-y border-border bg-background py-16">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Simulasi langganan
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Paket bisa disesuaikan saat produk dipakai nyata.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Angka di bawah masih simulasi untuk presentasi dan validasi kebutuhan UMKM.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className="rounded-md border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                  </div>
                  <p className="text-xl font-semibold text-primary">{plan.price}</p>
                </div>
                <div className="mt-5 space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Direktori UMKM
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Toko yang sudah terdaftar.</h2>
            </div>
            <Link href="/umkm">
              <Button variant="secondary">
                Lihat semua UMKM
                <Store className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featuredBusinesses.map((business) => {
              const waUrl = createWhatsAppUrl(
                business.whatsapp_number,
                `Halo ${business.name}, saya mau tanya produk yang tersedia.`,
              );

              return (
                <div key={business.id} className="rounded-md border border-border bg-background p-5">
                  <div className="flex items-start gap-3">
                    <BusinessLogo business={business} />
                    <div>
                      <h3 className="font-semibold">{business.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {business.category ?? "UMKM"} - {business.product_count} produk
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
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
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#062d2f] py-16 text-white">
        <div className="container-page flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-2xl items-start gap-4">
            <Sparkles className="mt-1 h-7 w-7 text-accent" aria-hidden />
            <div>
              <h2 className="text-3xl font-semibold">Siapkan toko untuk dibalas lebih cepat.</h2>
              <p className="mt-2 text-white/75">
                Daftarkan UMKM, isi produk, hubungkan WhatsApp, lalu uji alur order dari customer.
              </p>
            </div>
          </div>
          <Link href="/register">
            <Button size="lg">Daftar sekarang</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

function BusinessLogo({ business }: { business: PublicBusinessSummary }) {
  if (business.logo_url) {
    return (
      <div
        className="h-11 w-11 shrink-0 rounded-md border border-border bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${business.logo_url}")` }}
        aria-label={`Logo ${business.name}`}
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
      <PackageCheck className="h-5 w-5" aria-hidden />
    </div>
  );
}
