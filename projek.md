# projek.md — Plan & Workflow Pengembangan siPandu MVP

## 1. Ringkasan Proyek

**Nama proyek:** siPandu  
**Jenis:** Platform chatbot WhatsApp + dashboard sales management untuk UMKM lokal Purbalingga  
**Tujuan utama:** Membantu UMKM mengotomatisasi layanan pelanggan, pencatatan pesanan, pengelolaan produk/stok, alur order, dan laporan penjualan sederhana.

siPandu harus bisa dipakai untuk dua jalur transaksi:

1. **Jalur WhatsApp chatbot**  
   Customer chat nomor WhatsApp UMKM/siPandu, chatbot menjawab pertanyaan produk, mencatat pesanan, mengecek status order, dan menyimpan data ke database.

2. **Jalur web dashboard/e-commerce**  
   Admin UMKM mengelola produk, stok, order, pembayaran, pengiriman, laporan, serta customer. Customer bisa melihat katalog sederhana dan membuat order.

Proyek ini dibuat untuk MVP/demo yang sudah bisa di-hosting, murah/gratis sebisa mungkin, dan siap dikembangkan menjadi platform komersial.

---

## 2. Target MVP

MVP wajib mencakup fitur-fitur berikut:

- Landing page siPandu.
- Login/register admin UMKM.
- Dashboard UMKM.
- Product management.
- Inventory/stock management sederhana.
- Customer management.
- Order management dengan status lengkap.
- Manual payment verification.
- Manual delivery tracking/resi.
- Review/feedback.
- Sales analytics sederhana.
- WhatsApp chatbot via OpenClaw.
- Integrasi AI untuk auto-reply dan ekstraksi order dari chat.
- Database multi-tenant agar satu sistem bisa dipakai banyak UMKM.
- Payment gateway otomatis Midtrans/Xendit.
- Ongkir otomatis RajaOngkir/Biteship.
- Mobile app native.
- Marketplace multi-channel penuh.
- AI recommendation kompleks.
- Accounting lengkap.

---

## 3. Stack Teknologi yang Dipakai

### 3.1 Frontend dan Backend Web

Gunakan:

- **Next.js** dengan App Router.
- **TypeScript**.
- **Tailwind CSS**.
- **shadcn/ui** untuk komponen UI.
- **React Hook Form + Zod** untuk form validation.
- **Recharts** untuk grafik analytics.
- **Next.js Route Handler** untuk API internal dan webhook.

Alasan:

- Cocok untuk landing page, dashboard, dan API ringan.
- Mudah di-hosting di Vercel/Cloudflare Pages.
- Mudah dikembangkan oleh Codex/agent lain.

### 3.2 Database dan Auth

Gunakan:

- **Supabase**
  - PostgreSQL database.
  - Supabase Auth.
  - Supabase Storage untuk upload bukti pembayaran/foto produk.
  - Row Level Security untuk multi-tenant.

Alasan:

- Data e-commerce/order lebih cocok relasional.
- Cocok untuk tabel order, order item, product, stock, customer, payment, shipment, dan review.
- Free plan cukup untuk MVP/demo.

### 3.3 AI

Gunakan salah satu:

- **Gemini API** untuk MVP gratis/hemat.
- Opsional fallback: **OpenAI API** jika ada budget.
- Opsional lokal: **Ollama** jika ingin tanpa biaya API, tetapi butuh server/laptop kuat.

Untuk MVP, gunakan **Gemini API** sebagai default.

### 3.4 WhatsApp Chatbot

Gunakan:

- **OpenClaw** sebagai gateway WhatsApp chatbot.
- OpenClaw harus di-host terpisah dari Next.js jika membutuhkan proses yang hidup terus.
- Gunakan nomor WhatsApp khusus untuk bot siPandu.

Catatan penting:

- Jangan host OpenClaw di Vercel serverless karena session WhatsApp/QR pairing butuh proses persistent.
- OpenClaw sebaiknya di-deploy di VPS/Railway/Render/server Docker.
- Pastikan session WhatsApp disimpan di persistent volume agar tidak scan QR ulang setiap redeploy.
- Untuk produksi resmi jangka panjang, siapkan opsi migrasi ke WhatsApp Cloud API.

### 3.5 Hosting

Rekomendasi arsitektur hosting:

```txt
Next.js web/dashboard/API ringan  -> Vercel atau Cloudflare Pages
Supabase database/auth/storage    -> Supabase
OpenClaw WhatsApp gateway         -> Railway/Render/VPS/Docker server
AI provider                       -> Gemini API
```

---

## 4. Arsitektur Sistem

```txt
Customer WhatsApp
      |
      v
OpenClaw WhatsApp Gateway
      |
      | HTTP webhook + secret
      v
Next.js API /api/webhooks/openclaw
      |
      | intent detection + order extraction
      v
Gemini API
      |
      v
Supabase PostgreSQL
      |
      v
Dashboard UMKM / Admin Panel
```

Alur web:

```txt
Customer Web
   -> Katalog Produk
   -> Cart
   -> Checkout
   -> Upload Bukti Bayar
   -> Admin Verifikasi
   -> Processing
   -> Packing
   -> Shipping
   -> Completed
   -> Review
```

---

## 5. Modul Utama

### 5.1 Product Management

Fitur:

- Tambah produk.
- Edit produk.
- Hapus/nonaktifkan produk.
- Upload foto produk.
- SKU produk.
- Harga produk.
- Kategori produk.
- Status aktif/nonaktif.
- Varian sederhana, contoh: ukuran/rasa/warna.

Halaman:

- `/dashboard/products`
- `/dashboard/products/new`
- `/dashboard/products/[id]/edit`

### 5.2 Inventory Management

Fitur:

- Stok real-time.
- Update stok manual.
- Auto pengurangan stok saat order diverifikasi/diproses.
- Riwayat perubahan stok.
- Peringatan stok menipis.
- Status in stock/out of stock.

Halaman:

- `/dashboard/inventory`
- `/dashboard/inventory/movements`

### 5.3 Order Management

Status order wajib:

```txt
PENDING_PAYMENT
PAID
PROCESSING
PACKING
SHIPPED
COMPLETED
CANCELLED
REFUNDED
```

Alur order utama:

```txt
ORDER_DIBUAT
   -> VERIFIKASI_PEMBAYARAN
   -> PROCESSING
   -> PACKING
   -> SHIPPING
   -> COMPLETED
```

Fitur:

- Daftar order.
- Detail order.
- Update status order.
- Invoice otomatis.
- Catatan admin.
- Riwayat status order.
- Filter order berdasarkan status/tanggal/customer.

Halaman:

- `/dashboard/orders`
- `/dashboard/orders/[id]`

### 5.4 Customer Management / CRM Sederhana

Fitur:

- Database pelanggan.
- Riwayat order pelanggan.
- Nomor WhatsApp pelanggan.
- Catatan pelanggan.
- Segmentasi sederhana: new, returning, loyal.

Halaman:

- `/dashboard/customers`
- `/dashboard/customers/[id]`

### 5.5 Payment Management

Untuk MVP gunakan pembayaran manual.

Fitur:

- Admin mengatur instruksi pembayaran.
- Customer upload bukti pembayaran.
- Admin verifikasi pembayaran.
- Status payment: pending, paid, rejected, refunded.
- Invoice PDF sederhana.

Halaman:

- `/dashboard/payments`
- `/order/[orderCode]/payment`

### 5.6 Shipping & Delivery Management

Untuk MVP gunakan input manual.

Fitur:

- Admin memilih kurir manual.
- Admin input nomor resi.
- Admin update status shipping.
- Customer bisa cek status order dari web atau WhatsApp.

Status shipment:

```txt
NOT_SHIPPED
READY_TO_SHIP
SHIPPED
DELIVERED
RETURNED
```

Halaman:

- `/dashboard/shipments`
- `/order/[orderCode]/tracking`

### 5.7 Review & Feedback

Fitur:

- Customer memberi rating 1-5.
- Customer memberi komentar.
- Review tampil di dashboard.
- Admin bisa menandai review sebagai hidden jika tidak layak.

Halaman:

- `/order/[orderCode]/review`
- `/dashboard/reviews`

### 5.8 Sales Analytics

Fitur:

- Total penjualan.
- Jumlah order.
- Produk terlaris.
- Customer baru.
- Conversion sederhana.
- Grafik penjualan harian/bulanan.
- Export CSV sederhana jika sempat.

Halaman:

- `/dashboard/analytics`

### 5.9 Promotion / Voucher

Fitur MVP sederhana:

- Buat voucher kode.
- Tipe diskon: fixed amount atau percentage.
- Minimal pembelian.
- Tanggal mulai dan berakhir.
- Maksimal penggunaan.

Halaman:

- `/dashboard/vouchers`

### 5.10 AI & Recommendation Features

Fitur AI MVP:

- Auto-reply pertanyaan produk.
- Ekstraksi order dari chat WhatsApp.
- Rekomendasi produk sederhana berdasarkan keyword customer.
- Ringkasan chat/order untuk admin.

Contoh pertanyaan customer:

```txt
ada seblak seafood?
harganya berapa?
mau order seblak original 2, minumnya es teh 1
cek pesanan SP-20260604-001
```

Output AI yang diharapkan:

```json
{
  "intent": "CREATE_ORDER",
  "customer_name": "",
  "items": [
    { "product_name": "Seblak Original", "quantity": 2 },
    { "product_name": "Es Teh", "quantity": 1 }
  ],
  "notes": "",
  "confidence": 0.86
}
```

### 5.11 Role & User Management

Role:

```txt
SUPER_ADMIN
BUSINESS_OWNER
BUSINESS_STAFF
CUSTOMER
```

Untuk MVP:

- SUPER_ADMIN: pengelola siPandu.
- BUSINESS_OWNER: pemilik UMKM.
- BUSINESS_STAFF: admin toko.
- CUSTOMER: pembeli.

---

## 6. Database Schema

Gunakan migration SQL Supabase. Semua tabel utama harus punya:

- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()` jika perlu

### 6.1 profiles

```sql
profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  phone text,
  role text check (role in ('SUPER_ADMIN','BUSINESS_OWNER','BUSINESS_STAFF','CUSTOMER')),
  created_at timestamptz default now()
)
```

### 6.2 businesses

```sql
businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  name text not null,
  slug text unique not null,
  category text,
  description text,
  address text,
  whatsapp_number text,
  logo_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

### 6.3 business_members

```sql
business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text check (role in ('OWNER','STAFF')),
  created_at timestamptz default now(),
  unique(business_id, user_id)
)
```

### 6.4 categories

```sql
categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
)
```

### 6.5 products

```sql
products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  category_id uuid references categories(id),
  name text not null,
  slug text not null,
  description text,
  sku text,
  price numeric(12,2) not null default 0,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(business_id, slug)
)
```

### 6.6 product_variants

```sql
product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  sku text,
  price_adjustment numeric(12,2) default 0,
  stock integer default 0,
  low_stock_threshold integer default 5,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

### 6.7 inventory_movements

```sql
inventory_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  product_variant_id uuid references product_variants(id),
  type text check (type in ('IN','OUT','ADJUSTMENT','ORDER_RESERVED','ORDER_CANCELLED')),
  quantity integer not null,
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
)
```

### 6.8 customers

```sql
customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text,
  phone text,
  whatsapp_number text,
  email text,
  address text,
  segment text default 'NEW',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

### 6.9 orders

```sql
orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  customer_id uuid references customers(id),
  order_code text unique not null,
  source text check (source in ('WEB','WHATSAPP','ADMIN')) default 'WEB',
  status text check (status in ('PENDING_PAYMENT','PAID','PROCESSING','PACKING','SHIPPED','COMPLETED','CANCELLED','REFUNDED')) default 'PENDING_PAYMENT',
  subtotal numeric(12,2) default 0,
  discount_total numeric(12,2) default 0,
  shipping_cost numeric(12,2) default 0,
  grand_total numeric(12,2) default 0,
  payment_status text check (payment_status in ('PENDING','PAID','REJECTED','REFUNDED')) default 'PENDING',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

### 6.10 order_items

```sql
order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_variant_id uuid references product_variants(id),
  product_name text not null,
  variant_name text,
  quantity integer not null,
  price numeric(12,2) not null,
  total numeric(12,2) not null,
  created_at timestamptz default now()
)
```

### 6.11 payments

```sql
payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  method text default 'MANUAL_TRANSFER',
  status text check (status in ('PENDING','PAID','REJECTED','REFUNDED')) default 'PENDING',
  amount numeric(12,2) not null,
  proof_url text,
  verified_by uuid references profiles(id),
  verified_at timestamptz,
  note text,
  created_at timestamptz default now()
)
```

### 6.12 shipments

```sql
shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  courier text,
  tracking_number text,
  status text check (status in ('NOT_SHIPPED','READY_TO_SHIP','SHIPPED','DELIVERED','RETURNED')) default 'NOT_SHIPPED',
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

### 6.13 order_status_logs

```sql
order_status_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  old_status text,
  new_status text,
  note text,
  changed_by uuid references profiles(id),
  created_at timestamptz default now()
)
```

### 6.14 reviews

```sql
reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  customer_id uuid references customers(id),
  rating integer check (rating between 1 and 5),
  comment text,
  is_visible boolean default true,
  created_at timestamptz default now()
)
```

### 6.15 vouchers

```sql
vouchers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  code text not null,
  type text check (type in ('FIXED','PERCENTAGE')),
  value numeric(12,2) not null,
  min_purchase numeric(12,2) default 0,
  max_uses integer,
  used_count integer default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(business_id, code)
)
```

### 6.16 conversations

```sql
conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  customer_id uuid references customers(id),
  channel text check (channel in ('WHATSAPP','WEB')) default 'WHATSAPP',
  external_chat_id text,
  last_message_at timestamptz,
  created_at timestamptz default now()
)
```

### 6.17 messages

```sql
messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_type text check (sender_type in ('CUSTOMER','BOT','ADMIN','SYSTEM')),
  message text not null,
  raw_payload jsonb,
  created_at timestamptz default now()
)
```

### 6.18 ai_action_logs

```sql
ai_action_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  conversation_id uuid references conversations(id),
  intent text,
  input_text text,
  output_json jsonb,
  confidence numeric(4,3),
  status text check (status in ('SUCCESS','FAILED','NEEDS_REVIEW')),
  error_message text,
  created_at timestamptz default now()
)
```

---

## 7. Row Level Security

Aktifkan RLS untuk semua tabel tenant/business.

Prinsip:

- User hanya boleh membaca data business yang dia miliki/ikuti di `business_members`.
- Owner/staff hanya boleh update data business miliknya.
- Customer hanya boleh akses order miliknya jika nanti auth customer diaktifkan.
- Webhook server pakai Supabase service role, tetapi hanya di server-side route, jangan pernah expose ke browser.

Minimal policy:

```sql
-- contoh prinsip policy, sesuaikan saat implementasi
create policy "members can read own business products"
on products for select
using (
  exists (
    select 1 from business_members bm
    where bm.business_id = products.business_id
    and bm.user_id = auth.uid()
  )
);
```

---

## 8. API Routes

Gunakan route handler Next.js di folder `app/api`.

### 8.1 Auth & Business

```txt
POST   /api/businesses
GET    /api/businesses/current
PATCH  /api/businesses/[businessId]
```

### 8.2 Products

```txt
GET    /api/products?businessId=
POST   /api/products
GET    /api/products/[id]
PATCH  /api/products/[id]
DELETE /api/products/[id]
```

### 8.3 Inventory

```txt
GET    /api/inventory?businessId=
POST   /api/inventory/movements
```

### 8.4 Orders

```txt
GET    /api/orders?businessId=&status=
POST   /api/orders
GET    /api/orders/[id]
PATCH  /api/orders/[id]/status
GET    /api/orders/code/[orderCode]
```

### 8.5 Payment

```txt
POST   /api/orders/[id]/payment-proof
PATCH  /api/payments/[id]/verify
PATCH  /api/payments/[id]/reject
```

### 8.6 Shipment

```txt
POST   /api/orders/[id]/shipment
PATCH  /api/shipments/[id]
```

### 8.7 Review

```txt
POST   /api/orders/[orderCode]/review
GET    /api/reviews?businessId=
```

### 8.8 Analytics

```txt
GET    /api/analytics/summary?businessId=
GET    /api/analytics/sales?businessId=&range=
GET    /api/analytics/top-products?businessId=
```

### 8.9 OpenClaw Webhook

```txt
POST   /api/webhooks/openclaw
```

Request dari OpenClaw harus memiliki secret.

Header:

```txt
x-openclaw-secret: <OPENCLAW_WEBHOOK_SECRET>
```

Body minimal yang diharapkan:

```json
{
  "businessSlug": "warung-seblak-ibu-ani",
  "from": "+6281234567890",
  "message": "mau beli seblak original 2",
  "timestamp": "2026-06-04T10:00:00.000Z",
  "raw": {}
}
```

Response:

```json
{
  "reply": "Siap kak, pesanan Seblak Original 2 porsi sudah dibuat. Kode order: SP-20260604-001. Total: Rp20.000. Silakan transfer ke ..."
}
```

---

## 9. Workflow Detail

## 9.1 Workflow Customer via WhatsApp

```txt
1. Customer mengirim chat ke WhatsApp bot.
2. OpenClaw menerima pesan.
3. OpenClaw meneruskan pesan ke /api/webhooks/openclaw.
4. Backend validasi x-openclaw-secret.
5. Backend mencari business berdasarkan businessSlug atau nomor tujuan.
6. Backend mencari/membuat customer berdasarkan nomor WhatsApp.
7. Pesan disimpan ke tabel conversations dan messages.
8. Backend memanggil AI intent detection.
9. AI mengembalikan intent dan data terstruktur.
10. Backend menjalankan action sesuai intent.
11. Backend menyimpan action log.
12. Backend mengembalikan reply ke OpenClaw.
13. OpenClaw mengirim balasan ke customer.
```

Intent yang harus didukung:

```txt
ASK_PRODUCT
ASK_PRICE
ASK_STOCK
CREATE_ORDER
CHECK_ORDER_STATUS
ASK_PAYMENT_METHOD
ASK_DELIVERY
TALK_TO_ADMIN
UNKNOWN
```

### Contoh logic intent

#### ASK_PRODUCT

Customer:

```txt
ada menu apa aja?
```

Bot:

```txt
Halo kak, ini produk yang tersedia di Warung Seblak Ibu Ani:
1. Seblak Original - Rp10.000
2. Seblak Seafood - Rp15.000
3. Es Teh - Rp4.000

Ketik nama produk atau jumlah yang ingin dipesan ya kak.
```

#### CREATE_ORDER

Customer:

```txt
mau seblak original 2 sama es teh 1
```

Backend:

- Cocokkan nama produk dari AI dengan database.
- Validasi stok.
- Hitung subtotal.
- Buat customer jika belum ada.
- Buat order source `WHATSAPP`.
- Buat order_items.
- Buat payment status `PENDING`.
- Reply instruksi pembayaran.

Bot:

```txt
Siap kak, pesanan berhasil dibuat.
Kode order: SP-20260604-001

Detail:
- Seblak Original x2 = Rp20.000
- Es Teh x1 = Rp4.000
Total: Rp24.000

Silakan transfer/QRIS ke rekening toko, lalu kirim bukti pembayaran di sini.
```

#### CHECK_ORDER_STATUS

Customer:

```txt
cek pesanan SP-20260604-001
```

Bot:

```txt
Status pesanan SP-20260604-001 saat ini: PACKING.
Pesanan sedang dikemas dan akan segera dikirim.
```

## 9.2 Workflow Customer via Website

```txt
1. Customer membuka katalog UMKM.
2. Customer memilih produk.
3. Customer menambahkan produk ke cart.
4. Customer checkout.
5. Sistem membuat order status PENDING_PAYMENT.
6. Customer upload bukti bayar.
7. Admin verifikasi bukti bayar.
8. Jika valid, order menjadi PAID lalu PROCESSING.
9. Admin menyiapkan pesanan.
10. Admin ubah status menjadi PACKING.
11. Admin input kurir dan resi.
12. Order menjadi SHIPPED.
13. Setelah diterima, admin/customer ubah menjadi COMPLETED.
14. Customer memberi review.
```

## 9.3 Workflow Admin UMKM

```txt
1. Admin register/login.
2. Admin membuat profil bisnis.
3. Admin mengisi produk dan stok.
4. Admin mengatur instruksi pembayaran.
5. Admin melihat order masuk.
6. Admin memverifikasi pembayaran.
7. Admin mengubah status order.
8. Admin input resi.
9. Admin melihat analytics dan review.
```

## 9.4 Workflow OpenClaw Hosting

```txt
1. Deploy OpenClaw di server persistent.
2. Set environment variable.
3. Mount persistent volume untuk session WhatsApp.
4. Jalankan OpenClaw.
5. Scan QR menggunakan nomor WhatsApp khusus siPandu.
6. Test kirim pesan dari nomor allowlist.
7. Pastikan pesan masuk ke endpoint Next.js.
8. Pastikan reply dari Next.js terkirim kembali ke WhatsApp.
```

Jangan lupa:

- Simpan session WhatsApp di volume persistent.
- Jangan simpan session di temporary filesystem.
- Jangan expose service OpenClaw tanpa secret.
- Untuk demo awal, gunakan allowlist nomor tester.

---

## 10. Struktur Folder Project

```txt
sipandu/
├─ app/
│  ├─ (public)/
│  │  ├─ page.tsx
│  │  ├─ katalog/[businessSlug]/page.tsx
│  │  ├─ order/[orderCode]/page.tsx
│  │  ├─ order/[orderCode]/payment/page.tsx
│  │  └─ order/[orderCode]/review/page.tsx
│  ├─ (auth)/
│  │  ├─ login/page.tsx
│  │  └─ register/page.tsx
│  ├─ dashboard/
│  │  ├─ page.tsx
│  │  ├─ products/page.tsx
│  │  ├─ products/new/page.tsx
│  │  ├─ products/[id]/edit/page.tsx
│  │  ├─ inventory/page.tsx
│  │  ├─ orders/page.tsx
│  │  ├─ orders/[id]/page.tsx
│  │  ├─ customers/page.tsx
│  │  ├─ payments/page.tsx
│  │  ├─ shipments/page.tsx
│  │  ├─ reviews/page.tsx
│  │  ├─ vouchers/page.tsx
│  │  ├─ analytics/page.tsx
│  │  └─ settings/page.tsx
│  └─ api/
│     ├─ products/route.ts
│     ├─ orders/route.ts
│     ├─ inventory/movements/route.ts
│     ├─ analytics/summary/route.ts
│     └─ webhooks/openclaw/route.ts
├─ components/
│  ├─ ui/
│  ├─ dashboard/
│  ├─ products/
│  ├─ orders/
│  └─ charts/
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts
│  │  ├─ server.ts
│  │  └─ admin.ts
│  ├─ ai/
│  │  ├─ gemini.ts
│  │  ├─ prompts.ts
│  │  └─ intent.ts
│  ├─ orders/
│  │  ├─ calculate-total.ts
│  │  ├─ generate-code.ts
│  │  └─ status.ts
│  ├─ whatsapp/
│  │  └─ reply-builder.ts
│  ├─ validations/
│  └─ utils.ts
├─ supabase/
│  ├─ migrations/
│  └─ seed.sql
├─ openclaw-bot/
│  ├─ README.md
│  ├─ config.example.ts
│  └─ docker-compose.example.yml
├─ .env.example
├─ package.json
└─ README.md
```

---

## 11. Environment Variables

Buat `.env.example` seperti ini:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=siPandu

# Supabase public client
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase server only
SUPABASE_SERVICE_ROLE_KEY=

# AI
GEMINI_API_KEY=
AI_PROVIDER=gemini

# Webhook
OPENCLAW_WEBHOOK_SECRET=

# Storage bucket names
SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
SUPABASE_PAYMENT_PROOFS_BUCKET=payment-proofs

# Optional
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=
```

Aturan keamanan:

- Jangan commit `.env.local`.
- Jangan expose `SUPABASE_SERVICE_ROLE_KEY` ke frontend.
- Semua route yang memakai service role harus server-only.
- Jangan hardcode API key dari chat atau screenshot.

---

## 12. Prompt AI untuk Intent Detection

Simpan di `lib/ai/prompts.ts`.

```txt
Kamu adalah AI parser untuk chatbot UMKM siPandu.
Tugasmu adalah membaca pesan customer dan mengubahnya menjadi JSON valid.
Jangan jawab dengan markdown.
Jangan tambahkan teks di luar JSON.

Daftar intent:
- ASK_PRODUCT
- ASK_PRICE
- ASK_STOCK
- CREATE_ORDER
- CHECK_ORDER_STATUS
- ASK_PAYMENT_METHOD
- ASK_DELIVERY
- TALK_TO_ADMIN
- UNKNOWN

Format output:
{
  "intent": "CREATE_ORDER",
  "customer_name": null,
  "order_code": null,
  "items": [
    {
      "product_name": "",
      "variant_name": null,
      "quantity": 1,
      "notes": null
    }
  ],
  "question": null,
  "confidence": 0.0
}

Rules:
- Jika customer menyebut ingin membeli/memesan/order, gunakan CREATE_ORDER.
- Jika customer hanya bertanya daftar produk/menu, gunakan ASK_PRODUCT.
- Jika customer bertanya harga, gunakan ASK_PRICE.
- Jika customer bertanya stok/ketersediaan, gunakan ASK_STOCK.
- Jika customer menyebut kode order, gunakan CHECK_ORDER_STATUS.
- Jika tidak yakin, gunakan UNKNOWN dan confidence rendah.
```

---

## 13. Detail Implementasi Order

### 13.1 Generate Order Code

Format:

```txt
SP-YYYYMMDD-XXX
```

Contoh:

```txt
SP-20260604-001
```

Logic:

- Ambil tanggal hari ini.
- Hitung jumlah order business pada hari itu.
- Tambahkan sequence 3 digit.

### 13.2 Kalkulasi Total

```txt
subtotal = sum(order_items.total)
discount_total = voucher discount jika ada
shipping_cost = manual input atau default 0
grand_total = subtotal - discount_total + shipping_cost
```

### 13.3 Stok

Untuk MVP:

- Saat order dibuat: stok belum dikurangi.
- Saat payment diverifikasi/PAID: stok dikurangi.
- Jika order cancelled setelah stok dikurangi: stok dikembalikan.

---

## 14. UI Pages Detail

### 14.1 Landing Page `/`

Isi:

- Hero siPandu.
- Masalah UMKM: slow response, pencatatan manual, order berantakan.
- Solusi: WhatsApp chatbot AI + dashboard order.
- Fitur utama.
- Flow cara kerja.
- CTA daftar UMKM.

### 14.2 Dashboard Home `/dashboard`

Cards:

- Total sales bulan ini.
- Total order.
- Pending payment.
- Processing order.
- Low stock products.
- Review average.

Chart:

- Sales 7/30 hari terakhir.

### 14.3 Products Page

Table columns:

- Foto.
- Nama produk.
- SKU.
- Kategori.
- Harga.
- Stok total.
- Status.
- Action.

### 14.4 Orders Page

Table columns:

- Order code.
- Customer.
- Source.
- Status.
- Payment.
- Total.
- Created at.
- Action.

Filter:

- Status.
- Source.
- Tanggal.
- Search order code/customer.

### 14.5 Order Detail

Isi:

- Info customer.
- Item pesanan.
- Status timeline.
- Payment proof.
- Tombol verifikasi payment.
- Tombol ubah status.
- Form kurir/resi.
- Catatan admin.

---

## 15. Deployment Plan

### 15.1 Deploy Supabase

Langkah:

```txt
1. Buat project Supabase.
2. Jalankan semua migration SQL.
3. Aktifkan RLS.
4. Buat bucket product-images.
5. Buat bucket payment-proofs.
6. Set policy storage sesuai kebutuhan.
7. Copy Supabase URL, anon key, service role key ke environment hosting.
```

### 15.2 Deploy Next.js

Langkah:

```txt
1. Push repo ke GitHub.
2. Connect ke Vercel/Cloudflare.
3. Set environment variables.
4. Deploy.
5. Test login/register.
6. Test CRUD produk.
7. Test order web.
8. Test upload bukti bayar.
```

### 15.3 Deploy OpenClaw

Langkah general:

```txt
1. Buat service baru di Railway/Render/VPS.
2. Install dependency OpenClaw sesuai dokumentasi versi yang dipakai.
3. Set OPENCLAW_WEBHOOK_SECRET sama dengan env di Next.js.
4. Set endpoint webhook ke https://domain-kamu.com/api/webhooks/openclaw.
5. Mount persistent volume untuk session WhatsApp.
6. Jalankan service.
7. Scan QR WhatsApp dengan nomor khusus bot siPandu.
8. Kirim pesan test dari nomor allowlist.
9. Pastikan bot membalas.
```

### 15.4 Domain

Rekomendasi:

```txt
https://sipandu.id                  -> landing page
https://app.sipandu.id              -> dashboard
https://bot.sipandu.id              -> OpenClaw service jika diperlukan
```

Untuk demo, cukup:

```txt
https://sipandu.vercel.app
```

---

## 16. Milestone Pengerjaan

### Phase 0 — Setup Project

Checklist:

- Init Next.js TypeScript.
- Install Tailwind dan shadcn/ui.
- Setup Supabase client.
- Setup `.env.example`.
- Setup basic layout.
- Setup GitHub repo.

Output:

- Project bisa run lokal.
- Landing page basic tampil.

### Phase 1 — Database & Auth

Checklist:

- Buat migration schema utama.
- Buat table profiles, businesses, business_members.
- Setup Supabase Auth.
- Buat login/register.
- Setelah register, user bisa membuat business profile.
- Setup RLS awal.

Output:

- User bisa login dan masuk dashboard.
- User hanya melihat data business miliknya.

### Phase 2 — Product & Inventory

Checklist:

- CRUD category.
- CRUD product.
- CRUD variant.
- Upload image.
- Inventory movement.
- Low stock warning.

Output:

- Admin UMKM bisa input produk dan stok.

### Phase 3 — Order Management

Checklist:

- Create order dari dashboard/admin.
- Create order dari katalog web.
- Order item.
- Generate order code.
- Update status order.
- Order status log.
- Payment record.

Output:

- Order bisa dibuat dan status bisa berpindah.

### Phase 4 — Payment & Shipping

Checklist:

- Upload bukti pembayaran.
- Admin verify/reject payment.
- Auto ubah order menjadi PAID/PROCESSING jika valid.
- Input shipment courier/resi.
- Update SHIPPED/COMPLETED.

Output:

- Alur order dari pending sampai completed berjalan.

### Phase 5 — Customer, Review, Analytics

Checklist:

- Customer table.
- Customer detail dan order history.
- Review form.
- Dashboard analytics summary.
- Sales chart.
- Top products.

Output:

- Dashboard sales management siap demo.

### Phase 6 — AI & WhatsApp Webhook

Checklist:

- Buat `/api/webhooks/openclaw`.
- Validasi secret.
- Simpan conversation dan messages.
- Integrasi Gemini intent detection.
- Action untuk ASK_PRODUCT.
- Action untuk ASK_PRICE.
- Action untuk CREATE_ORDER.
- Action untuk CHECK_ORDER_STATUS.
- Reply builder.

Output:

- Chat WhatsApp bisa membuat order dan mengecek status.

### Phase 7 — OpenClaw Hosting

Checklist:

- Buat folder `openclaw-bot`.
- Buat config example.
- Deploy ke Railway/Render/VPS.
- Mount persistent volume.
- Scan QR.
- Test webhook.

Output:

- Bot WhatsApp aktif di hosting.

### Phase 8 — Final Polish

Checklist:

- Loading state.
- Empty state.
- Toast notification.
- Error handling.
- Responsive layout.
- README lengkap.
- Screenshot demo.
- Seed data UMKM dummy.

Output:

- Siap presentasi ke dosen.

---

## 17. Testing Checklist

### Auth

- [ ] Register berhasil.
- [ ] Login berhasil.
- [ ] Logout berhasil.
- [ ] User tidak bisa akses dashboard sebelum login.
- [ ] User tidak bisa melihat data business lain.

### Product

- [ ] Tambah produk berhasil.
- [ ] Edit produk berhasil.
- [ ] Hapus/nonaktifkan produk berhasil.
- [ ] Upload foto berhasil.
- [ ] Stok tampil benar.

### Order

- [ ] Order web berhasil dibuat.
- [ ] Order WhatsApp berhasil dibuat.
- [ ] Order code unik.
- [ ] Total order benar.
- [ ] Status order bisa diubah.
- [ ] Status log tercatat.

### Payment

- [ ] Upload bukti bayar berhasil.
- [ ] Admin bisa approve.
- [ ] Admin bisa reject.
- [ ] Jika approve, payment menjadi PAID.
- [ ] Jika approve, stok berkurang.

### Shipping

- [ ] Admin bisa input kurir.
- [ ] Admin bisa input resi.
- [ ] Customer bisa cek status.

### WhatsApp/OpenClaw

- [ ] Pesan masuk ke webhook.
- [ ] Secret tervalidasi.
- [ ] Pesan tersimpan ke database.
- [ ] AI membaca intent dengan benar.
- [ ] Bot membalas daftar produk.
- [ ] Bot membuat order.
- [ ] Bot cek status order.
- [ ] Session WhatsApp tidak hilang setelah restart/redeploy.

### Analytics

- [ ] Total sales benar.
- [ ] Total order benar.
- [ ] Produk terlaris benar.
- [ ] Grafik tidak error saat data kosong.

---

## 18. Acceptance Criteria

Proyek dianggap selesai untuk MVP jika:

1. User bisa register dan membuat profil UMKM.
2. Admin UMKM bisa mengelola produk dan stok.
3. Customer bisa membuat order via website.
4. Customer bisa membuat order via WhatsApp chatbot.
5. Admin bisa memverifikasi pembayaran manual.
6. Admin bisa mengubah status order sampai completed.
7. Customer bisa cek status order.
8. Customer bisa memberi review.
9. Dashboard menampilkan analytics sederhana.
10. Sistem sudah bisa di-hosting.
11. OpenClaw berjalan di hosting dengan persistent session.
12. README berisi cara install, env, migration, dan deploy.

---

## 19. Instruksi untuk Coding Agent / Codex

Kerjakan proyek ini sebagai MVP production-like, bukan hanya mockup statis.

Prioritas pengerjaan:

1. Buat struktur Next.js + TypeScript + Tailwind + shadcn/ui.
2. Buat Supabase schema dan migration SQL.
3. Implement auth dan multi-tenant business.
4. Implement CRUD produk/stok.
5. Implement order workflow lengkap.
6. Implement payment manual dan shipping manual.
7. Implement dashboard analytics.
8. Implement webhook OpenClaw + AI intent detection.
9. Buat README dan `.env.example`.
10. Pastikan bisa deploy ke Vercel dan OpenClaw bisa deploy terpisah.

Aturan coding:

- Gunakan TypeScript ketat.
- Pakai Zod untuk validasi input API/form.
- Pisahkan logic bisnis ke folder `lib`.
- Jangan hardcode secret.
- Jangan expose service role key ke client.
- Buat error handling yang jelas.
- Buat UI sederhana tapi rapi.
- Buat komponen reusable.
- Buat seed data untuk demo.
- Jangan menambahkan fitur besar di luar scope sebelum MVP selesai.

Urutan implementasi paling aman:

```txt
1. Database schema
2. Auth
3. Business profile
4. Product
5. Inventory
6. Customer
7. Order
8. Payment
9. Shipping
10. Review
11. Analytics
12. AI parser
13. OpenClaw webhook
14. Deployment docs
```

---

## 20. Contoh Demo Script untuk Presentasi

### Demo 1 — Admin UMKM

```txt
1. Login sebagai pemilik UMKM.
2. Buka dashboard.
3. Tambah produk baru.
4. Tambah stok.
5. Lihat produk muncul di katalog.
```

### Demo 2 — Customer Website

```txt
1. Buka katalog UMKM.
2. Pilih produk.
3. Checkout.
4. Upload bukti pembayaran.
5. Admin approve.
6. Admin ubah status sampai shipping.
7. Customer cek tracking.
8. Customer beri review.
```

### Demo 3 — Customer WhatsApp

```txt
1. Customer chat: "ada menu apa aja?"
2. Bot membalas daftar produk.
3. Customer chat: "mau seblak original 2 sama es teh 1"
4. Bot membuat order dan mengirim kode order.
5. Admin melihat order masuk di dashboard.
6. Customer chat: "cek pesanan SP-20260604-001"
7. Bot membalas status order.
```

---

## 21. Risiko dan Solusi

### Risiko 1 — OpenClaw QR/session hilang setelah deploy

Solusi:

- Gunakan persistent volume.
- Jangan pakai serverless untuk OpenClaw.
- Simpan folder session di path yang tidak terhapus saat restart.

### Risiko 2 — WhatsApp membatasi akun/bot

Solusi:

- Gunakan nomor khusus bot.
- Jangan spam.
- Untuk demo gunakan allowlist.
- Siapkan opsi migrasi ke WhatsApp Cloud API.

### Risiko 3 — AI salah membaca order

Solusi:

- Gunakan confidence score.
- Jika confidence rendah, bot minta konfirmasi.
- Sebelum create order, bot dapat mengirim ringkasan dan meminta customer mengetik "YA".

Contoh:

```txt
Kak, konfirmasi pesanan:
- Seblak Original x2
- Es Teh x1
Total Rp24.000

Ketik YA untuk lanjut atau BATAL untuk membatalkan.
```

### Risiko 4 — Stok tidak sinkron

Solusi:

- Kurangi stok hanya saat payment verified.
- Catat semua perubahan stok di inventory_movements.
- Gunakan transaction/RPC Supabase untuk proses penting.

### Risiko 5 — Data UMKM tercampur

Solusi:

- Semua tabel utama wajib punya `business_id`.
- Aktifkan RLS.
- Query selalu filter berdasarkan `business_id`.

---

## 22. Final Output yang Harus Ada di Repository

```txt
- Source code Next.js lengkap.
- Supabase migrations.
- Seed data demo.
- .env.example.
- README.md.
- openclaw-bot/README.md.
- Dokumentasi deploy.
- Screenshot atau panduan demo.
```

---

## 23. Catatan Penting

Untuk MVP siPandu, jangan mengejar semua fitur enterprise sekaligus. Fokus ke fitur yang paling sesuai dengan kebutuhan proposal:

- WhatsApp chatbot.
- Auto-reply AI.
- Pencatatan pesanan otomatis.
- Database order.
- Dashboard UMKM.
- Analisis penjualan sederhana.

Jika fitur inti ini sudah stabil, baru lanjutkan ke payment gateway, ongkir otomatis, aplikasi mobile, dan marketplace multi-UMKM.
