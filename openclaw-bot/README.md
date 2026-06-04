# siPandu WhatsApp Bot Adapter

Adapter ini menghubungkan WhatsApp ke webhook siPandu dan menyediakan QR pairing untuk dashboard.

Alur:

1. Customer chat nomor WhatsApp bot.
2. Bot forward pesan ke `NEXT_WEBHOOK_URL`.
3. siPandu membuat intent/order/reply.
4. Bot mengirim `reply` dan `media` QRIS balik ke WhatsApp.

## Environment Service

Bot otomatis membaca `../.env.local` jika dijalankan dari folder `openclaw-bot`.

```env
NEXT_WEBHOOK_URL=http://localhost:3000/api/webhooks/openclaw
OPENCLAW_WEBHOOK_SECRET=
OPENCLAW_SESSION_PATH=./session
OPENCLAW_ALLOWLIST=
OPENCLAW_BOT_API_PORT=3020
OPENCLAW_BOT_API_SECRET=
OPENCLAW_LOG_LEVEL=info
OPENCLAW_REPLY_GROUPS=false
```

`OPENCLAW_BOT_API_SECRET` harus sama dengan env Next.js. Jika kosong, service memakai `OPENCLAW_WEBHOOK_SECRET`.

`OPENCLAW_ALLOWLIST` opsional. Saat diisi, bot hanya membalas nomor tester di daftar itu. Untuk production biasanya kosong.

## Jalankan Lokal

Pastikan app Next.js siPandu sudah jalan di `http://localhost:3000`, lalu:

```bash
cd openclaw-bot
npm install
npm start
```

Lalu buka dashboard siPandu:

`Dashboard > WhatsApp > Hubungkan`

QR akan muncul di aplikasi. Scan QR menggunakan WhatsApp nomor bisnis:

`WhatsApp > Linked devices > Link a device`

Session akan disimpan di `OPENCLAW_SESSION_PATH/<slug-bisnis>`, jadi satu service bisa menangani beberapa bisnis.

## Mode Manual

Untuk test satu toko lewat terminal:

```env
OPENCLAW_BUSINESS_SLUG=slug-toko-kamu
```

```bash
npm run start:single
```

## Payload ke siPandu

```json
{
  "businessSlug": "slug-toko-kamu",
  "from": "+6281234567890",
  "message": "mau pesan produk 2",
  "timestamp": "2026-06-04T10:00:00.000Z",
  "raw": {}
}
```

Response dari siPandu:

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

## Deploy

OpenClaw/WhatsApp socket harus berjalan di server persistent, bukan serverless, karena session WhatsApp perlu disimpan.

1. Deploy app siPandu dulu.
2. Set `NEXT_WEBHOOK_URL=https://domain-kamu.com/api/webhooks/openclaw`.
3. Set `OPENCLAW_WEBHOOK_SECRET` sama dengan env siPandu.
4. Set `OPENCLAW_BOT_API_SECRET` sama di app siPandu dan service bot.
5. Mount volume untuk `OPENCLAW_SESSION_PATH`.
6. Jalankan service bot.
7. Seller scan QR dari `Dashboard > WhatsApp`.
