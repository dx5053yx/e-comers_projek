import { z } from "zod";
import { parseRupiahInput } from "@/lib/utils";

const nullableOptionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => (value === "" ? null : value));

const nullableOptionalLongText = z
  .string()
  .trim()
  .max(2000, "Prompt maksimal 2000 karakter.")
  .optional()
  .nullable()
  .transform((value) => (value === "" ? null : value));

const optionalUrl = z
  .string()
  .trim()
  .url("URL tidak valid.")
  .optional()
  .nullable()
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value));

const indonesiaPhone = z
  .string()
  .trim()
  .regex(/^(\+62|62|0)8[0-9]{7,12}$/, "Nomor WhatsApp tidak valid.");

export const businessSchema = z.object({
  name: z.string().min(2, "Nama bisnis minimal 2 karakter"),
  slug: z.string().min(2, "Slug wajib diisi").regex(/^[a-z0-9-]+$/),
  category: nullableOptionalText,
  description: nullableOptionalText,
  address: nullableOptionalText,
  whatsapp_number: indonesiaPhone.optional().nullable().or(z.literal("")),
  payment_instructions: nullableOptionalText,
  qris_image_url: optionalUrl,
  whatsapp_ai_prompt: nullableOptionalLongText,
});

export const productSchema = z.object({
  business_id: z.string().uuid(),
  category_id: z.string().uuid().optional().nullable(),
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  description: nullableOptionalText,
  sku: nullableOptionalText,
  price: z.preprocess(
    parseRupiahInput,
    z.coerce.number().positive("Harga harus lebih dari 0."),
  ),
  image_url: optionalUrl,
  is_active: z.coerce.boolean().default(true),
  variants: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        name: z.string().trim().min(1, "Nama varian wajib diisi."),
        sku: nullableOptionalText,
        price_adjustment: z.preprocess(parseRupiahInput, z.coerce.number().default(0)),
        stock: z.coerce.number().int().min(0, "Stok tidak boleh minus.").default(0),
        low_stock_threshold: z.coerce
          .number()
          .int()
          .min(0, "Threshold tidak boleh minus.")
          .default(5),
        is_active: z.coerce.boolean().default(true),
      }),
    )
    .default([]),
});

export const inventoryMovementSchema = z.object({
  business_id: z.string().uuid(),
  product_variant_id: z.string().uuid(),
  type: z.enum(["IN", "OUT", "ADJUSTMENT", "ORDER_RESERVED", "ORDER_CANCELLED"]),
  quantity: z.coerce.number().int(),
  note: z.string().optional().nullable(),
});

export const customerSchema = z.object({
  business_id: z.string().uuid(),
  name: z.string().trim().min(2, "Nama customer minimal 2 karakter.").optional().nullable(),
  phone: indonesiaPhone.optional().nullable().or(z.literal("")),
  whatsapp_number: indonesiaPhone.optional().nullable().or(z.literal("")),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().trim().min(5, "Alamat minimal 5 karakter.").optional().nullable(),
  segment: z.enum(["NEW", "RETURNING", "LOYAL"]).default("NEW"),
});

export const orderItemInputSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  product_variant_id: z.string().uuid().optional().nullable(),
  product_name: z.string().min(1),
  variant_name: z.string().optional().nullable(),
  quantity: z.coerce.number().int().positive("Jumlah minimal 1."),
  price: z.preprocess(
    parseRupiahInput,
    z.coerce.number().positive("Harga item harus lebih dari 0."),
  ),
});

export const orderSchema = z.object({
  business_id: z.string().uuid(),
  customer: customerSchema.omit({ business_id: true }).optional(),
  customer_id: z.string().uuid().optional().nullable(),
  source: z.enum(["WEB", "WHATSAPP", "ADMIN"]).default("WEB"),
  notes: z.string().optional().nullable(),
  shipping_cost: z.coerce.number().min(0).default(0),
  discount_total: z.coerce.number().min(0).default(0),
  items: z.array(orderItemInputSchema).min(1),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "PENDING_PAYMENT",
    "PAID",
    "PROCESSING",
    "PACKING",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
  ]),
  note: z.string().optional().nullable(),
});

export const shipmentSchema = z.object({
  courier: nullableOptionalText,
  tracking_number: nullableOptionalText,
  status: z
    .enum(["NOT_SHIPPED", "READY_TO_SHIP", "SHIPPED", "DELIVERED", "RETURNED"])
    .default("READY_TO_SHIP"),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
});

export const openClawWebhookSchema = z.object({
  businessSlug: z.string().min(1),
  from: z.string().min(3),
  message: z.string().min(1),
  timestamp: z.string().optional(),
  raw: z.record(z.string(), z.unknown()).optional().default({}),
});
