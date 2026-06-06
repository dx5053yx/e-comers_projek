import {
  INTENT_SYSTEM_PROMPT,
  WHATSAPP_REPLY_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import type { Business, Product, Voucher } from "@/lib/types";
import { activePromoSummary } from "@/lib/promos";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function getGeminiModel(kind: "intent" | "reply") {
  if (kind === "intent") {
    return process.env.GEMINI_INTENT_MODEL ?? process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";
  }

  return process.env.GEMINI_REPLY_MODEL ?? process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";
}

export async function generateIntentJson(message: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${getGeminiModel("intent")}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${INTENT_SYSTEM_PROMPT}\n\nPesan customer:\n${message}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const payload = (await response.json()) as GeminiResponse;
  return payload.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

function buildProductContext(products: Product[]) {
  return products
    .filter((product) => product.is_active)
    .slice(0, 12)
    .map((product) => {
      const variants = (product.variants ?? [])
        .filter((variant) => variant.is_active)
        .slice(0, 5)
        .map((variant) => `${variant.name} stok ${variant.stock}`)
        .join(", ");

      return {
        name: product.name,
        price: product.price,
        description: product.description ?? null,
        stock: product.variants?.reduce((sum, variant) => sum + variant.stock, 0) ?? null,
        variants: variants || null,
      };
    });
}

export async function generateWhatsAppReply({
  customerMessage,
  intent,
  business,
  products,
  vouchers = [],
  draftReply,
  conversationHistory = [],
  replyMode = "safe_action",
}: {
  customerMessage: string;
  intent: string;
  business: Pick<
    Business,
    | "name"
    | "category"
    | "description"
    | "address"
    | "payment_instructions"
    | "qris_image_url"
    | "whatsapp_ai_prompt"
  >;
  products: Product[];
  vouchers?: Voucher[];
  draftReply: string;
  conversationHistory?: Array<{
    sender: "CUSTOMER" | "BOT" | "ADMIN" | "SYSTEM";
    message: string;
  }>;
  replyMode?: "safe_action" | "human_chat";
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const context = {
    business: {
      name: business.name,
      category: business.category ?? null,
      description: business.description ?? null,
      address: business.address ?? null,
      has_qris: Boolean(business.qris_image_url),
      payment_instructions: business.payment_instructions ?? null,
      custom_ai_prompt: business.whatsapp_ai_prompt ?? null,
    },
    products: buildProductContext(products),
    active_promos: activePromoSummary(vouchers, 6),
    intent,
    reply_mode: replyMode,
    customer_message: customerMessage,
    conversation_history: conversationHistory.slice(-12),
    draft_reply: draftReply,
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${getGeminiModel("reply")}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${WHATSAPP_REPLY_SYSTEM_PROMPT}\n\nKonteks JSON:\n${JSON.stringify(context)}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.55,
          maxOutputTokens: 1200,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  return text || null;
}
