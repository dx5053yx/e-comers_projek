insert into public.businesses (
  id,
  owner_id,
  name,
  slug,
  category,
  description,
  address,
  whatsapp_number,
  payment_instructions,
  qris_image_url,
  whatsapp_ai_prompt,
  is_active
)
values (
  '00000000-0000-4000-8000-000000000001',
  null,
  'Warung Seblak Ibu Ani',
  'warung-seblak-ibu-ani',
  'Kuliner',
  'UMKM kuliner Purbalingga dengan order WhatsApp, katalog web, dan pembayaran manual.',
  'Jl. Letkol Isdiman, Purbalingga',
  '+6281234567890',
  'Transfer ke BCA 1234567890 a.n. Warung Seblak Ibu Ani atau QRIS toko.',
  null,
  null,
  true
)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  category = excluded.category,
  description = excluded.description,
  address = excluded.address,
  whatsapp_number = excluded.whatsapp_number,
  payment_instructions = excluded.payment_instructions,
  qris_image_url = excluded.qris_image_url,
  whatsapp_ai_prompt = excluded.whatsapp_ai_prompt,
  is_active = excluded.is_active;

insert into public.categories (id, business_id, name)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001', 'Makanan'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000001', 'Minuman')
on conflict (id) do update set name = excluded.name;

insert into public.products (
  id,
  business_id,
  category_id,
  name,
  slug,
  description,
  sku,
  price,
  is_active
)
values
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    'Seblak Original',
    'seblak-original',
    'Seblak kuah pedas dengan kerupuk, telur, dan sayuran.',
    'SBK-ORI',
    10000,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000201',
    'Seblak Seafood',
    'seblak-seafood',
    'Seblak dengan topping seafood dan bakso ikan.',
    'SBK-SEA',
    15000,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000202',
    'Es Teh',
    'es-teh',
    'Es teh manis segar untuk pendamping makanan pedas.',
    'MNM-EST',
    4000,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  sku = excluded.sku,
  price = excluded.price,
  is_active = excluded.is_active;

insert into public.product_variants (
  id,
  product_id,
  name,
  sku,
  price_adjustment,
  stock,
  low_stock_threshold,
  is_active
)
values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000101', 'Pedas sedang', 'SBK-ORI-M', 0, 32, 8, true),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000102', 'Pedas', 'SBK-SEA-P', 0, 7, 8, true),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000103', 'Normal', 'MNM-EST-N', 0, 40, 10, true)
on conflict (id) do update set
  stock = excluded.stock,
  low_stock_threshold = excluded.low_stock_threshold,
  is_active = excluded.is_active;

insert into public.customers (
  id,
  business_id,
  name,
  phone,
  whatsapp_number,
  email,
  address,
  segment
)
values
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000001', 'Dina', '+6281111111111', '+6281111111111', 'dina@example.com', 'Purbalingga Kidul', 'LOYAL'),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000001', 'Raka', '+6282222222222', '+6282222222222', 'raka@example.com', 'Kalimanah', 'RETURNING')
on conflict (id) do update set
  name = excluded.name,
  segment = excluded.segment;

insert into public.orders (
  id,
  business_id,
  customer_id,
  order_code,
  source,
  status,
  subtotal,
  discount_total,
  shipping_cost,
  grand_total,
  payment_status,
  notes
)
values
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000401', 'SP-20260604-001', 'WHATSAPP', 'PACKING', 24000, 0, 8000, 32000, 'PAID', 'Pesanan dari chatbot WhatsApp.'),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000402', 'SP-20260604-002', 'WEB', 'PENDING_PAYMENT', 15000, 0, 0, 15000, 'PENDING', 'Menunggu bukti bayar.')
on conflict (id) do update set
  status = excluded.status,
  payment_status = excluded.payment_status,
  grand_total = excluded.grand_total;

insert into public.order_items (
  id,
  order_id,
  product_id,
  product_variant_id,
  product_name,
  variant_name,
  quantity,
  price,
  total
)
values
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000301', 'Seblak Original', 'Pedas sedang', 2, 10000, 20000),
  ('00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000303', 'Es Teh', 'Normal', 1, 4000, 4000),
  ('00000000-0000-4000-8000-000000000603', '00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000302', 'Seblak Seafood', 'Pedas', 1, 15000, 15000)
on conflict (id) do update set quantity = excluded.quantity, total = excluded.total;

insert into public.payments (
  id,
  order_id,
  method,
  status,
  amount,
  verified_at,
  note
)
values
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000501', 'MANUAL_TRANSFER', 'PAID', 32000, now(), 'Bukti pembayaran valid.')
on conflict (id) do update set status = excluded.status, amount = excluded.amount;

insert into public.shipments (
  id,
  order_id,
  courier,
  tracking_number,
  status
)
values
  ('00000000-0000-4000-8000-000000000801', '00000000-0000-4000-8000-000000000501', 'JNE', 'JP123456789', 'READY_TO_SHIP')
on conflict (id) do update set
  courier = excluded.courier,
  tracking_number = excluded.tracking_number,
  status = excluded.status;

insert into public.reviews (
  id,
  business_id,
  order_id,
  customer_id,
  rating,
  comment,
  is_visible
)
values
  ('00000000-0000-4000-8000-000000000901', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000401', 5, 'Bot cepat membalas dan pesanan langsung tercatat.', true)
on conflict (id) do update set
  rating = excluded.rating,
  comment = excluded.comment,
  is_visible = excluded.is_visible;
