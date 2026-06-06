import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { getOrders, isDemoMode } from "@/lib/data/queries";
import { calculateOrderTotal } from "@/lib/orders/calculate-total";
import { generateAvailableOrderCode } from "@/lib/orders/generate-code";
import { evaluateBestPromo, normalizeVoucherRecord } from "@/lib/promos";
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

    const { data: vouchers, error: voucherError } = await supabase
      .from("vouchers")
      .select("*")
      .eq("business_id", input.business_id)
      .eq("is_active", true);

    if (voucherError) {
      throw voucherError;
    }

    const promo = evaluateBestPromo(
      (vouchers ?? []).map((voucher) => normalizeVoucherRecord(voucher)),
      input.items,
    );
    const totals = calculateOrderTotal({
      items: input.items,
      discountTotal: promo.discountTotal,
      shippingCost: input.shipping_cost,
    });
    const orderCode = await generateAvailableOrderCode(supabase);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        business_id: input.business_id,
        customer_id: customerId,
        order_code: orderCode,
        source: input.source,
        status: "PENDING_PAYMENT",
        subtotal: totals.subtotal,
        discount_total: totals.discountTotal,
        shipping_cost: totals.shippingCost,
        grand_total: totals.grandTotal,
        payment_status: "PENDING",
        notes: [input.notes, promo.label ? `Promo otomatis: ${promo.label}` : null]
          .filter(Boolean)
          .join("\n") || null,
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

    if (promo.voucher && promo.discountTotal > 0) {
      await supabase
        .from("vouchers")
        .update({ used_count: Number(promo.voucher.used_count ?? 0) + 1 })
        .eq("id", promo.voucher.id);
    }

    return jsonOk({ order: { ...order, promo } }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
