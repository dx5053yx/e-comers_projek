import { detectIntent } from "@/lib/ai/intent";
import { generateWhatsAppReply } from "@/lib/ai/gemini";
import { handleRouteError, jsonError, jsonOk, parseJson } from "@/lib/api";
import { demoBusiness, demoOrders, demoProducts } from "@/lib/data/demo";
import { calculateOrderTotal } from "@/lib/orders/calculate-total";
import { generateAvailableOrderCode } from "@/lib/orders/generate-code";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { Order, Product, ProductVariant } from "@/lib/types";
import { openClawWebhookSchema } from "@/lib/validations/schemas";
import {
  createFallbackCustomerName,
  isPhoneLike,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp";
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

type ConversationHistory = NonNullable<
  Parameters<typeof generateWhatsAppReply>[0]["conversationHistory"]
>;

type MatchedOrderItem = {
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
  total: number;
};

type AdminSupabaseClient = ReturnType<typeof createSupabaseAdminClient>;

type IncomingMedia = {
  type?: string;
  mimeType?: string;
  caption?: string;
  dataBase64?: string;
  tooLarge?: boolean;
  downloadError?: string;
};

type PaymentProofRetryReason = "TOO_LARGE" | "DOWNLOAD_FAILED";

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

function getRawString(
  raw: Record<string, unknown>,
  keys: string[],
) {
  for (const key of keys) {
    const value = raw[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getCustomerNameFromWebhook(raw: Record<string, unknown>, phone: string) {
  const name = getRawString(raw, [
    "pushName",
    "notifyName",
    "contactName",
    "senderName",
    "verifiedBizName",
  ]);

  if (!name || isPhoneLike(name) || name === phone) {
    return createFallbackCustomerName(phone);
  }

  return name.slice(0, 80);
}

function getIncomingMedia(raw: Record<string, unknown>) {
  const media = raw.media;

  if (!media || typeof media !== "object" || Array.isArray(media)) {
    return null;
  }

  return media as IncomingMedia;
}

function sanitizeRawPayload(raw: Record<string, unknown>) {
  const media = getIncomingMedia(raw);

  if (!media) {
    return raw;
  }

  const safeMedia = { ...media };
  delete safeMedia.dataBase64;

  return {
    ...raw,
    media: safeMedia,
  };
}

function extractOrderCode(message: string) {
  return message.match(/SP-\d{8}-\d{3}/i)?.[0]?.toUpperCase() ?? null;
}

function paymentProofExtension(mimeType?: string) {
  if (mimeType?.includes("png")) {
    return "png";
  }

  if (mimeType?.includes("webp")) {
    return "webp";
  }

  return "jpg";
}

async function uploadPaymentProofImage({
  supabase,
  businessId,
  orderId,
  media,
}: {
  supabase: AdminSupabaseClient;
  businessId: string;
  orderId: string;
  media: IncomingMedia;
}) {
  if (!media.dataBase64) {
    return null;
  }

  const imageBuffer = Buffer.from(media.dataBase64, "base64");

  if (!imageBuffer.byteLength) {
    return null;
  }

  const bucket = process.env.SUPABASE_PAYMENT_PROOFS_BUCKET ?? "payment-proofs";
  const extension = paymentProofExtension(media.mimeType);
  const randomId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
  const path = `${businessId}/${orderId}/${Date.now()}-${randomId}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, imageBuffer, {
    contentType: media.mimeType ?? "image/jpeg",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data, error: signedUrlError } = await supabase
    .storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24 * 30);

  if (signedUrlError) {
    throw signedUrlError;
  }

  return data.signedUrl;
}

async function recordPaymentProofFromMedia({
  supabase,
  businessId,
  customerId,
  message,
  raw,
}: {
  supabase: AdminSupabaseClient;
  businessId: string;
  customerId?: string | null;
  message: string;
  raw: Record<string, unknown>;
}) {
  const media = getIncomingMedia(raw);

  if (media?.type !== "image") {
    return null;
  }

  if (!media.dataBase64) {
    const reason: PaymentProofRetryReason = media.tooLarge
      ? "TOO_LARGE"
      : "DOWNLOAD_FAILED";

    return {
      status: "MEDIA_UNAVAILABLE" as const,
      reason,
    };
  }

  const orderCode = extractOrderCode(`${message} ${media.caption ?? ""}`);
  const query = supabase
    .from("orders")
    .select("id, order_code, grand_total, status, payment_status")
    .eq("business_id", businessId)
    .eq("payment_status", "PENDING")
    .order("created_at", { ascending: false })
    .limit(1);

  const { data: order, error } = orderCode
    ? await query.eq("order_code", orderCode).maybeSingle()
    : customerId
      ? await query.eq("customer_id", customerId).maybeSingle()
      : { data: null, error: null };

  if (error) {
    throw error;
  }

  if (!order) {
    return {
      status: "NO_PENDING_ORDER" as const,
    };
  }

  const { data: currentPayment, error: currentPaymentError } = await supabase
    .from("payments")
    .select("id, status")
    .eq("order_id", order.id)
    .maybeSingle();

  if (currentPaymentError) {
    throw currentPaymentError;
  }

  const proofUrl = await uploadPaymentProofImage({
    supabase,
    businessId,
    orderId: order.id,
    media,
  });

  const { error: paymentError } = await supabase
    .from("payments")
    .upsert(
      {
        order_id: order.id,
        amount: order.grand_total,
        status: "PAID",
        proof_url: proofUrl,
        verified_at: new Date().toISOString(),
        note: `Bukti pembayaran diterima otomatis via WhatsApp. Caption: ${message}`,
      },
      { onConflict: "order_id" },
    );

  if (paymentError) {
    throw paymentError;
  }

  await supabase
    .from("orders")
    .update({
      payment_status: "PAID",
      status: order.status === "COMPLETED" ? "COMPLETED" : "PROCESSING",
    })
    .eq("id", order.id);

  if (currentPayment?.status !== "PAID") {
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("product_variant_id, quantity")
      .eq("order_id", order.id);

    if (itemsError) {
      throw itemsError;
    }

    for (const item of items ?? []) {
      if (!item.product_variant_id) {
        continue;
      }

      const { data: variant } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", item.product_variant_id)
        .single();

      const nextStock = Math.max(0, Number(variant?.stock ?? 0) - Number(item.quantity));

      await supabase
        .from("product_variants")
        .update({ stock: nextStock })
        .eq("id", item.product_variant_id);

      await supabase.from("inventory_movements").insert({
        business_id: businessId,
        product_variant_id: item.product_variant_id,
        type: "OUT",
        quantity: Number(item.quantity),
        note: `Payment auto-verified from WhatsApp proof for ${order.order_code}`,
      });
    }
  }

  return {
    status: "RECORDED" as const,
    orderCode: order.order_code,
  };
}

function buildPaymentProofReceivedReply(orderCode: string) {
  return `Makasih kak, bukti pembayaran untuk ${orderCode} sudah aku terima. Pembayarannya aku catat masuk dan pesanan sekarang diproses ya. Kalau pesanannya sudah diterima nanti bilang "pesanan selesai", nanti aku bantu minta rating juga.`;
}

function buildPaymentProofRetryReply(reason: PaymentProofRetryReason) {
  return reason === "TOO_LARGE"
    ? "Aku sudah lihat kakaknya kirim bukti, tapi file gambarnya terlalu besar buat kusimpan otomatis. Coba kirim ulang screenshot yang lebih kecil atau lebih sederhana ya kak."
    : "Aku sudah lihat kakaknya kirim bukti, tapi gambarnya belum berhasil kusimpan. Coba kirim ulang screenshot bukti transfernya ya kak.";
}

function buildPaymentProofNoOrderReply() {
  return "Bukti transfernya sudah masuk sebagai gambar, kak. Tapi aku belum menemukan order yang masih menunggu pembayaran dari nomor ini. Boleh kirim kode ordernya juga? Contohnya SP-20260604-005.";
}

function isOrderCompletionRequest(message: string) {
  const normalized = normalize(message);
  const hasCompletionWord = /\b(selesai|beres|sampai|diterima|kelar|rampung)\b/.test(normalized);
  const hasOrderContext = /\b(pesanan(?:nya)?|order(?:an)?|makanan|produk|paket|barang|nya)\b/.test(normalized);

  return hasCompletionWord && hasOrderContext;
}

function buildReviewRequestReply(orderCode: string) {
  return [
    `Siap kak, pesanan ${orderCode} aku tandai selesai. Makasih sudah order.`,
    "Boleh bantu kasih rating makanan?",
    "Balas dengan angka 1 sampai 5 ya:",
    "1 = kurang puas, 2 = kurang, 3 = cukup, 4 = bagus, 5 = puas banget.",
    'Contoh balasan: "5, rasanya enak dan porsinya pas" atau "rating 4, pengirimannya agak lama".',
  ].join("\n");
}

function buildCompletionNeedsPaymentReply(orderCode: string) {
  return `Pesanan ${orderCode} belum bisa aku tandai selesai karena pembayaran belum tercatat masuk. Kirim bukti transfer dulu ya kak, nanti setelah masuk baru bisa dilanjutkan sampai selesai.`;
}

function buildCompletionNoOrderReply() {
  return "Aku belum menemukan pesanan aktif dari nomor ini, kak. Kalau mau cek pesanan tertentu, kirim kode ordernya ya.";
}

function isReviewPromptActive(history: ConversationHistory) {
  const lastBotMessage = getLastBotMessage(history);

  return lastBotMessage
    ? /\b(boleh kasih rating|kasih rating|rating makanannya|bantu kasih rating|angka 1 sampai 5|1 kurang puas|puas banget)\b/.test(normalize(lastBotMessage))
    : false;
}

function extractRatingValue(message: string) {
  const starCount = message.match(/[★⭐]/g)?.length ?? 0;

  if (starCount >= 1 && starCount <= 5) {
    return starCount;
  }

  const raw = message.toLowerCase();
  const normalized = normalize(message);
  const wordRatings: Record<string, number> = {
    satu: 1,
    dua: 2,
    tiga: 3,
    empat: 4,
    lima: 5,
  };
  const wordMatch = normalized.match(/\b(satu|dua|tiga|empat|lima)\b/);

  if (wordMatch) {
    return wordRatings[wordMatch[1]];
  }

  const patterns = [
    /\b(?:rating(?:nya)?|rate|nilai|bintang|star)\s*(?:ku|aku|saya|nya|makanan(?:nya)?)?\s*[:=\-]?\s*([1-5])\b/i,
    /\b([1-5])\s*(?:\/\s*5|dari\s*5|per\s*5|bintang|star|stars|rating|nilai)\b/i,
    /\b([1-5])\s*(?:aja|ya|kak|deh|dong|sih)?\b/i,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    const rating = Number(match?.[1] ?? 0);

    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      return rating;
    }
  }

  return null;
}

function extractReviewInput(message: string) {
  const rating = extractRatingValue(message);

  if (rating === null || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }

  const comment = message
    .replace(/[★⭐]/g, " ")
    .replace(/\b(?:rating(?:nya)?|rate|nilai|bintang|star)\s*(?:ku|aku|saya|nya|makanan(?:nya)?)?\s*[:=\-]?\s*[1-5]\b/gi, " ")
    .replace(/\b[1-5]\s*(?:\/\s*5|dari\s*5|per\s*5|bintang|star|stars|rating|nilai)?\b/gi, " ")
    .replace(/\b(rating|ratingnya|rate|bintang|star|stars|nilai|kasih|aku|saya|satu|dua|tiga|empat|lima|aja|ya|kak|deh|dong)\b/gi, " ")
    .replace(/[,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    rating,
    comment: comment || null,
  };
}

async function getLatestCustomerOrder({
  supabase,
  businessId,
  customerId,
}: {
  supabase: AdminSupabaseClient;
  businessId: string;
  customerId?: string | null;
}) {
  if (!customerId) {
    return null;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_code, business_id, customer_id, status, payment_status")
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function getLatestCompletedOrderWithoutReview({
  supabase,
  businessId,
  customerId,
}: {
  supabase: AdminSupabaseClient;
  businessId: string;
  customerId?: string | null;
}) {
  if (!customerId) {
    return null;
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_code, business_id, customer_id")
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .eq("status", "COMPLETED")
    .order("updated_at", { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  for (const order of orders ?? []) {
    const { data: existingReview, error: reviewError } = await supabase
      .from("reviews")
      .select("id")
      .eq("order_id", order.id)
      .limit(1)
      .maybeSingle();

    if (reviewError) {
      throw reviewError;
    }

    if (!existingReview) {
      return order;
    }
  }

  return null;
}

async function completeLatestPaidOrder({
  supabase,
  businessId,
  customerId,
}: {
  supabase: AdminSupabaseClient;
  businessId: string;
  customerId?: string | null;
}) {
  const order = await getLatestCustomerOrder({ supabase, businessId, customerId });

  if (!order) {
    return {
      status: "NO_ORDER" as const,
    };
  }

  if (order.payment_status !== "PAID") {
    return {
      status: "UNPAID" as const,
      orderCode: order.order_code,
    };
  }

  if (order.status !== "COMPLETED") {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("orders")
      .update({ status: "COMPLETED", updated_at: now })
      .eq("id", order.id);

    if (error) {
      throw error;
    }

    await supabase.from("shipments").upsert(
      {
        order_id: order.id,
        status: "DELIVERED",
        delivered_at: now,
        updated_at: now,
      },
      { onConflict: "order_id" },
    );

    await supabase.from("order_status_logs").insert({
      order_id: order.id,
      old_status: order.status,
      new_status: "COMPLETED",
      note: "Customer confirmed order completion via WhatsApp.",
    });
  }

  const { data: existingReview, error: reviewError } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_id", order.id)
    .limit(1)
    .maybeSingle();

  if (reviewError) {
    throw reviewError;
  }

  return {
    status: "COMPLETED" as const,
    orderCode: order.order_code,
    needsReview: !existingReview,
  };
}

async function recordReviewFromMessage({
  supabase,
  businessId,
  customerId,
  message,
  conversationHistory,
}: {
  supabase: AdminSupabaseClient;
  businessId: string;
  customerId?: string | null;
  message: string;
  conversationHistory: ConversationHistory;
}) {
  const normalized = normalize(message);
  const promptActive = isReviewPromptActive(conversationHistory);
  const explicitReview = /\b(rating|bintang|ulasan|review)\b/.test(normalized);

  if (!promptActive && !explicitReview) {
    return null;
  }

  const reviewInput = extractReviewInput(message);

  if (!reviewInput) {
    return {
      status: "INVALID_RATING" as const,
    };
  }

  const order = await getLatestCompletedOrderWithoutReview({
    supabase,
    businessId,
    customerId,
  });

  if (!order) {
    return {
      status: "NO_REVIEWABLE_ORDER" as const,
    };
  }

  const { error } = await supabase.from("reviews").insert({
    business_id: businessId,
    order_id: order.id,
    customer_id: customerId,
    rating: reviewInput.rating,
    comment: reviewInput.comment,
    is_visible: true,
  });

  if (error) {
    throw error;
  }

  return {
    status: "RECORDED" as const,
    orderCode: order.order_code,
    rating: reviewInput.rating,
  };
}

function buildReviewReceivedReply(rating: number) {
  return `Makasih banyak kak, rating ${rating}/5 sudah aku simpan. Feedback kakak langsung masuk ke dashboard toko.`;
}

function buildAlreadyReviewedReply(orderCode: string) {
  return `Pesanan ${orderCode} sudah tercatat selesai, kak. Ratingnya juga sudah masuk ke dashboard. Makasih ya.`;
}

function buildInvalidRatingReply() {
  return [
    "Boleh kirim ratingnya pakai angka 1 sampai 5 ya kak.",
    "1 = kurang puas, 2 = kurang, 3 = cukup, 4 = bagus, 5 = puas banget.",
    'Contoh: "5, rasanya enak" atau "rating 4, pengirimannya agak lama".',
  ].join("\n");
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

function extractQuantity(message: string) {
  const normalized = normalize(message);
  const numeric = normalized.match(/\b(\d{1,3})\b/);

  if (numeric) {
    return Number(numeric[1]);
  }

  const wordMap: Record<string, number> = {
    satu: 1,
    se: 1,
    dua: 2,
    tiga: 3,
    empat: 4,
    lima: 5,
    enam: 6,
    tujuh: 7,
    delapan: 8,
    sembilan: 9,
    sepuluh: 10,
  };

  for (const [word, value] of Object.entries(wordMap)) {
    if (new RegExp(`\\b${word}\\b`).test(normalized)) {
      return value;
    }
  }

  return null;
}

function isAffirmation(message: string) {
  return /^(iya|ya|y|ok|oke|siap|betul|bener|benar|jadi|lanjut|gas)(\b|$)/.test(normalize(message));
}

function looksLikeOrderRequest(message: string) {
  return /\b(mau|pesan|order|beli|ambil|bungkus|jadi|lanjut)\b/.test(normalize(message));
}

function toMatchedOrderItem(product: Product, quantity: number): MatchedOrderItem {
  const variant = product.variants?.find((candidate) => candidate.is_active) ?? null;

  return {
    product,
    variant,
    quantity,
    total: product.price * quantity,
  };
}

function buildMatchedItemsFromIntent(
  items: Array<{ product_name: string; quantity: number }>,
  products: Product[],
) {
  return items
    .map((item) => {
      const product = matchProduct(products, item.product_name);

      return product ? toMatchedOrderItem(product, item.quantity) : null;
    })
    .filter(Boolean) as MatchedOrderItem[];
}

function recentlyMentionedProducts(history: ConversationHistory, products: Product[]) {
  const recentText = history
    .slice(-4)
    .map((item) => item.message)
    .join(" ");
  const normalizedRecent = normalize(recentText);

  return products.filter((product) => normalizedRecent.includes(normalize(product.name)));
}

function inferMatchedItemsFromMessage(
  message: string,
  products: Product[],
  history: ConversationHistory,
) {
  const quantity = extractQuantity(message);

  if (!quantity) {
    return [];
  }

  const directProduct = matchProduct(products, message);

  if (directProduct) {
    return [toMatchedOrderItem(directProduct, quantity)];
  }

  if (!looksLikeOrderRequest(message) && !isAffirmation(message)) {
    return [];
  }

  const activeProducts = products.filter((product) => product.is_active);

  if (activeProducts.length === 1) {
    return [toMatchedOrderItem(activeProducts[0], quantity)];
  }

  const mentionedProducts = recentlyMentionedProducts(history, activeProducts);

  if (mentionedProducts.length === 1) {
    return [toMatchedOrderItem(mentionedProducts[0], quantity)];
  }

  return [];
}

function getLastBotMessage(history: ConversationHistory) {
  return history
    .slice()
    .reverse()
    .find((item) => item.sender === "BOT")?.message ?? null;
}

function getPendingOrderFromLastBot(history: ConversationHistory, products: Product[]) {
  const lastBotMessage = getLastBotMessage(history);

  if (!lastBotMessage) {
    return [];
  }

  const normalizedBot = normalize(lastBotMessage);

  if (normalizedBot.includes("kode order") || normalizedBot.includes("pesanan berhasil")) {
    return [];
  }

  const product = products.find((item) => {
    const productName = normalize(item.name);
    const productIndex = normalizedBot.indexOf(productName);

    if (productIndex < 0) {
      return false;
    }

    const beforeProduct = normalizedBot.slice(0, productIndex);

    return /\b(mau pesan|mau ambil|pesan|ambil|bungkus)\b/.test(beforeProduct);
  });

  if (!product) {
    return [];
  }

  const productName = normalize(product.name);
  const productIndex = normalizedBot.indexOf(productName);
  const afterProduct = normalizedBot.slice(productIndex + productName.length, productIndex + productName.length + 80);
  const hasQuantityUnit = /\b(\d{1,3}|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh)\s*(porsi|pcs|buah|bungkus|item)\b/.test(afterProduct);

  if (!hasQuantityUnit) {
    return [];
  }

  const quantity = extractQuantity(afterProduct);

  return quantity ? [toMatchedOrderItem(product, quantity)] : [];
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
    let intent = await detectIntent(payload.message);

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

    const rawFrom = payload.from.trim();
    const whatsappNumber = normalizeWhatsAppNumber(rawFrom) ?? rawFrom;
    const customerName = getCustomerNameFromWebhook(payload.raw, whatsappNumber);
    const lookupNumbers = Array.from(new Set([whatsappNumber, rawFrom]));

    const { data: existingCustomerByWhatsapp } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", business.id)
      .in("whatsapp_number", lookupNumbers)
      .limit(1)
      .maybeSingle();

    const { data: existingCustomerByPhone } = existingCustomerByWhatsapp
      ? { data: null }
      : await supabase
          .from("customers")
          .select("*")
          .eq("business_id", business.id)
          .in("phone", lookupNumbers)
          .limit(1)
          .maybeSingle();

    const existingCustomer = existingCustomerByWhatsapp ?? existingCustomerByPhone;

    const customerUpdates: Record<string, string> = {};

    if (existingCustomer) {
      if (existingCustomer.whatsapp_number !== whatsappNumber) {
        customerUpdates.whatsapp_number = whatsappNumber;
      }

      if (existingCustomer.phone !== whatsappNumber) {
        customerUpdates.phone = whatsappNumber;
      }

      if (!existingCustomer.name || isPhoneLike(existingCustomer.name)) {
        customerUpdates.name = customerName;
      }
    }

    const customer =
      existingCustomer && Object.keys(customerUpdates).length
        ? (
            await supabase
              .from("customers")
              .update(customerUpdates)
              .eq("id", existingCustomer.id)
              .select("*")
              .single()
          ).data
        : existingCustomer ??
          (
            await supabase
              .from("customers")
              .insert({
                business_id: business.id,
                name: customerName,
                phone: whatsappNumber,
                whatsapp_number: whatsappNumber,
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
          external_chat_id: whatsappNumber,
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
        raw_payload: sanitizeRawPayload(payload.raw),
      });
    }

    const products = await getProductsForBusiness(business.id, demoProducts);
    const conversationHistory = await getConversationHistory(supabase, conversation?.id);
    let reply = buildFallbackReply(business.name, payload.message);
    let createdOrder: Order | null = null;
    let forcedMatchedItems: MatchedOrderItem[] = [];
    let shouldNaturalizeReply = true;
    const paymentProof = await recordPaymentProofFromMedia({
      supabase,
      businessId: business.id,
      customerId: customer?.id,
      message: payload.message,
      raw: payload.raw,
    });
    let specialHandled = Boolean(paymentProof);

    if (paymentProof?.status === "RECORDED") {
      reply = buildPaymentProofReceivedReply(paymentProof.orderCode);
      shouldNaturalizeReply = false;
      intent = {
        ...intent,
        intent: "ASK_PAYMENT_METHOD",
        items: [],
        confidence: Math.max(intent.confidence, 0.9),
      };
    }

    if (paymentProof?.status === "MEDIA_UNAVAILABLE") {
      reply = buildPaymentProofRetryReply(paymentProof.reason);
      shouldNaturalizeReply = false;
      intent = {
        ...intent,
        intent: "ASK_PAYMENT_METHOD",
        items: [],
        confidence: Math.max(intent.confidence, 0.8),
      };
    }

    if (paymentProof?.status === "NO_PENDING_ORDER") {
      reply = buildPaymentProofNoOrderReply();
      shouldNaturalizeReply = false;
      intent = {
        ...intent,
        intent: "CHECK_ORDER_STATUS",
        items: [],
        confidence: Math.max(intent.confidence, 0.75),
      };
    }

    if (!specialHandled && isOrderCompletionRequest(payload.message)) {
      const completion = await completeLatestPaidOrder({
        supabase,
        businessId: business.id,
        customerId: customer?.id,
      });
      specialHandled = true;
      shouldNaturalizeReply = false;

      if (completion.status === "COMPLETED") {
        reply = completion.needsReview
          ? buildReviewRequestReply(completion.orderCode)
          : buildAlreadyReviewedReply(completion.orderCode);
        intent = {
          ...intent,
          intent: "CHECK_ORDER_STATUS",
          items: [],
          confidence: Math.max(intent.confidence, 0.9),
        };
      }

      if (completion.status === "UNPAID") {
        reply = buildCompletionNeedsPaymentReply(completion.orderCode);
        intent = {
          ...intent,
          intent: "ASK_PAYMENT_METHOD",
          items: [],
          confidence: Math.max(intent.confidence, 0.85),
        };
      }

      if (completion.status === "NO_ORDER") {
        reply = buildCompletionNoOrderReply();
        intent = {
          ...intent,
          intent: "CHECK_ORDER_STATUS",
          items: [],
          confidence: Math.max(intent.confidence, 0.75),
        };
      }
    }

    if (!specialHandled) {
      const review = await recordReviewFromMessage({
        supabase,
        businessId: business.id,
        customerId: customer?.id,
        message: payload.message,
        conversationHistory,
      });

      if (review) {
        specialHandled = true;
        shouldNaturalizeReply = false;
        intent = {
          ...intent,
          intent: "UNKNOWN",
          items: [],
          confidence: Math.max(intent.confidence, 0.8),
        };

        if (review.status === "RECORDED") {
          reply = buildReviewReceivedReply(review.rating);
        }

        if (review.status === "INVALID_RATING") {
          reply = buildInvalidRatingReply();
        }

        if (review.status === "NO_REVIEWABLE_ORDER") {
          reply = "Aku belum menemukan pesanan selesai yang belum diberi rating dari nomor ini, kak.";
        }
      }
    }

    if (!specialHandled && intent.intent === "UNKNOWN" && isAffirmation(payload.message)) {
      const pendingItems = getPendingOrderFromLastBot(conversationHistory, products);
      forcedMatchedItems = pendingItems.length
        ? pendingItems
        : inferMatchedItemsFromMessage(payload.message, products, conversationHistory);
    }

    if (!specialHandled && intent.intent === "UNKNOWN" && !forcedMatchedItems.length) {
      forcedMatchedItems = inferMatchedItemsFromMessage(
        payload.message,
        products,
        conversationHistory,
      );
    }

    if (!specialHandled && forcedMatchedItems.length) {
      intent = {
        ...intent,
        intent: "CREATE_ORDER",
        items: forcedMatchedItems.map((item) => ({
          product_name: item.product.name,
          variant_name: item.variant?.name ?? null,
          quantity: item.quantity,
          notes: null,
        })),
        confidence: Math.max(intent.confidence, 0.78),
      };
    }

    if (!specialHandled && intent.intent === "ASK_STOCK") {
      const productQuery = extractProductQuery(payload.message);
      reply = buildAvailabilityReply({
        product: productQuery ? matchProduct(products, productQuery) : null,
        query: productQuery,
        products,
      });
    }

    if (!specialHandled && (intent.intent === "ASK_PRODUCT" || intent.intent === "ASK_PRICE")) {
      reply = buildProductListReply(business.name, products);
    }

    if (!specialHandled && intent.intent === "ASK_PAYMENT_METHOD") {
      reply = buildPaymentMethodReply(
        business.name,
        business.payment_instructions,
        business.qris_image_url,
      );
    }

    if (!specialHandled && intent.intent === "ASK_DELIVERY") {
      reply = buildDeliveryReply(business.name, business.address);
    }

    if (!specialHandled && intent.intent === "TALK_TO_ADMIN") {
      reply = buildTalkToAdminReply();
    }

    if (!specialHandled && intent.intent === "CHECK_ORDER_STATUS") {
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

    if (!specialHandled && intent.intent === "CREATE_ORDER") {
      let matchedItems = forcedMatchedItems.length
        ? forcedMatchedItems
        : buildMatchedItemsFromIntent(intent.items, products);

      if (!matchedItems.length) {
        matchedItems = inferMatchedItemsFromMessage(
          payload.message,
          products,
          conversationHistory,
        );
      }

      if (!matchedItems.length) {
        reply = "Bisa, kak. Mau pesan produk yang mana dan berapa banyak? Kalau belum tahu pilihannya, aku bisa kirim menu yang tersedia.";
      } else {
        const totals = calculateOrderTotal({
          items: matchedItems.map((item) => ({
            quantity: item.quantity,
            price: item.product.price,
          })),
        });
        const orderCode = await generateAvailableOrderCode(supabase);
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            business_id: business.id,
            customer_id: customer?.id,
            order_code: orderCode,
            source: "WHATSAPP",
            status: "PENDING_PAYMENT",
            subtotal: totals.subtotal,
            discount_total: 0,
            shipping_cost: 0,
            grand_total: totals.grandTotal,
            payment_status: "PENDING",
            notes: `Created from WhatsApp ${whatsappNumber}`,
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

    if (shouldNaturalizeReply) {
      reply = await buildAiNaturalReply({
        customerMessage: payload.message,
        intent: intent.intent,
        business,
        products,
        draftReply: reply,
        conversationHistory,
      });
    }

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
