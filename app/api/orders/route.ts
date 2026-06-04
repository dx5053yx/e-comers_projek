import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { getOrders, isDemoMode } from "@/lib/data/queries";
import { calculateOrderTotal } from "@/lib/orders/calculate-total";
import { generateOrderCode } from "@/lib/orders/generate-code";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import { orderSchema } from "@/lib/validations/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orders = await getOrders(searchParams.get("businessId") ?? undefined);
  const status = searchParams.get("status");

  return jsonOk({
    orders: status ? orders.filter((order) => order.status === status) : orders,
    demo: isDemoMode(),
  });
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseServerConfigured() || !isSupabaseAdminConfigured()) {
      return jsonError("Supabase belum dikonfigurasi.", 503);
    }

    const input = await parseJson(request, orderSchema);
    const supabase = createSupabaseAdminClient();
    let customerId = input.customer_id ?? null;

    for (const item of input.items) {
      if (!item.product_variant_id) {
        continue;
      }

      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select("stock, is_active, product:products(name, is_active)")
        .eq("id", item.product_variant_id)
        .single();

      if (variantError) {
        throw variantError;
      }

      const product = Array.isArray(variant.product)
        ? variant.product[0]
        : variant.product;

      if (!variant.is_active || !product?.is_active) {
        return jsonError(`${item.product_name} sedang tidak aktif.`, 422);
      }

      if (Number(variant.stock ?? 0) < item.quantity) {
        return jsonError(
          `Stok ${item.product_name} hanya tersisa ${Number(variant.stock ?? 0)}.`,
          422,
        );
      }
    }

    if (!customerId && input.customer) {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({ ...input.customer, business_id: input.business_id })
        .select("id")
        .single();

      if (customerError) {
        throw customerError;
      }

      customerId = customer.id;
    }

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("business_id", input.business_id)
      .gte("created_at", start);

    const totals = calculateOrderTotal({
      items: input.items,
      discountTotal: input.discount_total,
      shippingCost: input.shipping_cost,
    });

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        business_id: input.business_id,
        customer_id: customerId,
        order_code: generateOrderCode((count ?? 0) + 1, today),
        source: input.source,
        status: "PENDING_PAYMENT",
        subtotal: totals.subtotal,
        discount_total: totals.discountTotal,
        shipping_cost: totals.shippingCost,
        grand_total: totals.grandTotal,
        payment_status: "PENDING",
        notes: input.notes,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    const { error: itemError } = await supabase.from("order_items").insert(
      input.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
        product_name: item.product_name,
        variant_name: item.variant_name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
    );

    if (itemError) {
      throw itemError;
    }

    await supabase.from("payments").insert({
      order_id: order.id,
      amount: totals.grandTotal,
      status: "PENDING",
    });

    return jsonOk({ order }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
