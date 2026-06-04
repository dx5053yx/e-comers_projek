# Private Setup siPandu

Dokumen ini khusus untuk setup siPandu di laptop Akiru dengan skenario:

- Web siPandu sudah deploy di Vercel.
- Database memakai Supabase.
- AI memakai Gemini.
- Bot WhatsApp `openclaw-bot` jalan dari laptop.
- Tunnel memakai ngrok static domain.
- Kalau laptop mati, bot ikut mati. Setelah laptop nyala, cukup jalankan bot dan ngrok lagi.

Secret tidak ditulis di dokumen ini. Ambil nilai secret dari `.env.local` atau Vercel Environment Variables.

## Data Setup Kamu

Project lokal:

```txt
/home/akiru/Documents/SiPandu
```

Folder bot:

```txt
/home/akiru/Documents/SiPandu/openclaw-bot
```

Port bot:

```txt
3020
```

Domain ngrok static bot:

```txt
https://trespass-vacant-guidable.ngrok-free.dev
```

Webhook siPandu:

```txt
https://DOMAIN-VERCEL-KAMU/api/webhooks/openclaw
```

Ganti `DOMAIN-VERCEL-KAMU` dengan domain Vercel siPandu yang sedang aktif.

## 1. Env Wajib di Vercel

Masuk Vercel:

```txt
Project siPandu > Settings > Environment Variables
```

Isi atau cek env berikut:

```env
NEXT_PUBLIC_APP_URL=https://DOMAIN-VERCEL-KAMU
NEXT_PUBLIC_APP_NAME=siPandu

NEXT_PUBLIC_SUPABASE_URL=ambil-dari-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=ambil-dari-supabase
SUPABASE_SERVICE_ROLE_KEY=ambil-dari-supabase

GEMINI_API_KEY=ambil-dari-google-ai-studio
AI_PROVIDER=gemini
GEMINI_INTENT_MODEL=gemini-2.5-flash-lite
GEMINI_REPLY_MODEL=gemini-2.5-flash-lite

OPENCLAW_WEBHOOK_SECRET=sama-dengan-env-lokal
NEXT_WEBHOOK_URL=https://DOMAIN-VERCEL-KAMU/api/webhooks/openclaw
OPENCLAW_BOT_API_URL=https://trespass-vacant-guidable.ngrok-free.dev
OPENCLAW_BOT_API_SECRET=sama-dengan-env-lokal

NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
NEXT_PUBLIC_SUPABASE_QRIS_IMAGES_BUCKET=qris-images
SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
SUPABASE_QRIS_IMAGES_BUCKET=qris-images
SUPABASE_PAYMENT_PROOFS_BUCKET=payment-proofs
```

Setelah env Vercel diubah, klik redeploy.

Env yang tidak perlu masuk Vercel web:

```env
OPENCLAW_SESSION_PATH
OPENCLAW_ALLOWLIST
OPENCLAW_BOT_API_PORT
OPENCLAW_BUSINESS_SLUG
ADMIN_SEED_EMAIL
ADMIN_SEED_PASSWORD
```

## 2. Env Lokal untuk Bot

File yang dipakai:

```txt
/home/akiru/Documents/SiPandu/.env.local
```

Pastikan minimal ada:

```env
NEXT_WEBHOOK_URL=https://DOMAIN-VERCEL-KAMU/api/webhooks/openclaw
OPENCLAW_WEBHOOK_SECRET=sama-dengan-vercel
OPENCLAW_BOT_API_SECRET=sama-dengan-vercel
OPENCLAW_BOT_API_PORT=3020
OPENCLAW_BOT_API_URL=https://trespass-vacant-guidable.ngrok-free.dev
OPENCLAW_SESSION_PATH=./session
OPENCLAW_ALLOWLIST=
OPENCLAW_LOG_LEVEL=info
OPENCLAW_REPLY_GROUPS=false
```

Catatan penting:

- `NEXT_WEBHOOK_URL` lokal harus domain Vercel, bukan `localhost`, kalau mau bot membalas lewat app yang sudah deploy.
- `OPENCLAW_BOT_API_URL` harus domain ngrok static.
- `OPENCLAW_WEBHOOK_SECRET` dan `OPENCLAW_BOT_API_SECRET` harus sama antara Vercel dan laptop.
- `OPENCLAW_ALLOWLIST=` kosong berarti semua nomor boleh dilayani.

## 3. Jalankan Bot WhatsApp

Buka terminal pertama:

```bash
cd /home/akiru/Documents/SiPandu/openclaw-bot
npm start
ngrok http 3020 --url https://trespass-vacant-guidable.ngrok-free.dev
```

Tanda bot berhasil hidup:

```txt
siPandu WhatsApp bot API ready
```

Test lokal:

```bash
curl http://localhost:3020/health
```

Output yang benar:

```json
{"ok":true,"sessions":0}
```

Kalau `sessions` bukan `0`, tidak apa-apa.

## 4. Jalankan Ngrok Static Domain

Buka terminal kedua:

```bash
ngrok http 3020 --url https://trespass-vacant-guidable.ngrok-free.dev
```

Biarkan terminal ini tetap hidup.

Test domain ngrok:

```bash
curl https://trespass-vacant-guidable.ngrok-free.dev/health
```

Output yang benar:

```json
{"ok":true,"sessions":0}
```

Kalau muncul halaman ngrok offline, berarti command ngrok belum jalan atau tunnel terputus.

## 5. Hubungkan WhatsApp dari Vercel

Setelah bot dan ngrok hidup:

1. Buka web siPandu yang sudah deploy di Vercel.
2. Login sebagai owner UMKM.
3. Buka `Dashboard > WhatsApp`.
4. Klik `Hubungkan`.
5. QR akan muncul.
6. Di WhatsApp nomor bisnis, buka `Linked devices`.
7. Pilih `Link a device`.
8. Scan QR.
9. Tunggu status connected.

Jika session lama masih ada, biasanya tidak perlu scan ulang.

## 6. Test Chat Customer

Pakai nomor WhatsApp lain sebagai customer.

Kirim contoh:

```txt
menu
```

atau:

```txt
ada produk apa aja?
```

atau:

```txt
saya mau pesan 1 produk
```

Bot harus membalas lewat WhatsApp dan data masuk ke dashboard:

```txt
Dashboard > Customer
Dashboard > Order
Dashboard > WhatsApp
```

## 7. Kalau Laptop Mati

Kalau laptop mati, bot dan tunnel mati. Setelah laptop hidup:

1. Jalankan bot lagi:

```bash
cd /home/akiru/Documents/SiPandu/openclaw-bot
npm start
```

2. Jalankan ngrok lagi:

```bash
ngrok http 3020 --url https://trespass-vacant-guidable.ngrok-free.dev
```

3. Test:

```bash
curl https://trespass-vacant-guidable.ngrok-free.dev/health
```

4. Buka `Dashboard > WhatsApp`.
5. Jika connected, langsung pakai.
6. Jika QR muncul lagi, scan ulang.

Karena memakai ngrok static domain, biasanya tidak perlu update `OPENCLAW_BOT_API_URL` di Vercel selama domainnya tetap:

```txt
https://trespass-vacant-guidable.ngrok-free.dev
```

## 8. Hal yang Jangan Dimatikan Saat Demo

Saat demo WhatsApp AI:

- Terminal `npm start` di `openclaw-bot`.
- Terminal `ngrok http 3020 --url https://trespass-vacant-guidable.ngrok-free.dev`.
- Koneksi internet laptop.
- Laptop jangan sleep.

## 9. Setelah Update Code

Kalau kamu atau Codex mengubah kode:

1. Jalankan validasi lokal:

```bash
cd /home/akiru/Documents/SiPandu
npm run lint
npm run build
```

2. Push/redeploy ke Vercel.
3. Jika env Vercel tidak berubah, cukup redeploy biasa.
4. Jika env berubah, update Environment Variables dulu, lalu redeploy.

Contoh perubahan yang butuh redeploy:

- Fix input harga produk.
- Tambah tombol hapus/nonaktifkan produk.
- Perubahan UI/UX dashboard.
- Perubahan API webhook.

## 10. Troubleshooting

### Domain ngrok offline

Gejala:

```txt
ERR_NGROK_3200
```

Solusi:

```bash
ngrok http 3020 --url https://trespass-vacant-guidable.ngrok-free.dev
```

Pastikan bot lokal juga hidup:

```bash
curl http://localhost:3020/health
```

### Bot lokal mati

Solusi:

```bash
cd /home/akiru/Documents/SiPandu/openclaw-bot
npm start
```

### QR tidak muncul di dashboard

Cek:

```bash
curl https://trespass-vacant-guidable.ngrok-free.dev/health
```

Kalau gagal, masalah ada di bot/ngrok.

Kalau berhasil, cek env Vercel:

```env
OPENCLAW_BOT_API_URL=https://trespass-vacant-guidable.ngrok-free.dev
OPENCLAW_BOT_API_SECRET=sama-dengan-lokal
```

Setelah env dicek, redeploy Vercel.

### WhatsApp masuk tapi bot tidak balas

Cek terminal `openclaw-bot`.

Kalau ada error webhook, cek:

```env
NEXT_WEBHOOK_URL=https://DOMAIN-VERCEL-KAMU/api/webhooks/openclaw
OPENCLAW_WEBHOOK_SECRET=sama-dengan-vercel
```

### Bot hanya membalas nomor tertentu

Cek allowlist:

```env
OPENCLAW_ALLOWLIST=
```

Kosongkan untuk demo umum.

### Harus scan QR ulang

Session WhatsApp lokal disimpan di:

```txt
/home/akiru/Documents/SiPandu/openclaw-bot/session
```

Jangan hapus folder itu kalau tidak ingin scan ulang.

Jika tetap diminta scan ulang, scan dari:

```txt
Dashboard > WhatsApp
```

## 11. Checklist Cepat Sebelum Presentasi

1. Vercel sudah deploy versi terbaru.
2. Env Vercel sudah benar.
3. Bot lokal hidup:

```bash
curl http://localhost:3020/health
```

4. Ngrok hidup:

```bash
curl https://trespass-vacant-guidable.ngrok-free.dev/health
```

5. Dashboard WhatsApp status connected.
6. Produk demo sudah rapi.
7. QRIS sudah diupload.
8. Test chat `menu`.
9. Test order singkat.
10. Siapkan screenshot/video fallback kalau jaringan bermasalah.

## 12. Command Harian

Terminal 1:

```bash
cd /home/akiru/Documents/SiPandu/openclaw-bot
npm start
```

Terminal 2:

```bash
ngrok http 3020 --url https://trespass-vacant-guidable.ngrok-free.dev
```

Test:

```bash
curl https://trespass-vacant-guidable.ngrok-free.dev/health
```

Lanjut buka:

```txt
Dashboard > WhatsApp
```
