import { detectIntent } from "@/lib/ai/intent";
import { generateWhatsAppReply } from "@/lib/ai/gemini";
import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { demoBusiness, demoOrders, demoProducts } from "@/lib/data/demo";
import { calculateOrderTotal } from "@/lib/orders/calculate-total";
import { generateOrderCode } from "@/lib/orders/generate-code";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { Order, Product, ProductVariant } from "@/lib/types";
import { openClawWebhookSchema } from "@/lib/validations/schemas";
import {
  buildAvailabilityReply,
  buildFallbackReply,
  buildDeliveryReply,
  buildOrderStatusReply,
  buildPaymentReply,
  buildPaymentMethodReply,
  buildProductListReply,
  buildTalkToAdminReply,
} from "@/lib/whatsapp/reply-builder";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function matchProduct(products: Product[], productName: string) {
  const wanted = normalize(productName);
  return products.find((product) => {
    const name = normalize(product.name);
    return name.includes(wanted) || wanted.includes(name);
  });
}

function extractProductQuery(message: string) {
  const normalized = message
    .toLowerCase()
    .replace(/\b(ada\s*(g|ga|gak|nggak|ngga)|ready\s*(g|ga|gak|nggak|ngga))\b/g, "")
    .replace(/\b(nyari|cari|nyariin|carikan|bang|kak|gan|sis)\b/g, "")
    .replace(/[?!.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized || normalized.length > 40) {
    return null;
  }

  return normalized;
}

async function getProductsForBusiness(
  businessId: string,
  fallbackProducts: Product[],
) {
  if (!isSupabaseAdminConfigured()) {
    return fallbackProducts;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .eq("business_id", businessId)
    .eq("is_active", true);

  if (error) {
    throw error;
  }

  return (data ?? []).map((product) => ({
    ...(product as Product),
    price: Number(product.price ?? 0),
    variants: (product.variants ?? []).map((variant: Record<string, unknown>) => ({
      ...variant,
      price_adjustment: Number(variant.price_adjustment ?? 0),
      stock: Number(variant.stock ?? 0),
      low_stock_threshold: Number(variant.low_stock_threshold ?? 0),
    })),
  })) as Product[];
}

async function getConversationHistory(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  conversationId?: string | null,
) {
  if (!conversationId) {
    return [];
  }

  const { data } = await supabase
    .from("messages")
    .select("sender_type,message,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(12);

  return (data ?? [])
    .reverse()
    .map((item: { sender_type: "CUSTOMER" | "BOT" | "ADMIN" | "SYSTEM"; message: string }) => ({
      sender: item.sender_type,
      message: item.message,
    }));
}

function importantFactsStillPresent(draftReply: string, generatedReply: string) {
  const urls = draftReply.match(/https?:\/\/\S+/g) ?? [];
  const orderCodes = draftReply.match(/SP-\d{8}-\d{3}/gi) ?? [];

  return [...urls, ...orderCodes].every((fact) => generatedReply.includes(fact));
}

function sanitizeAiReply(reply: string) {
  return reply
    .replace(/\*\*/g, "")
    .replace(/```/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function looksComplete(reply: string) {
  if (reply.length < 20) {
    return false;
  }

  return !/(\*|-|:|\d+\.)$/.test(reply.trim());
}

function productNamesStillPresent(
  draftReply: string,
  generatedReply: string,
  products: Product[],
) {
  const normalizedGenerated = normalize(generatedReply);
  const namesInDraft = products
    .filter((product) => product.is_active && draftReply.includes(product.name))
    .map((product) => product.name);

  if (!namesInDraft.length) {
    return true;
  }

  return namesInDraft.every((name) => normalizedGenerated.includes(normalize(name)));
}

function hasHardFacts(draftReply: string, products: Product[]) {
  const hasUrl = /https?:\/\/\S+/.test(draftReply);
  const hasOrderCode = /SP-\d{8}-\d{3}/i.test(draftReply);
  const hasProductName = products.some((product) => product.is_active && draftReply.includes(product.name));

  return hasUrl || hasOrderCode || hasProductName;
}

function shouldKeepLocalTone(message: string) {
  const normalized = normalize(message);

  return (
    /^(p|ping|test)$/.test(normalized) ||
    /\b(kontol|memek|anjing|bangsat|tolol|goblok|babi)\b/.test(normalized)
  );
}

async function buildAiNaturalReply({
  customerMessage,
  intent,
  business,
  products,
  draftReply,
  conversationHistory = [],
}: {
  customerMessage: string;
  intent: string;
  business: Parameters<typeof generateWhatsAppReply>[0]["business"];
  products: Product[];
  draftReply: string;
  conversationHistory?: Parameters<typeof generateWhatsAppReply>[0]["conversationHistory"];
}) {
  if (shouldKeepLocalTone(customerMessage)) {
    return draftReply;
  }

  try {
    const hardFacts = hasHardFacts(draftReply, products);
    const aiDraftReply = hardFacts
      ? draftReply
      : `Fallback aman kalau AI bingung: ${draftReply}\nJangan salin fallback ini mentah-mentah. Tulis balasan baru yang lebih natural sesuai riwayat chat.`;
    const generated = await generateWhatsAppReply({
      customerMessage,
      intent,
      business,
      products,
      draftReply: aiDraftReply,
      conversationHistory,
      replyMode: hardFacts ? "safe_action" : "human_chat",
    });

    const sanitized = generated ? sanitizeAiReply(generated) : null;

    if (
      !sanitized ||
      !looksComplete(sanitized) ||
      !importantFactsStillPresent(draftReply, sanitized) ||
      !productNamesStillPresent(draftReply, sanitized, products) ||
      sanitized.toLowerCase().includes("fallback aman") ||
      sanitized.toLowerCase().includes("jangan salin")
    ) {
      return draftReply;
    }

    return sanitized;
  } catch {
    return draftReply;
  }
}

export async function GET() {
  return jsonOk({
    endpoint: "/api/webhooks/openclaw",
    method: "POST",
    secretHeader: "x-openclaw-secret",
    status: "ready",
  });
}

export async function POST(request: Request) {
  try {
    const expectedSecret = process.env.OPENCLAW_WEBHOOK_SECRET;

    if (!expectedSecret) {
      return jsonError("OPENCLAW_WEBHOOK_SECRET belum dikonfigurasi.", 503);
    }

    if (request.headers.get("x-openclaw-secret") !== expectedSecret) {
      return jsonError("Invalid OpenClaw secret.", 401);
    }

    const payload = await parseJson(request, openClawWebhookSchema);
    const intent = await detectIntent(payload.message);

    if (!isSupabaseAdminConfigured()) {
      const order = demoOrders.find((item) => item.order_code === intent.order_code);
      const draftReply =
        intent.intent === "ASK_PRODUCT"
          ? buildProductListReply(demoBusiness.name, demoProducts)
          : intent.intent === "CHECK_ORDER_STATUS" && order
            ? buildOrderStatusReply(order)
            : buildFallbackReply(demoBusiness.name, payload.message);
      const reply = await buildAiNaturalReply({
        customerMessage: payload.message,
        intent: intent.intent,
        business: demoBusiness,
        products: demoProducts,
        draftReply,
        conversationHistory: [],
      });

      return jsonOk({ reply, intent, demo: true });
    }

    const supabase = createSupabaseAdminClient();
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("slug", payload.businessSlug)
      .single();

    if (businessError || !business) {
      return jsonError("Business tidak ditemukan.", 404);
    }

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", business.id)
      .eq("whatsapp_number", payload.from)
      .maybeSingle();

    const customer =
      existingCustomer ??
      (
        await supabase
          .from("customers")
          .insert({
            business_id: business.id,
            name: payload.from,
            phone: payload.from,
            whatsapp_number: payload.from,
            segment: "NEW",
          })
          .select("*")
          .single()
      ).data;

    const { data: conversation } = await supabase
      .from("conversations")
      .upsert(
        {
          business_id: business.id,
          customer_id: customer?.id,
          channel: "WHATSAPP",
          external_chat_id: payload.from,
          last_message_at: payload.timestamp ?? new Date().toISOString(),
        },
        { onConflict: "business_id,external_chat_id" },
      )
      .select("*")
      .single();

    if (conversation) {
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_type: "CUSTOMER",
        message: payload.message,
        raw_payload: payload.raw,
      });
    }

    const products = await getProductsForBusiness(business.id, demoProducts);
    const conversationHistory = await getConversationHistory(supabase, conversation?.id);
    let reply = buildFallbackReply(business.name, payload.message);
    let createdOrder: Order | null = null;

    if (intent.intent === "ASK_STOCK") {
      const productQuery = extractProductQuery(payload.message);
      reply = buildAvailabilityReply({
        product: productQuery ? matchProduct(products, productQuery) : null,
        query: productQuery,
        products,
      });
    }

    if (intent.intent === "ASK_PRODUCT" || intent.intent === "ASK_PRICE") {
      reply = buildProductListReply(business.name, products);
    }

    if (intent.intent === "ASK_PAYMENT_METHOD") {
      reply = buildPaymentMethodReply(
        business.name,
        business.payment_instructions,
        business.qris_image_url,
      );
    }

    if (intent.intent === "ASK_DELIVERY") {
      reply = buildDeliveryReply(business.name, business.address);
    }

    if (intent.intent === "TALK_TO_ADMIN") {
      reply = buildTalkToAdminReply();
    }

    if (intent.intent === "CHECK_ORDER_STATUS") {
      const orderCode = intent.order_code;

      if (!orderCode) {
        reply = "Kak, tulis kode order seperti SP-20260604-001 supaya saya bisa cek statusnya.";
      } else {
        const { data: order } = await supabase
          .from("orders")
          .select("*, customer:customers(*), items:order_items(*), payment:payments(*), shipment:shipments(*)")
          .eq("order_code", orderCode)
          .maybeSingle();

        reply = order
          ? buildOrderStatusReply(order as Order)
          : `Pesanan ${orderCode} belum ditemukan. Pastikan kodenya benar ya kak.`;
      }
    }

    if (intent.intent === "CREATE_ORDER") {
      const matchedItems = intent.items
        .map((item) => {
          const product = matchProduct(products, item.product_name);
          const variant = product?.variants?.find((candidate) => candidate.is_active) ?? null;

          if (!product) {
            return null;
          }

          return {
            product,
            variant,
            quantity: item.quantity,
            total: product.price * item.quantity,
          };
        })
        .filter(Boolean) as Array<{
        product: Product;
        variant: ProductVariant | null;
        quantity: number;
        total: number;
      }>;

      if (!matchedItems.length) {
        reply = "Bisa, kak. Mau pesan produk yang mana dan berapa banyak? Kalau belum tahu pilihannya, aku bisa kirim menu yang tersedia.";
      } else {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const { count } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("business_id", business.id)
          .gte("created_at", start);
        const totals = calculateOrderTotal({
          items: matchedItems.map((item) => ({
            quantity: item.quantity,
            price: item.product.price,
          })),
        });
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            business_id: business.id,
            customer_id: customer?.id,
            order_code: generateOrderCode((count ?? 0) + 1, today),
            source: "WHATSAPP",
            status: "PENDING_PAYMENT",
            subtotal: totals.subtotal,
            discount_total: 0,
            shipping_cost: 0,
            grand_total: totals.grandTotal,
            payment_status: "PENDING",
            notes: `Created from WhatsApp ${payload.from}`,
          })
          .select("*")
          .single();

        if (orderError) {
          throw orderError;
        }

        const { data: orderItems, error: itemError } = await supabase
          .from("order_items")
          .insert(
            matchedItems.map((item) => ({
              order_id: order.id,
              product_id: item.product.id,
              product_variant_id: item.variant?.id ?? null,
              product_name: item.product.name,
              variant_name: item.variant?.name ?? null,
              quantity: item.quantity,
              price: item.product.price,
              total: item.total,
            })),
          )
          .select("*");

        if (itemError) {
          throw itemError;
        }

        await supabase.from("payments").insert({
          order_id: order.id,
          amount: totals.grandTotal,
          status: "PENDING",
        });

        createdOrder = {
          ...(order as Order),
          items: orderItems as Order["items"],
          grand_total: totals.grandTotal,
        };
        reply = buildPaymentReply(
          createdOrder,
          business.payment_instructions,
          business.qris_image_url,
        );
      }
    }

    reply = await buildAiNaturalReply({
      customerMessage: payload.message,
      intent: intent.intent,
      business,
      products,
      draftReply: reply,
      conversationHistory,
    });

    if (conversation) {
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_type: "BOT",
        message: reply,
      });

      await supabase.from("ai_action_logs").insert({
        business_id: business.id,
        conversation_id: conversation.id,
        intent: intent.intent,
        input_text: payload.message,
        output_json: { intent, created_order_id: createdOrder?.id ?? null },
        confidence: intent.confidence,
        status: intent.confidence >= 0.5 ? "SUCCESS" : "NEEDS_REVIEW",
      });
    }

    return jsonOk({
      reply,
      intent,
      media: createdOrder && business.qris_image_url
        ? [
            {
              type: "image",
              url: business.qris_image_url,
              caption: `QRIS pembayaran untuk ${createdOrder.order_code}`,
            },
          ]
        : [],
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
