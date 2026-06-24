import { ExternalLink, LogOut, MessageSquareText, PackageCheck, Eye, Bell, Moon, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/dashboard/actions";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { TopRailNav, BottomTabBar } from "@/components/dashboard/dashboard-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { getCurrentBusinessAccess, isDemoMode } from "@/lib/data/queries";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const access = await getCurrentBusinessAccess();
  const business = access.business;
  const readOnly = access.role === "VIEWER";
  const demo = isDemoMode();

  return (
    <div className="min-h-screen bg-[var(--background)] pb-16 lg:pb-0">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[var(--card)] border-b border-[var(--border)]">
        <div className="flex items-center justify-between px-4 h-14 md:px-6">
          <div className="flex items-center gap-4">
            <Link className="flex items-center gap-2" href="/">
              <span className="relative h-8 w-8 overflow-hidden rounded bg-[var(--muted)] border border-[var(--border-subtle)]">
                <Image src="/logo.png" alt="Logo siPandu" fill className="object-cover" />
              </span>
              <span className="hidden sm:inline font-bold text-primary">siPandu</span>
            </Link>
            
            <div className="h-6 w-px bg-[var(--border)] hidden sm:block"></div>
            
            <div className="flex items-center gap-2">
              {access.memberships.length > 1 ? (
                <BusinessSwitcher
                  activeBusinessId={business?.id}
                  memberships={access.memberships}
                  compact
                />
              ) : (
                <span className="text-sm font-bold truncate max-w-[120px] sm:max-w-none">
                  {business?.name ?? "Belum ada bisnis"}
                </span>
              )}
              <Badge tone={demo || readOnly ? "amber" : "green"} className="hidden md:inline-flex">
                {readOnly ? "Tamu" : demo ? "Demo" : "Aktif"}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {business?.slug && (
              <Link
                className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-[var(--muted-foreground)] hover:text-primary transition"
                href={`/katalog/${business.slug}`}
                target="_blank"
              >
                Katalog <ExternalLink className="h-4 w-4" />
              </Link>
            )}
            <ThemeToggle showLabel={false} />
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center justify-center h-9 w-9 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-danger transition"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
        
        {/* Top Rail Nav (Desktop) */}
        <TopRailNav />
      </header>
      
      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 py-6 md:px-6 md:py-8">
        {readOnly && (
          <div className="mb-6 flex items-start gap-3 rounded-md border border-amber-300/70 bg-amber-100/70 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
            <Eye className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">Mode tamu hanya-baca</p>
              <p className="mt-1 leading-5">
                Kamu dapat menjelajahi seluruh dashboard, tetapi perubahan data dinonaktifkan.
              </p>
            </div>
          </div>
        )}
        {children}
      </main>

      {/* Bottom Tab Bar (Mobile) */}
      <BottomTabBar />
    </div>
  );
}
