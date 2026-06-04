import { BarChart3 } from "lucide-react";
import { SalesChart } from "@/components/charts/sales-chart";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getDashboardSummary } from "@/lib/data/queries";
import { formatCurrency } from "@/lib/utils";

export default async function AnalyticsPage() {
  const { orders, salesSeries, stats } = await getDashboardSummary();
  const topProducts = new Map<string, { quantity: number; sales: number }>();

  for (const order of orders) {
    for (const item of order.items ?? []) {
      const current = topProducts.get(item.product_name) ?? { quantity: 0, sales: 0 };
      current.quantity += item.quantity;
      current.sales += item.total;
      topProducts.set(item.product_name, current);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Sales analytics" description="Ringkasan penjualan, order, produk terlaris, dan chart harian." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={BarChart3} label="Total sales" value={formatCurrency(stats.totalSales)} />
        <StatCard icon={BarChart3} label="Total order" value={String(stats.totalOrders)} />
        <StatCard icon={BarChart3} label="Review average" value={stats.reviewAverage.toFixed(1)} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sales chart</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={salesSeries} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Produk terlaris</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-scroll">
            <Table>
              <thead>
                <tr>
                  <Th>Produk</Th>
                  <Th>Qty</Th>
                  <Th>Sales</Th>
                </tr>
              </thead>
              <tbody>
                {Array.from(topProducts.entries()).map(([name, value]) => (
                  <tr key={name}>
                    <Td className="font-medium">{name}</Td>
                    <Td>{value.quantity}</Td>
                    <Td>{formatCurrency(value.sales)}</Td>
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
