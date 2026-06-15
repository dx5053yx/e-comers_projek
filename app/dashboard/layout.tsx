import { Eye, ExternalLink, LogOut, MessageSquareText, PackageCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/dashboard/actions";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { getCurrentBusinessAccess, isDemoMode } from "@/lib/data/queries";
import { formatWhatsAppNumber } from "@/lib/whatsapp";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const access = await getCurrentBusinessAccess();
  const business = access.business;
  const readOnly = access.role === "VIEWER";
  const demo = isDemoMode();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-[280px] border-r border-border bg-card/95 lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-5">
            <Link className="flex items-center gap-3" href="/">
              <span className="relative h-11 w-11 overflow-hidden rounded-md border border-border bg-white">
                <Image src="/logo.png" alt="Logo siPandu" fill className="object-cover" />
              </span>
              <span>
                <span className="block text-lg font-semibold leading-none">siPandu</span>
                <span className="mt-1 block text-xs text-muted-foreground">Dashboard UMKM</span>
              </span>
            </Link>
            <div className="mt-5 rounded-md border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{business?.name ?? "Belum ada bisnis"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {business?.category ?? "UMKM lokal"}
                  </p>
                </div>
                <Badge tone={demo || readOnly ? "amber" : "green"}>
                  {readOnly ? "Tamu" : demo ? "Demo" : "Aktif"}
                </Badge>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {formatWhatsAppNumber(business?.whatsapp_number)}
              </p>
            </div>
            <div className="mt-4">
              <BusinessSwitcher
                activeBusinessId={business?.id}
                memberships={access.memberships}
              />
            </div>
          </div>
          <DashboardNav readOnly={readOnly} />
          <div className="space-y-2 border-t border-border p-4">
            <ThemeToggle className="w-full justify-start" />
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-start gap-2 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground transition hover:border-danger/40 hover:text-danger"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Keluar
              </button>
            </form>
            <div className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-primary" aria-hidden />
              <span className="text-xs text-muted-foreground">
                {readOnly ? "Akses presentasi hanya-baca" : "Siap untuk demo dan deploy"}
              </span>
            </div>
          </div>
        </div>
      </aside>
      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between gap-3 px-3 sm:gap-4 sm:px-6">
            <div className="min-w-0">
              <Link className="flex items-center gap-3 lg:hidden" href="/">
                <span className="relative h-9 w-9 overflow-hidden rounded-md border border-border bg-white">
                  <Image src="/logo.png" alt="Logo siPandu" fill className="object-cover" />
                </span>
                <span className="text-base font-semibold text-primary">siPandu</span>
              </Link>
              <div className="hidden lg:block">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Ruang kerja toko
                </p>
                <p className="mt-1 truncate text-sm font-semibold">
                  {business?.name ?? "Belum ada bisnis"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {business?.slug ? (
                <Link
                  className="hidden h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:text-foreground lg:inline-flex"
                  href={`/katalog/${business.slug}`}
                  target="_blank"
                >
                  Katalog
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </Link>
              ) : null}
              <Link
                className="hidden h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 lg:inline-flex"
                href="/dashboard/whatsapp"
              >
                <MessageSquareText className="h-4 w-4" aria-hidden />
                <span>WhatsApp</span>
              </Link>
              <DashboardNav
                variant="mobile"
                catalogHref={business?.slug ? `/katalog/${business.slug}` : undefined}
                readOnly={readOnly}
                activeBusinessId={business?.id}
                memberships={access.memberships}
              />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] px-3 py-5 sm:px-6 sm:py-6 lg:py-8">
          {readOnly ? (
            <div className="mb-5 flex items-start gap-3 rounded-md border border-amber-300/70 bg-amber-100/70 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
              <Eye className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">Mode tamu hanya-baca</p>
                <p className="mt-1 leading-5">
                  Kamu dapat menjelajahi seluruh dashboard, tetapi perubahan data dinonaktifkan.
                </p>
              </div>
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
