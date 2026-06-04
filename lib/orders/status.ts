import type { OrderStatus, PaymentStatus, ShipmentStatus } from "@/lib/types";

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Menunggu bayar",
  PAID: "Terbayar",
  PROCESSING: "Diproses",
  PACKING: "Packing",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Refund",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Menunggu",
  PAID: "Terbayar",
  REJECTED: "Ditolak",
  REFUNDED: "Refund",
};

export const shipmentStatusLabels: Record<ShipmentStatus, string> = {
  NOT_SHIPPED: "Belum dikirim",
  READY_TO_SHIP: "Siap kirim",
  SHIPPED: "Dikirim",
  DELIVERED: "Diterima",
  RETURNED: "Retur",
};

export const orderFlow: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "PACKING",
  "SHIPPED",
  "COMPLETED",
];

export function getOrderStatusTone(status: OrderStatus) {
  if (["COMPLETED", "PAID"].includes(status)) {
    return "green" as const;
  }

  if (["PENDING_PAYMENT", "PROCESSING", "PACKING"].includes(status)) {
    return "amber" as const;
  }

  if (["CANCELLED", "REFUNDED"].includes(status)) {
    return "red" as const;
  }

  return "blue" as const;
}
