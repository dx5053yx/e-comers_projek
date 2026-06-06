import type { Voucher } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export type PromoOrderItem = {
  quantity: number;
  price: number;
};

export type PromoEvaluation = {
  voucher: Voucher | null;
  discountTotal: number;
  label: string | null;
};

function numberValue(value: unknown) {
  return Number(value ?? 0);
}

export function normalizeVoucherRecord(record: Record<string, unknown>): Voucher {
  return {
    ...(record as unknown as Voucher),
    promo_kind: (record.promo_kind ?? "DISCOUNT") as Voucher["promo_kind"],
    type: (record.type ?? "FIXED") as Voucher["type"],
    value: numberValue(record.value),
    min_purchase: numberValue(record.min_purchase),
    min_quantity: numberValue(record.min_quantity),
    buy_quantity: numberValue(record.buy_quantity),
    free_quantity: numberValue(record.free_quantity),
    used_count: numberValue(record.used_count),
    max_uses:
      record.max_uses === null || record.max_uses === undefined
        ? null
        : numberValue(record.max_uses),
  };
}

function totalQuantity(items: PromoOrderItem[]) {
  return items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
}

function subtotal(items: PromoOrderItem[]) {
  return items.reduce(
    (sum, item) => sum + Number(item.quantity ?? 0) * Number(item.price ?? 0),
    0,
  );
}

export function isVoucherCurrentlyActive(voucher: Voucher, now = new Date()) {
  if (!voucher.is_active) {
    return false;
  }

  if (voucher.max_uses !== null && voucher.max_uses !== undefined) {
    if (Number(voucher.used_count ?? 0) >= Number(voucher.max_uses)) {
      return false;
    }
  }

  if (voucher.starts_at && new Date(voucher.starts_at) > now) {
    return false;
  }

  if (voucher.ends_at && new Date(voucher.ends_at) < now) {
    return false;
  }

  return true;
}

export function describeVoucher(voucher: Voucher) {
  const title = voucher.title?.trim() || voucher.code;
  const rules: string[] = [];

  if (voucher.promo_kind === "BUY_X_GET_Y") {
    const buyQty = Number(voucher.buy_quantity ?? 0);
    const freeQty = Number(voucher.free_quantity ?? 0);
    rules.push(`beli ${buyQty} gratis ${freeQty}`);
  } else if (voucher.type === "PERCENTAGE") {
    rules.push(`diskon ${Number(voucher.value)}%`);
  } else {
    rules.push(`potongan ${formatCurrency(voucher.value)}`);
  }

  if (Number(voucher.min_purchase ?? 0) > 0) {
    rules.push(`min. belanja ${formatCurrency(voucher.min_purchase)}`);
  }

  if (Number(voucher.min_quantity ?? 0) > 0) {
    rules.push(`min. ${Number(voucher.min_quantity)} item`);
  }

  return `${title} (${voucher.code}) - ${rules.join(", ")}`;
}

function evaluateVoucher(voucher: Voucher, items: PromoOrderItem[]) {
  if (!isVoucherCurrentlyActive(voucher)) {
    return 0;
  }

  const orderSubtotal = subtotal(items);
  const orderQuantity = totalQuantity(items);

  if (orderSubtotal < Number(voucher.min_purchase ?? 0)) {
    return 0;
  }

  if (orderQuantity < Number(voucher.min_quantity ?? 0)) {
    return 0;
  }

  if (voucher.promo_kind === "BUY_X_GET_Y") {
    const buyQty = Number(voucher.buy_quantity ?? 0);
    const freeQty = Number(voucher.free_quantity ?? 0);
    const cycleSize = buyQty + freeQty;

    if (buyQty < 1 || freeQty < 1 || cycleSize < 2 || orderQuantity < cycleSize) {
      return 0;
    }

    const freeItemCount = Math.floor(orderQuantity / cycleSize) * freeQty;
    const unitPrices = items
      .flatMap((item) => Array.from({ length: Number(item.quantity) }, () => Number(item.price)))
      .sort((left, right) => left - right);

    return unitPrices
      .slice(0, freeItemCount)
      .reduce((sum, price) => sum + price, 0);
  }

  if (voucher.type === "PERCENTAGE") {
    return Math.floor(orderSubtotal * (Number(voucher.value ?? 0) / 100));
  }

  return Number(voucher.value ?? 0);
}

export function evaluateBestPromo(
  vouchers: Voucher[],
  items: PromoOrderItem[],
): PromoEvaluation {
  const orderSubtotal = subtotal(items);
  let best: PromoEvaluation = {
    voucher: null,
    discountTotal: 0,
    label: null,
  };

  for (const voucher of vouchers) {
    const discountTotal = Math.min(orderSubtotal, Math.max(0, evaluateVoucher(voucher, items)));

    if (discountTotal > best.discountTotal) {
      best = {
        voucher,
        discountTotal,
        label: describeVoucher(voucher),
      };
    }
  }

  return best;
}

export function activePromoSummary(vouchers: Voucher[], limit = 3) {
  return vouchers
    .filter((voucher) => isVoucherCurrentlyActive(voucher))
    .slice(0, limit)
    .map((voucher) => describeVoucher(voucher));
}
