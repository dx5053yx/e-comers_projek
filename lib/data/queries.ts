import { redirect } from "next/navigation";
import {
  demoBusiness,
  demoCustomers,
  demoOrders,
  demoProducts,
  demoReviews,
  salesSeries,
} from "@/lib/data/demo";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import type {
  Business,
  Customer,
  Order,
  OrderItem,
  Payment,
  Product,
  ProductVariant,
  Review,
  Shipment,
} from "@/lib/types";

function numberValue(value: unknown) {
  return Number(value ?? 0);
}

function normalizeProduct(product: Record<string, unknown>): Product {
  return {
    ...(product as unknown as Product),
    price: numberValue(product.price),
    category: (product.category ?? null) as Product["category"],
    variants: ((product.variants ?? []) as Record<string, unknown>[]).map((variant) => ({
      ...(variant as ProductVariant),
      price_adjustment: numberValue(variant.price_adjustment),
      stock: numberValue(variant.stock),
      low_stock_threshold: numberValue(variant.low_stock_threshold),
    })),
  };
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export function normalizeOrder(order: Record<string, unknown>): Order {
  const payment = firstRelation(order.payment as Payment | Payment[] | null);
  const shipment = firstRelation(order.shipment as Shipment | Shipment[] | null);

  return {
    ...(order as unknown as Order),
    subtotal: numberValue(order.subtotal),
    discount_total: numberValue(order.discount_total),
    shipping_cost: numberValue(order.shipping_cost),
    grand_total: numberValue(order.grand_total),
    customer: (order.customer ?? null) as Order["customer"],
    payment,
    shipment,
    items: ((order.items ?? []) as Record<string, unknown>[]).map((item) => ({
      ...(item as OrderItem),
      quantity: numberValue(item.quantity),
      price: numberValue(item.price),
      total: numberValue(item.total),
    })),
  };
}

export function isDemoMode() {
  return !isSupabaseServerConfigured();
}

export async function getCurrentBusiness() {
  if (isDemoMode()) {
    return demoBusiness;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("business_members")
    .select("business_id, business:businesses(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return firstRelation(data?.business as unknown as Business | Business[] | null);
}

export async function getProducts(businessId?: string) {
  if (isDemoMode()) {
    return demoProducts;
  }

  const business = businessId ? null : await getCurrentBusiness();
  const id = businessId ?? business?.id;

  if (!id) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), variants:product_variants(*)")
    .eq("business_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((product) => normalizeProduct(product));
}

export async function getProduct(id: string) {
  if (isDemoMode()) {
    return demoProducts.find((product) => product.id === id || product.slug === id) ?? null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), variants:product_variants(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizeProduct(data) : null;
}

export async function getCustomers(businessId?: string) {
  if (isDemoMode()) {
    return demoCustomers;
  }

  const business = businessId ? null : await getCurrentBusiness();
  const id = businessId ?? business?.id;

  if (!id) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Customer[];
}

export async function getOrders(businessId?: string) {
  if (isDemoMode()) {
    return demoOrders;
  }

  const business = businessId ? null : await getCurrentBusiness();
  const id = businessId ?? business?.id;

  if (!id) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, customer:customers(*), items:order_items(*), payment:payments(*), shipment:shipments(*)")
    .eq("business_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((order) => normalizeOrder(order));
}

export async function getOrder(idOrCode: string) {
  if (isDemoMode()) {
    return (
      demoOrders.find(
        (order) => order.id === idOrCode || order.order_code === idOrCode,
      ) ?? null
    );
  }

  const supabase = await createSupabaseServerClient();
  const query = supabase
    .from("orders")
    .select("*, customer:customers(*), items:order_items(*), payment:payments(*), shipment:shipments(*)");

  const { data, error } = idOrCode.startsWith("SP-")
    ? await query.eq("order_code", idOrCode).maybeSingle()
    : await query.eq("id", idOrCode).maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizeOrder(data) : null;
}

export async function getReviews(businessId?: string) {
  if (isDemoMode()) {
    return demoReviews;
  }

  const business = businessId ? null : await getCurrentBusiness();
  const id = businessId ?? business?.id;

  if (!id) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, customer:customers(*), order:orders(*)")
    .eq("business_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Review[];
}

export async function getDashboardSummary() {
  const [business, products, orders, customers, reviews] = await Promise.all([
    getCurrentBusiness(),
    getProducts(),
    getOrders(),
    getCustomers(),
    getReviews(),
  ]);

  const paidOrders = orders.filter((order) => order.payment_status === "PAID");
  const totalSales = paidOrders.reduce((sum, order) => sum + order.grand_total, 0);
  const pendingPayment = orders.filter((order) => order.payment_status === "PENDING").length;
  const processingOrders = orders.filter((order) =>
    ["PAID", "PROCESSING", "PACKING"].includes(order.status),
  ).length;
  const lowStockProducts = products.filter((product) =>
    product.variants?.some(
      (variant) => variant.stock <= variant.low_stock_threshold,
    ),
  ).length;
  const reviewAverage =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return {
    business,
    products,
    orders,
    customers,
    reviews,
    salesSeries,
    stats: {
      totalSales,
      totalOrders: orders.length,
      pendingPayment,
      processingOrders,
      lowStockProducts,
      reviewAverage,
    },
  };
}
