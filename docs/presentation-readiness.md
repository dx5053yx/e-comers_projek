# Checklist Presentasi dan Deploy siPandu

Dokumen ini fokus untuk kebutuhan presentasi tugas akhir dan deploy Vercel.

## Prioritas Perbaikan

### Wajib Beres

1. Landing page rapi dan menjelaskan siPandu.
2. Halaman direktori UMKM publik tersedia di `/umkm`.
3. Login, register, dashboard, katalog, order, payment, dan WhatsApp page bisa dibuka.
4. Data demo/presentasi memakai nama bisnis, produk, dan nomor WhatsApp yang layak tampil.
5. Supabase migration dan storage bucket sudah siap.
6. Environment Vercel lengkap.
7. `npm run lint` dan `npm run build` lolos.

### Penting untuk Demo

1. Siapkan satu akun owner.
2. Siapkan satu UMKM contoh dengan data profesional.
3. Tambahkan minimal 3 produk aktif dengan stok.
4. Upload QRIS toko.
5. Isi prompt AI custom singkat jika ingin gaya balasan tertentu.
6. Hubungkan WhatsApp lewat `Dashboard > WhatsApp`.
7. Uji chat: tanya menu, tanya stok, buat order, dan cek QRIS pembayaran.

### Nice to Have

1. Screenshot alur untuk slide.
2. Video pendek scan QR dan chat masuk.
3. Halaman simulasi langganan dipakai untuk menjelaskan model bisnis.
4. Direktori UMKM dipakai untuk menjelaskan manfaat bagi konsumen.

## Env Vercel

Set di Vercel Project Settings > Environment Variables:

```env
NEXT_PUBLIC_APP_URL=https://domain-vercel-kamu.vercel.app
NEXT_PUBLIC_APP_NAME=siPandu

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
AI_PROVIDER=gemini
GEMINI_INTENT_MODEL=gemini-2.5-flash-lite
GEMINI_REPLY_MODEL=gemini-2.5-flash-lite

OPENCLAW_WEBHOOK_SECRET=
NEXT_WEBHOOK_URL=https://domain-vercel-kamu.vercel.app/api/webhooks/openclaw
OPENCLAW_BOT_API_URL=https://domain-bot-kamu
OPENCLAW_BOT_API_SECRET=

NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
NEXT_PUBLIC_SUPABASE_QRIS_IMAGES_BUCKET=qris-images
SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
SUPABASE_QRIS_IMAGES_BUCKET=qris-images
SUPABASE_PAYMENT_PROOFS_BUCKET=payment-proofs

GUEST_ACCOUNT_EMAIL=
GUEST_ACCOUNT_PASSWORD=
GUEST_BUSINESS_SLUG=
```

`OPENCLAW_BOT_API_URL` tidak boleh `localhost` saat di Vercel. Bot WhatsApp harus jalan di server persistent seperti Railway, Render, VPS, atau komputer lokal dengan tunnel untuk demo.

Untuk akun presentasi hanya-baca, jalankan migration
`20260615090000_add_guest_viewer_access.sql`, isi tiga env `GUEST_*`, lalu
redeploy. Pengunjung dapat masuk dari tombol **Lihat dashboard sebagai tamu**.

## Urutan Deploy

1. Push project ke GitHub.
2. Import repository ke Vercel.
3. Isi environment variables.
4. Deploy Next.js di Vercel.
5. Jalankan migration Supabase.
6. Deploy atau jalankan service `openclaw-bot`.
7. Update `OPENCLAW_BOT_API_URL` di Vercel jika bot sudah punya URL publik.
8. Test halaman publik:
   - `/`
   - `/umkm`
   - `/katalog/[slug]`
9. Test dashboard:
   - `/dashboard`
   - `/dashboard/products`
   - `/dashboard/settings`
   - `/dashboard/whatsapp`
10. Test webhook:

```bash
curl -X POST "https://domain-vercel-kamu.vercel.app/api/webhooks/openclaw" \
  -H "Content-Type: application/json" \
  -H "x-openclaw-secret: <secret>" \
  -d '{
    "businessSlug": "<slug-bisnis>",
    "from": "+6281234567890",
    "message": "ada menu apa aja?",
    "raw": {}
  }'
```

## Catatan Presentasi

Narasi demo yang paling kuat:

1. Masalah UMKM: chat lambat, order manual, stok tidak rapi.
2. Solusi siPandu: WhatsApp AI + dashboard.
3. Demo pengunjung: buka `/umkm`, pilih toko, buka katalog.
4. Demo seller: login dashboard, tambah produk, upload QRIS.
5. Demo WhatsApp: scan QR, customer chat, order tercatat.
6. Demo laporan: analytics dan daftar order.

## Checklist Hari-H

1. Pastikan domain Vercel bisa membuka `/`, `/umkm`, `/login`, dan `/dashboard`.
2. Pastikan data demo memakai nama toko, produk, alamat, dan nomor WhatsApp yang layak tampil.
3. Pastikan `OPENCLAW_BOT_API_URL` di Vercel bukan `localhost`.
4. Jika memakai tunnel lokal, nyalakan tunnel sebelum membuka dashboard WhatsApp.
5. Pastikan satu nomor WhatsApp sudah tersambung dan QR tidak perlu discan ulang saat presentasi.
6. Siapkan satu skenario chat pendek: tanya menu, tanya stok, pesan 1 produk, lalu tampilkan QRIS/order.
7. Siapkan fallback screenshot/video kalau jaringan atau limit AI bermasalah.

## Risiko yang Perlu Dijelaskan Singkat

1. WhatsApp bot tidak cocok di Vercel serverless, jadi dipisah sebagai service persistent.
2. AI bisa terkena limit API, jadi sistem punya fallback aman.
3. Data customer harus dijaga, karena itu service role hanya dipakai di server.
4. Untuk produksi skala besar, opsi WhatsApp Cloud API resmi bisa dipertimbangkan.
