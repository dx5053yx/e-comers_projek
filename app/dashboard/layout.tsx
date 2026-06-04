import {
  Boxes,
  ChartNoAxesCombined,
  CreditCard,
  Home,
  MessageSquareText,
  Package,
  PackageCheck,
  Percent,
  Settings,
  ShoppingBag,
  Star,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentBusiness, isDemoMode } from "@/lib/data/queries";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/products", label: "Produk", icon: Package },
  { href: "/dashboard/inventory", label: "Inventory", icon: Boxes },
  { href: "/dashboard/orders", label: "Order", icon: ShoppingBag },
  { href: "/dashboard/customers", label: "Customer", icon: Users },
  { href: "/dashboard/whatsapp", label: "WhatsApp", icon: MessageSquareText },
  { href: "/dashboard/payments", label: "Payment", icon: CreditCard },
  { href: "/dashboard/shipments", label: "Shipping", icon: Truck },
  { href: "/dashboard/reviews", label: "Review", icon: Star },
  { href: "/dashboard/vouchers", label: "Voucher", icon: Percent },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const business = await getCurrentBusiness();
  const demo = isDemoMode();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-5">
            <Link className="text-xl font-semibold text-primary" href="/">
              siPandu
            </Link>
            <p className="mt-2 text-sm font-medium">{business?.name ?? "Belum ada bisnis"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {demo ? "Mode demo" : business?.category ?? "UMKM"}
            </p>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-primary" aria-hidden />
              MVP siap deploy bertahap
            </div>
          </div>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="lg:hidden">
              <Link className="text-lg font-semibold text-primary" href="/">
                siPandu
              </Link>
            </div>
            <div className="hidden text-sm text-muted-foreground sm:block">
              {business?.whatsapp_number ?? "WhatsApp belum diatur"}
            </div>
            <Link
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium"
              href="/dashboard/whatsapp"
            >
              <MessageSquareText className="h-4 w-4 text-primary" aria-hidden />
              WhatsApp
            </Link>
          </div>
        </header>
        <div className="px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
