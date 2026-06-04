# Deployment siPandu

## 1. Supabase

1. Buat project Supabase.
2. Set project password dan region.
3. Jalankan migration di `supabase/migrations`.
4. Jalankan `supabase/seed.sql` jika butuh data demo.
5. Pastikan bucket `product-images` dan `payment-proofs` dibuat oleh migration.
6. Copy `Project URL`, `anon key`, dan `service role key` ke hosting.

## 2. Next.js

1. Push repository ke GitHub.
2. Connect repository ke Vercel.
3. Set environment variables dari `.env.example`.
4. Deploy.
5. Pastikan `NEXT_PUBLIC_APP_URL` dan `NEXT_WEBHOOK_URL` memakai domain Vercel, bukan localhost.
6. Test `/`, `/umkm`, `/login`, `/register`, `/dashboard`, `/katalog/<slug>`, dan `/api/webhooks/openclaw`.

## 3. OpenClaw

OpenClaw jangan di-host di Vercel serverless. Gunakan Railway, Render, VPS, atau server Docker yang punya persistent volume.

Checklist:

1. Deploy service OpenClaw/WhatsApp bot API.
2. Set `NEXT_WEBHOOK_URL=https://domain-kamu.com/api/webhooks/openclaw`.
3. Set `OPENCLAW_WEBHOOK_SECRET` sama dengan env Next.js.
4. Set `OPENCLAW_BOT_API_URL` di Next.js ke URL service bot. Jangan pakai localhost untuk Vercel.
5. Set `OPENCLAW_BOT_API_SECRET` sama di Next.js dan service bot.
6. Mount volume untuk session WhatsApp, contoh `/data/openclaw-session`.
7. Seller scan QR dari `Dashboard > WhatsApp`.
8. Test pesan customer.
9. Pastikan pesan tersimpan di `conversations`, `messages`, dan action masuk ke `ai_action_logs`.

### Mode Demo Cepat untuk Presentasi

Kalau belum sempat deploy bot ke Railway/Render/VPS, pakai mode ini:

1. Deploy Next.js ke Vercel.
2. Jalankan bot di laptop:

```bash
cd openclaw-bot
npm start
```

3. Buka tunnel publik ke port bot, misalnya `cloudflared tunnel --url http://localhost:3020` atau `ngrok http 3020`.
4. Set `OPENCLAW_BOT_API_URL` di Vercel ke URL tunnel tersebut.
5. Set `NEXT_WEBHOOK_URL` di environment bot ke URL Vercel:

```env
NEXT_WEBHOOK_URL=https://domain-vercel-kamu.vercel.app/api/webhooks/openclaw
```

6. Restart bot setelah env berubah.
7. Login dashboard Vercel, buka `Dashboard > WhatsApp`, lalu scan QR.

Catatan: URL tunnel bisa berubah saat tunnel dimatikan, jadi update lagi `OPENCLAW_BOT_API_URL` di Vercel sebelum demo.

## 4. Smoke Test

- Register owner dan business profile.
- Tambah produk dan stok.
- Buat order dari katalog.
- Upload bukti pembayaran.
- Verifikasi payment.
- Pastikan stok berkurang.
- Input resi.
- Cek tracking customer.
- Kirim review.
- Kirim webhook WhatsApp test:

```bash
curl -X POST "$NEXT_PUBLIC_APP_URL/api/webhooks/openclaw" \
  -H "Content-Type: application/json" \
  -H "x-openclaw-secret: $OPENCLAW_WEBHOOK_SECRET" \
  -d '{
    "businessSlug": "warung-seblak-ibu-ani",
    "from": "+6281234567890",
    "message": "ada menu apa aja?",
    "raw": {}
  }'
```
