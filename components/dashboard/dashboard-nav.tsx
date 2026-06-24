"use client";

import {
  Boxes,
  Home,
  MessageSquareText,
  Package,
  ShoppingBag,
  CreditCard,
  Menu,
  X,
  ChartNoAxesCombined,
  Truck,
  Users,
  Star,
  Percent,
  Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const topRailItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/analytics", label: "Analitik" },
  { href: "/dashboard/products", label: "Produk" },
  { href: "/dashboard/inventory", label: "Stok" },
  { href: "/dashboard/orders", label: "Pesanan" },
  { href: "/dashboard/payments", label: "Pembayaran" },
  { href: "/dashboard/shipments", label: "Pengiriman" },
  { href: "/dashboard/customers", label: "Pelanggan" },
  { href: "/dashboard/whatsapp", label: "WhatsApp" },
  { href: "/dashboard/reviews", label: "Ulasan" },
  { href: "/dashboard/vouchers", label: "Promo" },
  { href: "/dashboard/settings", label: "Pengaturan" },
];

const mobileTabs = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/dashboard/products", label: "Produk", icon: Package },
  { href: "/dashboard/orders", label: "Pesanan", icon: ShoppingBag },
  { href: "/dashboard/whatsapp", label: "WA", icon: MessageSquareText },
];

const mobileMenuGroups = [
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

export function TopRailNav() {
  const pathname = usePathname();
  
  return (
    <nav className="hidden lg:flex items-center gap-1 overflow-x-auto border-b border-[var(--border-subtle)] px-6 bg-[var(--card)] no-scrollbar">
      {topRailItems.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-4 py-3 text-sm font-bold border-b-[3px] transition-colors whitespace-nowrap",
              active 
                ? "border-primary text-primary" 
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border)]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomTabBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);
  
  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[var(--card)] border-t border-[var(--border)] flex items-center justify-around px-2 pb-1 pt-2 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {mobileTabs.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors",
                active ? "text-primary" : "text-[var(--muted-foreground)]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors text-[var(--muted-foreground)] hover:text-primary"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-bold mt-0.5">Lainnya</span>
        </button>
      </nav>

      {menuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden" 
            onClick={() => setMenuOpen(false)} 
          />
          
          {/* Floating Menu Card */}
          <div className="fixed inset-x-4 bottom-24 z-50 max-h-[75vh] flex flex-col bg-[var(--background)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] lg:hidden overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 bg-[var(--card)] shrink-0">
              <div>
                <p className="font-bold text-[var(--foreground)] text-sm">Menu dashboard</p>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Kelola seluruh aktivitas toko</p>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {mobileMenuGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {group.items.map((item) => {
                      const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-2 rounded-md border p-3 text-sm font-bold transition",
                            active
                              ? "border-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-primary shadow-sm"
                              : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-primary/40 hover:text-[var(--foreground)]"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
