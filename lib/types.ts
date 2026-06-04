export type Role =
  | "SUPER_ADMIN"
  | "BUSINESS_OWNER"
  | "BUSINESS_STAFF"
  | "CUSTOMER";

export type MemberRole = "OWNER" | "STAFF";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "PACKING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "PAID" | "REJECTED" | "REFUNDED";

export type ShipmentStatus =
  | "NOT_SHIPPED"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "DELIVERED"
  | "RETURNED";

export type OrderSource = "WEB" | "WHATSAPP" | "ADMIN";

export type InventoryMovementType =
  | "IN"
  | "OUT"
  | "ADJUSTMENT"
  | "ORDER_RESERVED"
  | "ORDER_CANCELLED";

export type CustomerSegment = "NEW" | "RETURNING" | "LOYAL";

export type AiIntent =
  | "ASK_PRODUCT"
  | "ASK_PRICE"
  | "ASK_STOCK"
  | "CREATE_ORDER"
  | "CHECK_ORDER_STATUS"
  | "ASK_PAYMENT_METHOD"
  | "ASK_DELIVERY"
  | "TALK_TO_ADMIN"
  | "UNKNOWN";

export type Business = {
  id: string;
  owner_id?: string | null;
  name: string;
  slug: string;
  category?: string | null;
  description?: string | null;
  address?: string | null;
  whatsapp_number?: string | null;
  logo_url?: string | null;
  payment_instructions?: string | null;
  qris_image_url?: string | null;
  whatsapp_ai_prompt?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type Category = {
  id: string;
  business_id: string;
  name: string;
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  sku?: string | null;
  price_adjustment: number;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type Product = {
  id: string;
  business_id: string;
  category_id?: string | null;
  category?: Category | null;
  name: string;
  slug: string;
  description?: string | null;
  sku?: string | null;
  price: number;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
  variants?: ProductVariant[];
};

export type Customer = {
  id: string;
  business_id: string;
  name?: string | null;
  phone?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  address?: string | null;
  segment: CustomerSegment;
  created_at: string;
  updated_at?: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_variant_id?: string | null;
  product_name: string;
  variant_name?: string | null;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
};

export type Shipment = {
  id: string;
  order_id: string;
  courier?: string | null;
  tracking_number?: string | null;
  status: ShipmentStatus;
  shipped_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type Payment = {
  id: string;
  order_id: string;
  method: string;
  status: PaymentStatus;
  amount: number;
  proof_url?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  note?: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  business_id: string;
  customer_id?: string | null;
  customer?: Customer | null;
  order_code: string;
  source: OrderSource;
  status: OrderStatus;
  subtotal: number;
  discount_total: number;
  shipping_cost: number;
  grand_total: number;
  payment_status: PaymentStatus;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  items?: OrderItem[];
  payment?: Payment | null;
  shipment?: Shipment | null;
};

export type Review = {
  id: string;
  business_id: string;
  order_id: string;
  customer_id?: string | null;
  rating: number;
  comment?: string | null;
  is_visible: boolean;
  created_at: string;
  customer?: Customer | null;
  order?: Order | null;
};
