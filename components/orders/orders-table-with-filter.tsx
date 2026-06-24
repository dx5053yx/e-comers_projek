"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Order } from "@/lib/types";
import { getOrderStatusTone, orderStatusLabels, paymentStatusLabels } from "@/lib/orders/status";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";

type FilterType = "all" | "pending" | "completed";

interface OrdersTableWithFilterProps {
  orders: Order[];
}

export function OrdersTableWithFilter({ orders }: OrdersTableWithFilterProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const activeOrders = orders.filter((order) =>
    ["PENDING_PAYMENT", "PAID", "PROCESSING", "PACKING", "SHIPPED"].includes(order.status),
  );

  const completedOrders = orders.filter((order) => order.status === "COMPLETED");

  const filteredOrders =
    filter === "pending"
      ? activeOrders
      : filter === "completed"
        ? completedOrders
        : orders;

  const filters: Array<{ value: FilterType; label: string; count: number }> = [
    { value: "all", label: "Semua", count: orders.length },
    { value: "pending", label: "Belum Selesai", count: activeOrders.length },
    { value: "completed", label: "Selesai", count: completedOrders.length },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        {/* Filter Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-0">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex-1 border-b-2 px-4 py-3 text-center text-sm font-medium transition ${
                  filter === f.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{f.label}</span>
                <span className="ml-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="table-scroll border-0">
          <Table>
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Channel</Th>
                <Th>Status</Th>
                <Th>Payment</Th>
                <Th>Total</Th>
                <Th>Dibuat</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="transition hover:bg-muted/40">
                  <Td>
                    <Link
                      className="font-semibold text-foreground transition hover:text-primary"
                      href={`/dashboard/orders/${order.id}`}
                    >
                      {order.order_code}
                    </Link>
                  </Td>
                  <Td>
                    <div className="min-w-44">
                      <p className="font-medium">{order.customer?.name ?? "Customer"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {order.customer?.whatsapp_number ?? "-"}
                      </p>
                    </div>
                  </Td>
                  <Td>
                    <Badge tone={order.source === "WHATSAPP" ? "green" : "blue"}>
                      {order.source}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge tone={getOrderStatusTone(order.status)}>
                      {orderStatusLabels[order.status]}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge tone={order.payment_status === "PAID" ? "green" : "amber"}>
                      {paymentStatusLabels[order.payment_status]}
                    </Badge>
                  </Td>
                  <Td className="font-semibold">{formatCurrency(order.grand_total)}</Td>
                  <Td>{formatDate(order.created_at)}</Td>
                  <Td>
                    <Link
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium transition hover:border-primary/30 hover:bg-muted/70"
                      href={`/dashboard/orders/${order.id}`}
                    >
                      Kelola
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Td>
                </tr>
              ))}
              {filteredOrders.length === 0 ? (
                <tr>
                  <Td className="py-10 text-center text-muted-foreground" colSpan={8}>
                    {filter === "pending" && "Tidak ada pesanan yang belum selesai."}
                    {filter === "completed" && "Tidak ada pesanan yang selesai."}
                    {filter === "all" && "Belum ada order masuk."}
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
