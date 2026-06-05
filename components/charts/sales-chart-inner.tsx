"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

export function SalesChartInner({
  data,
}: {
  data: { date: string; sales: number; orders: number }[];
}) {
  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.32} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(value) => `${Number(value) / 1000}k`}
            tick={{ fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value, name) =>
              name === "sales" ? formatCurrency(Number(value)) : Number(value)
            }
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--foreground)",
            }}
            labelClassName="font-medium"
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#salesFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
