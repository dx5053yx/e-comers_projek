import { ClipboardList, CreditCard, PackageCheck, Timer } from "lucide-react";
import type { ComponentType } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { OrdersTableWithFilter } from "@/components/orders/orders-table-with-filter";
import { getCurrentBusiness, getOrders } from "@/lib/data/queries";
import { formatCurrency } from "@/lib/utils";

function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </CardContent>
    </Card>
  );
}

export default async function OrdersPage() {
  const business = await getCurrentBusiness();
  const orders = await getOrders(business?.id);
  const activeOrders = orders.filter((order) =>
    ["PENDING_PAYMENT", "PAID", "PROCESSING", "PACKING", "SHIPPED"].includes(order.status),
  );
  const pendingPayments = orders.filter((order) => order.payment_status === "PENDING");
  const completedOrders = orders.filter((order) => order.status === "COMPLETED");
  const todayTotal = orders
    .filter((order) => new Date(order.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, order) => sum + Number(order.grand_total ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order management"
        description="Kelola pesanan WhatsApp, katalog, pembayaran, dan pengiriman dari satu daftar kerja."
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          helper="Perlu diproses atau dicek"
          icon={ClipboardList}
          label="Order aktif"
          value={String(activeOrders.length)}
        />
        <SummaryCard
          helper="Menunggu bukti/verifikasi"
          icon={CreditCard}
          label="Belum bayar"
          value={String(pendingPayments.length)}
        />
        <SummaryCard
          helper="Order sudah beres"
          icon={PackageCheck}
          label="Selesai"
          value={String(completedOrders.length)}
        />
        <SummaryCard
          helper="Dari order yang dibuat hari ini"
          icon={Timer}
          label="Omzet hari ini"
          value={formatCurrency(todayTotal)}
        />
      </section>

      <OrdersTableWithFilter orders={orders} />
    </div>
  );
}
