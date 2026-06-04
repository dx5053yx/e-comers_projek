# Setup siPandu untuk Demo Vercel + Bot Laptop

Dokumen ini dipakai untuk skenario:

- Web siPandu sudah deploy di Vercel.
- Supabase dan Gemini sudah terhubung.
- WhatsApp bot `openclaw-bot` jalan dari laptop.
- Jika laptop mati, bot ikut mati. Setelah laptop nyala lagi, bot dan tunnel perlu dijalankan ulang.

## 1. Environment Vercel

Buka Vercel:

`Project > Settings > Environment Variables`

Isi env berikut untuk web siPandu:

```env
NEXT_PUBLIC_APP_URL=https://domain-vercel-kamu.vercel.app
NEXT_PUBLIC_APP_NAME=siPandu

NEXT_PUBLIC_SUPABASE_URL=isi-dari-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi-dari-supabase
SUPABASE_SERVICE_ROLE_KEY=isi-dari-supabase

GEMINI_API_KEY=isi-api-key-gemini
AI_PROVIDER=gemini
GEMINI_INTENT_MODEL=gemini-2.5-flash-lite
GEMINI_REPLY_MODEL=gemini-2.5-flash-lite

OPENCLAW_WEBHOOK_SECRET=buat-secret-bebas-yang-kuat
NEXT_WEBHOOK_URL=https://domain-vercel-kamu.vercel.app/api/webhooks/openclaw
OPENCLAW_BOT_API_URL=https://domain-tunnel-bot-kamu
OPENCLAW_BOT_API_SECRET=sama-dengan-OPENCLAW_WEBHOOK_SECRET

NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
NEXT_PUBLIC_SUPABASE_QRIS_IMAGES_BUCKET=qris-images
SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
SUPABASE_QRIS_IMAGES_BUCKET=qris-images
SUPABASE_PAYMENT_PROOFS_BUCKET=payment-proofs
```

Setelah env diubah, klik redeploy di Vercel.

## 2. Environment Lokal untuk Bot

Di laptop, file `.env.local` minimal harus berisi:

```env
NEXT_WEBHOOK_URL=https://domain-vercel-kamu.vercel.app/api/webhooks/openclaw
OPENCLAW_WEBHOOK_SECRET=secret-yang-sama-dengan-vercel
OPENCLAW_BOT_API_SECRET=secret-yang-sama-dengan-vercel
OPENCLAW_BOT_API_PORT=3020
OPENCLAW_SESSION_PATH=./session
OPENCLAW_ALLOWLIST=
OPENCLAW_LOG_LEVEL=info
OPENCLAW_REPLY_GROUPS=false
```

Catatan:

- `NEXT_WEBHOOK_URL` harus domain Vercel, bukan `localhost`.
- `OPENCLAW_WEBHOOK_SECRET` di laptop harus sama dengan Vercel.
- `OPENCLAW_BOT_API_SECRET` di laptop harus sama dengan `OPENCLAW_BOT_API_SECRET` di Vercel.
- `OPENCLAW_ALLOWLIST` kosong berarti semua nomor bisa dilayani.

## 3. Jalankan Bot di Laptop

Buka terminal pertama:

```bash
cd /home/akiru/Documents/SiPandu/openclaw-bot
npm install
npm start
```

Pastikan muncul log seperti:

```txt
siPandu WhatsApp bot API ready
```

Test bot lokal:

```bash
curl http://localhost:3020/health
```

Output yang benar:

```json
{"ok":true,"sessions":0}
```

Jumlah `sessions` bisa berbeda, itu normal.

## 4. Buat Domain Bot Sementara

Buka terminal kedua:

```bash
cloudflared tunnel --url http://localhost:3020
```

Tunggu sampai muncul URL seperti:

```txt
https://contoh-domain.trycloudflare.com
```

Itu adalah domain bot sementara.

Test domain bot:

```bash
curl https://contoh-domain.trycloudflare.com/health
```

Jika output `{"ok":true,...}`, berarti domain bot berhasil.

## 4A. Alternatif: Pakai Ngrok Static Domain

Pakai bagian ini kalau kamu ingin URL bot lebih stabil daripada quick tunnel Cloudflare.

### 1. Login atau daftar ngrok

Buka:

```txt
https://dashboard.ngrok.com
```

Ambil authtoken dari dashboard ngrok, lalu set di laptop:

```bash
ngrok config add-authtoken TOKEN_KAMU_DARI_NGROK
```

Cek konfigurasi:

```bash
ngrok config check
```

### 2. Siapkan static domain

Di dashboard ngrok, cari menu domain/static domain. Klaim atau buat domain untuk bot.

Contoh domain:

```txt
https://sipandu-bot.ngrok-free.app
```

Nama domain bisa berbeda tergantung yang tersedia di akun ngrok kamu.

### 3. Jalankan bot

Terminal pertama:

```bash
cd /home/akiru/Documents/SiPandu/openclaw-bot
npm start
```

### 4. Jalankan tunnel ngrok

Terminal kedua:

```bash
ngrok http 3020 --url https://sipandu-bot.ngrok-free.app
```

Ganti `https://sipandu-bot.ngrok-free.app` dengan static domain milikmu.

Test:

```bash
curl https://sipandu-bot.ngrok-free.app/health
```

Output yang benar:

```json
{"ok":true,"sessions":0}
```

### 5. Update Vercel

Masuk Vercel:

`Project > Settings > Environment Variables`

Isi:

```env
OPENCLAW_BOT_API_URL=https://sipandu-bot.ngrok-free.app
OPENCLAW_BOT_API_SECRET=secret-yang-sama-dengan-bot
```

Lalu redeploy Vercel.

Dengan static domain ngrok, kamu tidak perlu ganti `OPENCLAW_BOT_API_URL` setiap kali tunnel dijalankan ulang, selama domain yang dipakai sama.

## 5. Update Vercel dengan Domain Bot

Masuk Vercel:

`Project > Settings > Environment Variables`

Ubah:

```env
OPENCLAW_BOT_API_URL=https://contoh-domain.trycloudflare.com
```

Jangan tambahkan `/health`.

Lalu redeploy Vercel.

## 6. Hubungkan WhatsApp dari Dashboard

Setelah Vercel selesai redeploy:

1. Buka web siPandu di Vercel.
2. Login sebagai owner UMKM.
3. Buka `Dashboard > WhatsApp`.
4. Klik `Hubungkan`.
5. QR akan muncul di dashboard.
6. Di WhatsApp nomor bisnis, buka `Linked devices`.
7. Pilih `Link a device`.
8. Scan QR dari dashboard.
9. Tunggu status menjadi connected.

Setelah tersambung, customer bisa chat nomor WhatsApp bisnis.

## 7. Kalau Laptop Mati

Jika laptop mati, bot dan tunnel mati. Saat laptop hidup lagi:

1. Jalankan bot:

```bash
cd /home/akiru/Documents/SiPandu/openclaw-bot
npm start
```

2. Jalankan tunnel baru.

Jika pakai Cloudflare quick tunnel:

```bash
cloudflared tunnel --url http://localhost:3020
```

Jika pakai ngrok static domain:

```bash
ngrok http 3020 --url https://sipandu-bot.ngrok-free.app
```

3. Kalau pakai Cloudflare quick tunnel, copy domain `trycloudflare.com` yang baru.
4. Kalau pakai ngrok static domain, domain biasanya tetap sama.
5. Update `OPENCLAW_BOT_API_URL` di Vercel jika domain berubah.
6. Redeploy Vercel jika env berubah.
7. Buka `Dashboard > WhatsApp`.
8. Jika session masih ada, biasanya tidak perlu scan ulang.
9. Jika status belum connected atau QR muncul lagi, scan ulang.

## 8. Hal yang Harus Tetap Nyala Saat Demo

Saat demo WhatsApp AI, pastikan:

- Terminal `npm start` di folder `openclaw-bot` tetap jalan.
- Terminal `cloudflared tunnel --url http://localhost:3020` tetap jalan.
- Laptop tidak sleep.
- Internet laptop stabil.
- Vercel sudah memakai domain tunnel terbaru.

## 9. Troubleshooting

### QR tidak muncul di dashboard

Cek:

```bash
curl https://domain-tunnel-kamu.trycloudflare.com/health
```

Kalau gagal, berarti tunnel atau bot mati.

### Dashboard bilang bot tidak bisa dihubungi

Cek env Vercel:

```env
OPENCLAW_BOT_API_URL=https://domain-tunnel-terbaru.trycloudflare.com
OPENCLAW_BOT_API_SECRET=secret-yang-sama
```

Lalu redeploy.

### Pesan WhatsApp masuk tapi tidak dibalas

Cek terminal bot. Jika ada error webhook, pastikan:

```env
NEXT_WEBHOOK_URL=https://domain-vercel-kamu.vercel.app/api/webhooks/openclaw
OPENCLAW_WEBHOOK_SECRET=secret-yang-sama-dengan-vercel
```

### Bot hanya membalas nomor tertentu

Pastikan allowlist kosong:

```env
OPENCLAW_ALLOWLIST=
```

### Sudah restart tapi WhatsApp minta scan ulang

Itu bisa terjadi kalau folder session hilang. Untuk lokal, session disimpan di:

```txt
/home/akiru/Documents/SiPandu/openclaw-bot/session
```

Jangan hapus folder itu kalau tidak ingin scan ulang.

## 10. Ringkasan Cepat

Setiap mulai demo:

```bash
cd /home/akiru/Documents/SiPandu/openclaw-bot
npm start
```

Di terminal lain:

```bash
cloudflared tunnel --url http://localhost:3020
```

Ambil URL `trycloudflare.com`, masukkan ke Vercel:

```env
OPENCLAW_BOT_API_URL=https://domain-baru.trycloudflare.com
```

Redeploy Vercel, lalu buka:

```txt
Dashboard > WhatsApp
```
