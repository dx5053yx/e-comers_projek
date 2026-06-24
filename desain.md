# siPandu — Design System
> **Konsep: "Warung Naik Kelas"**  
> Visual identity sebuah warung lokal Purbalingga yang naik kelas secara digital — bukan startup SaaS asing, bukan enterprise tool. Desain harus terasa seperti alat kerja yang sudah dikenal UMKM: WhatsApp, struk kasir, papan harga. Didigitalkan, tapi tidak kehilangan jiwa lokalnya.

---

## Anti-Template Checklist

Sebelum build, ini yang sengaja **dihindari** dari desain sekarang:

| ❌ Yang ada sekarang | ✅ Gantinya |
|---|---|
| Mint green SaaS (#0b9f55) | Daun pisang tua (#1C5C35) + kunyit (#C8890A) |
| Hero = tagline kiri + card kanan | Hero = full-bleed animasi WhatsApp conversation |
| 3-column icon grid untuk fitur | Alternating screenshot layout per fitur |
| Numbered boxes untuk "Cara Kerja" | Jalur horizontal (track flow nyata, bukan dekorasi) |
| Sidebar 280px yang developer-berat | Top-rail nav + bottom tab bar mobile |
| Geist Sans (default Next.js) | Plus Jakarta Sans (buatan desainer Indonesia) |
| Tabel untuk status order | Chat timeline (konsisten dengan channel utama) |

---

## 1. Palet Warna — "Dapur Purbalingga"

Warna diambil dari bahan dan material yang familiar bagi pelaku UMKM Purbalingga: kertas coklat pembungkus, daun pisang, kunyit, cabe merah, arang tungku.

```css
:root {
  /* ── Background & Surface ── */
  --background:          #F3EDD8;   /* kertas coklat — bukan cream, bukan putih */
  --foreground:          #1A1007;   /* arang hangat */
  --card:                #FFFCF3;   /* permukaan bersih */
  --card-foreground:     #1A1007;

  /* ── Muted ── */
  --muted:               #E4D9BC;
  --muted-foreground:    #6B5B3E;   /* tinta coklat tua */

  /* ── Brand ── */
  --primary:             #1C5C35;   /* daun pisang tua */
  --primary-foreground:  #FFFCF3;
  --accent:              #C8890A;   /* kunyit */
  --accent-foreground:   #1A1007;
  --secondary:           #2B4A36;   /* daun pisang muda (gelap) */
  --secondary-foreground:#FFFCF3;

  /* ── Semantic ── */
  --border:              #D9C9A8;
  --border-subtle:       #EBE0C4;
  --danger:              #C43018;   /* cabe merah */
  --success:             #1C6B3A;
  --warning:             #A06800;

  /* ── Chat (UI Signature) ── */
  --chat-bg:             #EAE2CE;   /* wallpaper WA khas — sandy warm */
  --chat-outgoing:       #D5F0DC;   /* bubble bot siPandu — hijau muda */
  --chat-incoming:       #FFFCF3;   /* bubble pelanggan — putih hangat */
  --chat-time:           #8A7B62;   /* timestamp */
  --chat-separator:      #B5A98A;   /* garis pemisah tanggal */

  /* ── Landing ── */
  --landing-bg:          #F3EDD8;
  --landing-surface:     #FFFCF3;
  --landing-soft:        #EAE2CE;
  --landing-text:        #1A1007;
  --landing-muted:       #6B5B3E;
  --landing-border:      #D9C9A8;
  --landing-footer:      #0F1A0A;
  --landing-premium:     #112A1A;

  --radius:              0.5rem;
  --card-shadow:         0 2px 8px rgba(26, 16, 7, 0.08),
                         0 0 0 1px rgba(26, 16, 7, 0.04);
}
```

### Dark Mode

```css
[data-theme="dark"] {
  --background:          #130E08;
  --foreground:          #F0E8D4;
  --card:                #1E1710;
  --card-foreground:     #F0E8D4;
  --muted:               #2A2218;
  --muted-foreground:    #9E8F72;
  --primary:             #4DB87A;
  --primary-foreground:  #091A0D;
  --accent:              #E0A020;
  --accent-foreground:   #1A1007;
  --border:              #352C1C;
  --border-subtle:       #2A2218;
  --danger:              #E05A42;
  --success:             #3DC870;
  --warning:             #F0B830;
  --chat-bg:             #0D0B07;
  --chat-outgoing:       #1A3D25;
  --chat-incoming:       #2A2218;
  --chat-time:           #6B5B3E;
  --landing-bg:          #130E08;
  --landing-surface:     #1E1710;
  --landing-soft:        #2A2218;
  --landing-text:        #F0E8D4;
  --landing-muted:       #9E8F72;
  --landing-border:      #352C1C;
  --landing-footer:      #060402;
}
```

---

## 2. Tipografi

**Plus Jakarta Sans** — dibuat oleh Gumpita Rahayu, desainer Indonesia. Humanis, tegas, tidak steril. Pas untuk produk UMKM lokal yang ingin tampil profesional tapi tetap hangat. Bukan Geist, bukan Inter, bukan Poppins.

**Space Mono** — untuk nilai nominal (harga, kode order). Kontras mekanis antara angka-angka Space Mono dengan kehangatang Plus Jakarta Sans menciptakan ritme visual yang membedakan data dari narasi.

```css
/* Di layout.tsx atau globals.css */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

:root {
  --font-sans: 'Plus Jakarta Sans', Arial, sans-serif;
  --font-mono: 'Space Mono', 'Courier New', monospace;
}
```

### Type Scale

```
Display  72px / weight 800 / tracking -0.03em  — hero landing saja
H1       48px / weight 700 / tracking -0.02em
H2       34px / weight 700 / tracking -0.015em
H3       22px / weight 600 / tracking -0.01em
H4       17px / weight 600 / tracking 0
Body     15px / weight 400 / leading 1.65
Small    13px / weight 400 / leading 1.6
Label    11px / weight 600 / tracking 0.08em / uppercase
Mono     14px / Space Mono  — untuk Rp 1.234.500 dan SP-20260604-001
```

---

## 3. Shape, Spacing, Motion

```css
/* Shape */
--radius-sm:    4px;    /* badge, chip, tag harga */
--radius-md:    8px;    /* card, input, button */
--radius-lg:    14px;   /* modal, panel besar */
--radius-xl:    20px;   /* bottom sheet mobile */

/* Chat bubble radius (asimetris, seperti WA) */
--radius-chat-right: 18px 18px 4px 18px;   /* bubble bot (kanan) */
--radius-chat-left:  18px 18px 18px 4px;   /* bubble pelanggan (kiri) */
```

```css
/* Motion */
--ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);

/* Duration */
--dur-fast:      120ms;
--dur-base:      200ms;
--dur-slow:      360ms;
--dur-chat:      240ms;   /* delay antar bubble di hero */

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Motion rules:**
- Chat bubble hero → `slide-up` + `fade-in`, stagger 800ms antar bubble
- Stat card → nilai `count-up` saat masuk viewport (Intersection Observer)
- Hover button → `transform: scale(1.02)`, 120ms
- Page section → `fade-up` 240ms, trigger saat 80% masuk viewport
- Skeleton → `shimmer` gradient dengan `--border-subtle`

---

## 4. Elemen Signature: Chat Bubble sebagai Unit Struktural

Ini bukan dekorasi. Chat bubble adalah **bahasa visual utama** siPandu karena produk ini IS WhatsApp. Dipakai konsisten di:

1. Hero landing → animasi percakapan full-bleed
2. Setiap fitur → screenshot conversation nyata
3. Order tracking → chat timeline bukan status table
4. Auth page → live preview di kolom kiri
5. Empty state → "Belum ada pesanan. Hubungkan WA untuk mulai."

### CSS Dasar Chat Bubble

```css
.chat-window {
  background: var(--chat-bg);
  border-radius: var(--radius-lg);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bubble {
  max-width: 78%;
  padding: 10px 14px;
  font-size: 13px;
  line-height: 1.55;
  position: relative;
}

.bubble--outgoing {                           /* bot siPandu */
  background: var(--chat-outgoing);
  border-radius: var(--radius-chat-right);
  align-self: flex-end;
}

.bubble--incoming {                           /* pelanggan */
  background: var(--chat-incoming);
  border-radius: var(--radius-chat-left);
  align-self: flex-start;
  box-shadow: 0 1px 2px rgba(26, 16, 7, 0.08);
}

.bubble__sender {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 2px;
}

.bubble__time {
  font-size: 10px;
  color: var(--chat-time);
  text-align: right;
  margin-top: 4px;
}

.chat-day-separator {
  text-align: center;
  font-size: 11px;
  color: var(--chat-separator);
  padding: 4px 12px;
  background: rgba(26, 16, 7, 0.06);
  border-radius: 10px;
  align-self: center;
  margin: 8px 0;
}
```

---

## 5. Landing Page

### Konsep

Visitor langsung melihat percakapan WhatsApp yang berjalan. Bukan tagline besar + ilustrasi. Bukan screenshot dashboard. Produknya bekerja secara real-time di depan mata — buyer ngetik, bot bales, pesanan masuk.

### Wireframe — Hero

```
┌──────────────────────────────────────────────────────┐
│  siPandu          [Fitur] [Cara Kerja] [Harga]  [→]  │  ← sticky, bg blur, no border
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ░░░░░░░░░░░░  CHAT AREA  (bg --chat-bg)  ░░░░░░░░░  │
│                                                      │
│       [siPandu Bot]                                  │
│       ╔══════════════════════════════╗               │
│       ║ Selamat datang di Warung     ║  ← bubble    │
│       ║ Bu Sari! Ada yang bisa kami  ║    kiri      │
│       ║ bantu?                       ║               │
│       ╚══════════════════════════════╝               │
│                                                      │
│              [Pelanggan]                             │
│              ╔════════════════════════╗              │
│              ║ mendoan 10 sama es     ║  ← bubble   │
│              ║ teh 2, ambil jam 5     ║    kanan     │
│              ╚════════════════════════╝              │
│                                                      │
│       [siPandu Bot]                                  │
│       ╔══════════════════════════════╗               │
│       ║ Siap kak! Pesanannya:        ║               │
│       ║ 10 Mendoan — Rp 20.000       ║               │
│       ║  2 Es Teh  — Rp  8.000       ║               │
│       ║ Total: Rp 28.000 ✓           ║               │
│       ║ [gambar QRIS payment]        ║               │
│       ╚══════════════════════════════╝               │
│                                                      │
│  ┌──────────────────────────────────┐                │
│  │  Chatbot AI untuk UMKM           │                │  ← overlay card kiri bawah
│  │  Purbalingga                     │                │    bg: rgba(--landing-bg, 0.9)
│  │                                  │                │    backdrop-blur: 8px
│  │  [Masuk Dashboard →]  [Lihat Demo]               │
│  └──────────────────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

### Wireframe — Fitur

Bukan 3-column icon grid. Tiap fitur = satu baris dua kolom bergantian: teks + screenshot conversation nyata yang menunjukkan fitur itu bekerja.

```
┌──────────────────────────────────────────────────────┐
│  FITUR UTAMA                                         │
│  ─────────────────────────────────────────────────  │
│                                                      │
│  ┌────────────────────┐  ┌────────────────────────┐  │
│  │ [chat screenshot]  │  │ Auto-Reply 24/7        │  │
│  │                    │  │                        │  │
│  │ Pelanggan: "stok   │  │ Bot menjawab kapan     │  │
│  │ mendoan masih?"    │  │ saja — tengah malam    │  │
│  │                    │  │ pun. Tanpa kamu harus  │  │
│  │ Bot: "Masih ada    │  │ standby.               │  │
│  │ kak, 50 biji..."   │  │                        │  │
│  └────────────────────┘  └────────────────────────┘  │
│                                                      │
│  ┌────────────────────┐  ┌────────────────────────┐  │
│  │ Catat Pesanan      │  │ [order screenshot]     │  │  ← flip
│  │ Otomatis           │  │                        │  │
│  │                    │  │ Dashboard: order baru  │  │
│  │ AI baca chat dan   │  │ dari WA sudah masuk    │  │
│  │ langsung catat ke  │  │ otomatis               │  │
│  │ dashboard tanpa    │  │                        │  │
│  │ input ulang.       │  │                        │  │
│  └────────────────────┘  └────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Wireframe — Cara Kerja

Bukan numbered boxes. Sebuah **jalur horizontal** yang memperlihatkan alur nyata dari daftar sampai order masuk — karena ini beneran sebuah proses berurutan.

```
┌──────────────────────────────────────────────────────┐
│  CARA KERJA — 4 LANGKAH                              │
│                                                      │
│   ◉─────────────────◉─────────────────◉────────────◉  │
│   │                 │                 │             │  │
│   ▼                 ▼                 ▼             ▼  │
│  [1] Daftar     [2] Input         [3] Hubungkan  [4] Order
│  UMKM           Produk            WhatsApp       Masuk   │
│                                                      │
│  Isi nama,      Masukkan          Scan QR dari   Semua   │
│  kategori,      produk, harga,    dashboard,     tercatat │
│  dan profil.    foto, stok.       bot aktif.     otomatis. │
└──────────────────────────────────────────────────────┘
```

Track garis pakai `--primary` (#1C5C35). Titik aktif bisa diisi aksen `--accent` (#C8890A).

### Wireframe — Harga

```
┌──────────────────────────────────────────────────────┐
│  ┌────────────────────┐  ┌────────────────────────┐  │
│  │ Gratis             │  │ Premium          [HOT] │  │
│  │                    │  │  bg: --landing-premium │  │
│  │ Rp 0               │  │  (dark green)          │  │
│  │ /bulan             │  │                        │  │
│  │                    │  │ Rp 100.000 /bulan      │  │
│  │ ✓ Profil UMKM      │  │                        │  │
│  │ ✓ Katalog dasar    │  │ ✓ Semua fitur Gratis   │  │
│  │ ✓ Auto-reply       │  │ ✓ Analytics lanjutan   │  │
│  │ ✓ Catat pesanan    │  │ ✓ Custom AI tone       │  │
│  │                    │  │ ✓ Support prioritas    │  │
│  │ [Masuk Dashboard]  │  │ [Mulai Premium]        │  │
│  └────────────────────┘  └────────────────────────┘  │
│                                                      │
│  Label "HOT" → bg: --accent (#C8890A), bukan "Populer"  │
└──────────────────────────────────────────────────────┘
```

### Wireframe — UMKM Terdaftar

Card horizontal scroll. Setiap card terasa seperti kartu nama warung.

```
┌──────────────────────────────────────────────────────┐
│  UMKM YANG SUDAH TERDAFTAR       [Lihat Semua →]     │
│                                                      │
│  ◄  [Card 1]  [Card 2]  [Card 3]  [Card 4+]  ►      │
│                                                      │
│  ┌─────────────┐                                     │
│  │ [foto/logo] │                                     │
│  │ Warung Bu   │                                     │
│  │ Sari        │                                     │
│  │ Makanan · 8 │                                     │
│  │ produk      │                                     │
│  │ ⭐ 4.8      │                                     │
│  │ [Katalog]   │                                     │
│  │ [WA Chat]   │                                     │
│  └─────────────┘                                     │
└──────────────────────────────────────────────────────┘
```

---

## 6. Dashboard

### Layout: Top-Rail, bukan Sidebar

Sidebar 280px terasa berat dan tidak natural untuk UMKM owner yang biasa akses dari HP. Ganti dengan top-rail yang collapse ke bottom tab bar di mobile.

```
┌──────────────────────────────────────────────────────┐
│  [⊞ siPandu]   Warung Bu Sari  ▾    [🔔]  [☾]  [👤] │  ← top bar
├──────────────────────────────────────────────────────┤
│  [Dashboard] [Produk] [Pesanan] [Bayar] [Stok] [···] │  ← nav rail desktop
├──────────────────────────────────────────────────────┤
│                                                      │
│  Selamat pagi, Bu Sari ☀️                            │
│  Ada 3 pesanan baru hari ini.                        │
│                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │ Rp 1.234.500│ │ 12 pesanan  │ │ 3 menunggu  │    │  ← stat strip kiri
│  │ Penjualan   │ │ hari ini    │ │ pembayaran  │    │
│  └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                      │
│  ┌───────────────────────┐  ┌─────────────────────┐  │
│  │  Grafik 7 hari        │  │  Stok Menipis       │  │
│  │  [recharts area chart]│  │  • Seblak Ori — 2   │  │
│  │  pakai --accent kunyit│  │  • Mendoan — 5      │  │
│  └───────────────────────┘  └─────────────────────┘  │
│                                                      │
│  Pesanan Terbaru                                     │
│  ┌────────────────────────────────────────────────┐  │
│  │ SP-001  •  Bu Dewi Rahayu  •  Rp 45.000  PAID  │  │
│  │ SP-002  •  Pak Rudi        •  Rp 22.000  PROSES│  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
│   [🏠 Beranda]  [📦 Produk]  [🛒 Pesanan]  [💬 WA]  │  ← bottom tabs (mobile only)
```

### Stat Card

Bukan ikon di center. Strip aksen kiri + nilai besar pakai Space Mono.

```
┌──────────────────────────────────┐
│ ▐  Rp 1.234.500                  │
│ ▐  ← border-left 3px --primary   │
│    Total penjualan                │
│    ↑ +12% dari kemarin           │  ← warna --success jika naik
└──────────────────────────────────┘
```

```css
.stat-card {
  border-left: 3px solid var(--primary);
  padding: 16px 20px;
  background: var(--card);
  border-radius: var(--radius-md);
  box-shadow: var(--card-shadow);
}

.stat-card__value {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 700;
  color: var(--foreground);
  letter-spacing: -0.02em;
}

.stat-card__label {
  font-size: 12px;
  color: var(--muted-foreground);
  margin-top: 4px;
}

.stat-card__delta {
  font-size: 11px;
  font-weight: 600;
  margin-top: 6px;
}
.stat-card__delta--up   { color: var(--success); }
.stat-card__delta--down { color: var(--danger);  }
```

---

## 7. Katalog Publik (`/katalog/[slug]`)

Terasa seperti **menu digital warung**, bukan marketplace. Header warung → filter chip → product grid.

```
┌──────────────────────────────────────────────────────┐
│  [logo]  Warung Seblak Ibu Ani                       │
│          📍 Purbalingga  ·  ⭐ 4.8  ·  [💬 Chat WA] │
│          "Seblak paling mantap di Purbalingga!"      │
├──────────────────────────────────────────────────────┤
│  [Semua]  [Makanan]  [Minuman]  [Paket Hemat]        │  ← filter chip
├──────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  [foto]  │  │  [foto]  │  │  [foto]  │           │
│  │ Seblak   │  │ Es Teh   │  │ Paket    │           │
│  │ Original │  │ Manis    │  │ Hemat    │           │
│  │          │  │          │  │          │           │
│  │ Rp 12.000│  │ Rp 4.000 │  │ Rp 20.000│           │  ← Space Mono
│  │ [+ Order]│  │ [+ Order]│  │ [+ Order]│           │
│  └──────────┘  └──────────┘  └──────────┘           │
└──────────────────────────────────────────────────────┘
```

**Product card price** pakai `.font-mono` — memberi kesan label harga asli yang dicetak, bukan digital flyer yang bisa berubah kapan saja.

---

## 8. Order Tracking (`/order/[orderCode]`)

Bukan tabel status. Riwayat order ditampilkan sebagai **chat timeline** — konsisten dengan WhatsApp sebagai channel utama siPandu.

```
┌──────────────────────────────────────────────────────┐
│  ← Kembali              SP-20260604-001              │
│                                                      │
│  ░░░░░░░░░░░░░░  (bg: --chat-bg)  ░░░░░░░░░░░░░░░░  │
│                                                      │
│         ─── Rabu, 4 Juni 2026 ───                    │  ← day separator
│                                                      │
│  [siPandu] ╔════════════════════════════════╗        │
│            ║ Pesanan diterima! 🎉            ║        │
│            ║                                ║        │
│            ║ 1× Seblak Original  Rp 12.000  ║        │
│            ║ 1× Es Teh Manis     Rp  4.000  ║        │
│            ║ Total: Rp 16.000               ║        │
│            ╚════════════════════════════════╝        │
│                                        10:02 ✓       │
│                                                      │
│  [siPandu] ╔════════════════════════════════╗        │
│            ║ Transfer ke QRIS di bawah 💳   ║        │
│            ║ [gambar QRIS — Warung Bu Ani]  ║        │
│            ╚════════════════════════════════╝        │
│                                        10:02 ✓       │
│                                                      │
│            ╔════════════════════════════════╗ [Kamu] │
│            ║ Bukti transfer sudah dikirim   ║        │
│            ╚════════════════════════════════╝        │
│                                        10:15 ✓✓      │
│                                                      │
│  [siPandu] ╔════════════════════════════════╗        │
│            ║ Pembayaran dikonfirmasi ✅      ║        │
│            ║ Pesananmu sedang dikemas.      ║        │
│            ╚════════════════════════════════╝        │
│                                        10:20 ✓       │
│                                                      │
│  ─── Menunggu update pengiriman ───                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Ini BUKAN mock WhatsApp. Ini tracking page web yang menggunakan bahasa visual chat — karena itulah bahasa yang dipahami pelanggan UMKM.

---

## 9. Auth Page (Login)

Split layout. Kolom kiri = preview animasi chat (sama dengan hero landing). Kolom kanan = form bersih. Tidak ada blank background dengan card di tengah.

```
┌───────────────────────┬──────────────────────────────┐
│                       │                              │
│  (bg: --chat-bg)      │  siPandu                     │
│                       │  Dashboard UMKM              │
│  [Animasi percakapan  │                              │
│   sama dengan hero    │  Email                       │
│   landing]            │  ─────────────────────────   │
│                       │                              │
│  Pesanan masuk        │  Password                    │
│  otomatis ke          │  ─────────────────────────   │
│  dashboard.           │                              │
│                       │  [Masuk sebagai Pengelola]   │
│                       │                              │
│                       │  ─── atau ───               │
│                       │                              │
│                       │  [Coba Mode Demo]            │
│                       │                              │
└───────────────────────┴──────────────────────────────┘
```

Mobile: kolom kiri hilang, hanya form. Bisa ada satu chat bubble animasi kecil di atas judul sebagai aksen.

---

## 10. Komponen UI

### Button

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 20px;
  height: 44px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: transform var(--dur-fast) var(--ease-out),
              background var(--dur-base) var(--ease-out);
  cursor: pointer;
}

.btn:hover    { transform: scale(1.02); }
.btn:active   { transform: scale(0.98); }

.btn--primary {
  background: var(--primary);
  color: var(--primary-foreground);
  box-shadow: 0 4px 16px rgba(28, 92, 53, 0.28);
}

.btn--accent {
  background: var(--accent);
  color: var(--accent-foreground);
}

.btn--ghost {
  background: transparent;
  color: var(--foreground);
  border: 1.5px solid var(--border);
}
.btn--ghost:hover { background: var(--muted); }

/* Tidak ada button dengan border-radius bulat (pill). */
/* Semua tombol pakai --radius-md (8px). */
```

### Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.badge--green  { background: color-mix(in srgb, var(--success) 12%, transparent); color: var(--success); }
.badge--amber  { background: color-mix(in srgb, var(--warning) 14%, transparent); color: var(--warning); }
.badge--red    { background: color-mix(in srgb, var(--danger)  12%, transparent); color: var(--danger);  }
.badge--muted  { background: var(--muted); color: var(--muted-foreground); }
```

### Input

```css
.input {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--foreground);
  transition: border-color var(--dur-base);
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 14%, transparent);
}

.input::placeholder { color: var(--muted-foreground); }
```

---

## 11. Empty States

Jangan biarkan layar kosong tanpa arah. Setiap empty state = undangan untuk bertindak.

```
Belum ada pesanan               → "Hubungkan WhatsApp untuk mulai terima order."
Belum ada produk                → "Tambah produk pertama kamu."
Stok aman semua                 → "Semua produk stoknya aman."
Belum ada ulasan                → "Ulasan akan muncul setelah pesanan selesai."
```

Desain: chat bubble kecil dari bot siPandu yang memberi petunjuk — bukan ilustrasi SVG generik.

---

## 12. Perubahan globals.css

Ganti semua token dari desain lama:

```css
/* SEBELUM → SESUDAH */
--background:   #eef6f1 → #F3EDD8
--foreground:   #071e16 → #1A1007
--card:         #ffffff → #FFFCF3
--muted:        #dcebe3 → #E4D9BC
--muted-foreground: #40594c → #6B5B3E
--primary:      #0b9f55 → #1C5C35
--accent:       #d5a72d → #C8890A
--border:       #b8d0c1 → #D9C9A8
--danger:       #b42318 → #C43018
--success:      #057a3d → #1C6B3A
--radius:       0.5rem  → tetap 0.5rem (--radius-md)

/* TAMBAH baru */
--border-subtle: #EBE0C4
--chat-bg:       #EAE2CE
--chat-outgoing: #D5F0DC
--chat-incoming: #FFFCF3
--chat-time:     #8A7B62
--chat-separator:#B5A98A
```

---

## 13. Font Integration di `layout.tsx`

```tsx
// app/layout.tsx
import { Plus_Jakarta_Sans, Space_Mono } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

// Pakai di <html>:
// className={`${plusJakarta.variable} ${spaceMono.variable}`}
```

---

## Ringkasan Perubahan Prioritas

| Prioritas | Perubahan | Dampak |
|---|---|---|
| 🔴 Tinggi | Ganti CSS tokens (warna + font variable) | Seluruh UI berubah seketika |
| 🔴 Tinggi | Replace Geist → Plus Jakarta Sans + Space Mono | Karakter berbeda langsung terasa |
| 🟡 Sedang | Hero landing: full-bleed chat animasi | First impression tidak template |
| 🟡 Sedang | Stat card: strip kiri + nilai Space Mono | Dashboard terasa beda |
| 🟡 Sedang | Feature section: alternating screenshot layout | Tidak lagi icon grid |
| 🟢 Bisa belakangan | Order tracking: chat timeline | Pengalaman buyer konsisten |
| 🟢 Bisa belakangan | Dashboard: top-rail nav | Lebih mobile-friendly |
| 🟢 Bisa belakangan | Auth: split layout dengan chat preview | Polish terakhir |