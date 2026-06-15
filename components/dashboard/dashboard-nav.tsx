"use client";

import {
  Boxes,
  ChartNoAxesCombined,
  CreditCard,
  ExternalLink,
  Home,
  LogOut,
  Menu,
  MessageSquareText,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Star,
  Truck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/dashboard/actions";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import type { BusinessMembership } from "@/lib/data/queries";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Utama",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/analytics", label: "Analitik", icon: ChartNoAxesCombined },
    ],
  },
  {
    label: "Operasional",
    items: [
      { href: "/dashboard/products", label: "Produk", icon: Package },
      { href: "/dashboard/inventory", label: "Stok", icon: Boxes },
      { href: "/dashboard/orders", label: "Pesanan", icon: ShoppingBag },
      { href: "/dashboard/payments", label: "Pembayaran", icon: CreditCard },
      { href: "/dashboard/shipments", label: "Pengiriman", icon: Truck },
    ],
  },
  {
    label: "Relasi",
    items: [
      { href: "/dashboard/customers", label: "Pelanggan", icon: Users },
      { href: "/dashboard/whatsapp", label: "WhatsApp", icon: MessageSquareText },
      { href: "/dashboard/reviews", label: "Ulasan", icon: Star },
      { href: "/dashboard/vouchers", label: "Promo", icon: Percent },
    ],
  },
  {
    label: "Sistem",
    items: [{ href: "/dashboard/settings", label: "Pengaturan", icon: Settings }],
  },
];

export function DashboardNav({
  variant = "sidebar",
  catalogHref,
  readOnly = false,
  activeBusinessId,
  memberships = [],
}: {
  variant?: "sidebar" | "mobile";
  catalogHref?: string;
  readOnly?: boolean;
  activeBusinessId?: string;
  memberships?: BusinessMembership[];
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  if (variant === "mobile") {
    return (
      <div className="lg:hidden">
        <button
          type="button"
          aria-controls="dashboard-mobile-menu"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Tutup menu dashboard" : "Buka menu dashboard"}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-md border shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            mobileMenuOpen
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/70",
          )}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Menu className="h-5 w-5" aria-hidden />
          )}
        </button>

        {mobileMenuOpen ? (
          <>
            <button
              type="button"
              aria-label="Tutup menu dashboard"
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <nav
              id="dashboard-mobile-menu"
              aria-label="Navigasi dashboard"
              className="fixed inset-x-3 top-[4.5rem] z-50 max-h-[calc(100dvh-5.25rem)] overflow-y-auto rounded-md border border-border bg-card p-4 shadow-2xl lg:hidden sm:left-auto sm:w-[360px]"
            >
              <div className="mb-4 flex items-center justify-between gap-4 border-b border-border pb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Menu dashboard</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Kelola seluruh aktivitas toko</p>
                </div>
                <button
                  type="button"
                  aria-label="Tutup menu"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <div className="mb-5">
                <BusinessSwitcher
                  activeBusinessId={activeBusinessId}
                  memberships={memberships}
                  compact
                />
              </div>

              <div className="space-y-5">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.items.map((item) => {
                        const active = isActive(pathname, item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition",
                              active
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/70 hover:text-foreground",
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                            <span className="min-w-0 truncate">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {catalogHref ? (
                <div className="mt-5 border-t border-border pt-4">
                  <Link
                    href={catalogHref}
                    target="_blank"
                    className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-muted/70"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Lihat katalog publik
                    <ExternalLink className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  </Link>
                </div>
              ) : null}

              <div className="mt-4 grid gap-2 border-t border-border pt-4">
                {readOnly ? (
                  <div className="rounded-md border border-amber-300/60 bg-amber-100/70 px-3 py-2 text-xs leading-5 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
                    Mode tamu aktif. Seluruh data hanya dapat dilihat.
                  </div>
                ) : null}
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
              </div>
            </nav>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      <div className="space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {group.label}
            </p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary",
                      )}
                      aria-hidden
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
