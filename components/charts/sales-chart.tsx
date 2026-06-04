"use client";

import dynamic from "next/dynamic";

const SalesChartInner = dynamic(
  () => import("@/components/charts/sales-chart-inner").then((mod) => mod.SalesChartInner),
  {
    ssr: false,
    loading: () => <div className="h-72 w-full rounded-md bg-muted/40" />,
  },
);

export function SalesChart({
  data,
}: {
  data: { date: string; sales: number; orders: number }[];
}) {
  return <SalesChartInner data={data} />;
}
