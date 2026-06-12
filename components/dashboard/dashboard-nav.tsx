"use client";

import {
  Boxes,
  ChartNoAxesCombined,
  CreditCard,
  Home,
  MessageSquareText,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Star,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function DashboardNav({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
        {navGroups.flatMap((group) => group.items).map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-10 shrink-0 snap-start items-center gap-2 rounded-md border px-3 text-sm font-medium transition",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
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
