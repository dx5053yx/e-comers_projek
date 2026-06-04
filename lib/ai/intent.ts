import { z } from "zod";
import { generateIntentJson } from "@/lib/ai/gemini";
import type { AiIntent } from "@/lib/types";

export const parsedIntentSchema = z.object({
  intent: z.enum([
    "ASK_PRODUCT",
    "ASK_PRICE",
    "ASK_STOCK",
    "CREATE_ORDER",
    "CHECK_ORDER_STATUS",
    "ASK_PAYMENT_METHOD",
    "ASK_DELIVERY",
    "TALK_TO_ADMIN",
    "UNKNOWN",
  ]),
  customer_name: z.string().nullable().optional(),
  order_code: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        product_name: z.string(),
        variant_name: z.string().nullable().optional(),
        quantity: z.coerce.number().int().positive().default(1),
        notes: z.string().nullable().optional(),
      }),
    )
    .default([]),
  question: z.string().nullable().optional(),
  confidence: z.coerce.number().min(0).max(1).default(0.5),
});

export type ParsedIntent = z.infer<typeof parsedIntentSchema>;

function extractOrderCode(message: string) {
  return message.match(/SP-\d{8}-\d{3}/i)?.[0]?.toUpperCase() ?? null;
}

function heuristicIntent(message: string): ParsedIntent {
  const normalized = message.toLowerCase();
  const orderCode = extractOrderCode(message);

  if (orderCode) {
    return {
      intent: "CHECK_ORDER_STATUS",
      order_code: orderCode,
      items: [],
      question: message,
      confidence: 0.82,
    };
  }

  if (
    /\b(nyari|cari|ada\s*(g|ga|gak|nggak|ngga)|ready\s*(g|ga|gak|nggak|ngga))\b/.test(normalized)
  ) {
    return {
      intent: "ASK_STOCK",
      items: [],
      question: message,
      confidence: 0.7,
    };
  }

  const intentMap: Array<[AiIntent, string[]]> = [
    ["ASK_PRODUCT", ["menu", "produk", "jualan", "ada apa"]],
    ["ASK_PRICE", ["harga", "berapa", "price"]],
    ["ASK_STOCK", ["stok", "ready", "tersedia", "ada?"]],
    ["ASK_PAYMENT_METHOD", ["bayar", "transfer", "qris", "rekening"]],
    ["ASK_DELIVERY", ["kirim", "ongkir", "delivery", "antar"]],
    ["TALK_TO_ADMIN", ["admin", "cs", "orang", "manual"]],
  ];

  if (["mau", "pesan", "order", "beli", "ambil"].some((word) => normalized.includes(word))) {
    const quantityMatch = normalized.match(/(\d+)/);
    return {
      intent: "CREATE_ORDER",
      items: [
        {
          product_name: normalized
            .replace(/mau|pesan|order|beli|ambil|\d+/g, "")
            .trim(),
          quantity: quantityMatch ? Number(quantityMatch[1]) : 1,
          variant_name: null,
          notes: null,
        },
      ],
      question: message,
      confidence: 0.62,
    };
  }

  for (const [intent, keywords] of intentMap) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return {
        intent,
        items: [],
        question: message,
        confidence: 0.65,
      };
    }
  }

  return {
    intent: "UNKNOWN",
    items: [],
    question: message,
    confidence: 0.25,
  };
}

export async function detectIntent(message: string) {
  const heuristic = heuristicIntent(message);

  if (heuristic.intent === "UNKNOWN" || heuristic.confidence >= 0.6) {
    return heuristic;
  }

  try {
    const generated = await generateIntentJson(message);

    if (!generated) {
      return heuristic;
    }

    return parsedIntentSchema.parse(JSON.parse(generated));
  } catch {
    return heuristic;
  }
}
