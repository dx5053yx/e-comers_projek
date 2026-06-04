import { Boxes, ClipboardList, CreditCard, ShoppingBag, Star, Wallet } from "lucide-react";
import Link from "next/link";
import { SalesChart } from "@/components/charts/sales-chart";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getCustomerDisplayName } from "@/lib/customers";
import { getDashboardSummary } from "@/lib/data/queries";
import { orderStatusLabels, paymentStatusLabels, getOrderStatusTone } from "@/lib/orders/status";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const { business, orders, products, salesSeries, stats } = await getDashboardSummary();
  const recentOrders = orders.slice(0, 5);
  const lowStocks = products.filter((product) =>
    product.variants?.some((variant) => variant.stock <= variant.low_stock_threshold),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard UMKM"
        description={`Ringkasan operasional ${business?.name ?? "bisnis"} hari ini.`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={Wallet}
          label="Total penjualan"
          value={formatCurrency(stats.totalSales)}
          helper="Dari order dengan payment PAID"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total pesanan"
          value={String(stats.totalOrders)}
          helper="Web, WhatsApp, dan admin"
        />
        <StatCard
          icon={CreditCard}
          label="Menunggu bayar"
          value={String(stats.pendingPayment)}
          helper="Butuh verifikasi admin"
        />
        <StatCard
          icon={ClipboardList}
          label="Diproses"
          value={String(stats.processingOrders)}
          helper="PAID sampai PACKING"
        />
        <StatCard
          icon={Boxes}
          label="Stok menipis"
          value={String(stats.lowStockProducts)}
          helper="Varian menyentuh threshold"
        />
        <StatCard
          icon={Star}
          label="Rata-rata ulasan"
          value={stats.reviewAverage.toFixed(1)}
          helper="Rating customer"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Penjualan 7 hari terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peringatan stok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStocks.length ? (
              lowStocks.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sku ?? "Tanpa SKU"}</p>
                  </div>
                  <Badge tone="amber">
                    {product.variants?.reduce((sum, variant) => sum + variant.stock, 0) ?? 0} stok
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada stok menipis.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-scroll">
            <Table>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                  <Th>Total</Th>
                  <Th>Tanggal</Th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <Td>
                      <Link className="font-medium text-primary" href={`/dashboard/orders/${order.id}`}>
                        {order.order_code}
                      </Link>
                    </Td>
                    <Td>{order.customer ? getCustomerDisplayName(order.customer) : "Customer"}</Td>
                    <Td>
                      <Badge tone={getOrderStatusTone(order.status)}>
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </Td>
                    <Td>{paymentStatusLabels[order.payment_status]}</Td>
                    <Td>{formatCurrency(order.grand_total)}</Td>
                    <Td>{formatDate(order.created_at)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
