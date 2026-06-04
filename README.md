# siPandu

siPandu adalah MVP platform chatbot WhatsApp dan dashboard sales management untuk UMKM lokal. Fokus awalnya adalah auto-reply WhatsApp, pencatatan order otomatis, produk dan stok, payment manual, shipping manual, review, analytics sederhana, dan dokumentasi deploy.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Supabase PostgreSQL, Auth, Storage, RLS
- Zod, React Hook Form
- Recharts
- Gemini API untuk intent detection
- OpenClaw sebagai WhatsApp gateway terpisah

## Jalankan Lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Jika Supabase belum dikonfigurasi, aplikasi berjalan dalam mode demo dengan data dummy supaya UI bisa langsung dicek.

Halaman penting:

- Landing page: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Dashboard: `http://localhost:3000/dashboard`
- Katalog demo: `http://localhost:3000/katalog/warung-seblak-ibu-ani`
- Order demo: `http://localhost:3000/order/SP-20260604-001`

## Environment

Isi `.env.local` dari `.env.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
OPENCLAW_WEBHOOK_SECRET=
NEXT_PUBLIC_SUPABASE_QRIS_IMAGES_BUCKET=qris-images
```

Jangan commit `.env.local`. `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai di server route untuk webhook dan katalog publik.

## Database

Jalankan migration:

```bash
supabase db push
```

Seed demo:

```bash
supabase db execute --file supabase/seed.sql
```

Migration utama ada di:

```txt
supabase/migrations/20260604000000_initial_schema.sql
```

Schema sudah mencakup `profiles`, `businesses`, `business_members`, `products`, `product_variants`, `inventory_movements`, `customers`, `orders`, `order_items`, `payments`, `shipments`, `reviews`, `vouchers`, `conversations`, `messages`, dan `ai_action_logs`.

## API Utama

- `POST /api/businesses`
- `GET /api/businesses/current`
- `GET|POST /api/products`
- `GET|PATCH|DELETE /api/products/[id]`
- `GET /api/inventory`
- `GET|POST /api/inventory/movements`
- `GET|POST /api/orders`
- `GET /api/orders/[id]`
- `PATCH /api/orders/[id]/status`
- `GET /api/orders/code/[orderCode]`
- `POST /api/orders/[id]/payment-proof`
- `PATCH /api/payments/[id]/verify`
- `PATCH /api/payments/[id]/reject`
- `POST /api/orders/[id]/shipment`
- `PATCH /api/shipments/[id]`
- `POST /api/orders/[orderCode]/review`
- `GET /api/analytics/summary`
- `POST /api/webhooks/openclaw`

## QRIS WhatsApp

Penjual bisa upload QRIS statis di `Dashboard > Settings`. URL QRIS disimpan di profil bisnis dan akan ikut dikirim pada reply order WhatsApp setelah webhook membuat order.

Response webhook juga menyertakan metadata `media`:

```json
{
  "reply": "Siap kak, pesanan berhasil dibuat...",
  "media": [
    {
      "type": "image",
      "url": "https://.../storage/v1/object/public/qris-images/...",
      "caption": "QRIS pembayaran untuk SP-20260604-001"
    }
  ]
}
```

Adapter di folder `openclaw-bot` sudah membaca field `media[0].url` dan mengirim gambar QRIS ke WhatsApp setelah order dibuat. Jika gateway lain belum mendukung media, link QRIS tetap ada di teks reply.

## OpenClaw Webhook

Header wajib:

```txt
x-openclaw-secret: <OPENCLAW_WEBHOOK_SECRET>
```

Env adapter WhatsApp:

```env
NEXT_WEBHOOK_URL=http://localhost:3000/api/webhooks/openclaw
OPENCLAW_WEBHOOK_SECRET=<OPENCLAW_WEBHOOK_SECRET>
OPENCLAW_SESSION_PATH=./session
OPENCLAW_ALLOWLIST=
OPENCLAW_BOT_API_URL=http://localhost:3020
OPENCLAW_BOT_API_PORT=3020
OPENCLAW_BOT_API_SECRET=<OPENCLAW_WEBHOOK_SECRET>
```

Body:

```json
{
  "businessSlug": "warung-seblak-ibu-ani",
  "from": "+6281234567890",
  "message": "mau seblak original 2",
  "timestamp": "2026-06-04T10:00:00.000Z",
  "raw": {}
}
```

Response:

```json
{
  "reply": "Siap kak, pesanan berhasil dibuat..."
}
```

Jalankan adapter lokal:

```bash
cd openclaw-bot
npm install
npm start
```

Setelah service bot aktif, seller membuka `Dashboard > WhatsApp`, klik `Hubungkan`, lalu scan QR langsung dari app. Slug bisnis otomatis dipakai dari profil toko. Seller juga bisa mengisi custom prompt AI di halaman yang sama; jika kosong, sistem memakai prompt default.

## Demo Script

1. Login atau buka dashboard demo.
2. Tambah produk di `Dashboard > Produk`.
3. Cek stok di `Inventory`.
4. Buka katalog demo dan checkout.
5. Verifikasi payment dari detail order.
6. Input kurir dan resi.
7. Cek tracking customer.
8. Kirim review.
9. Test webhook OpenClaw dengan secret.

## Deploy

Panduan detail ada di [docs/deployment.md](/home/akiru/Documents/SiPandu/docs/deployment.md).
