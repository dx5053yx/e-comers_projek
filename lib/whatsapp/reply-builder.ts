import type { Order, Product } from "@/lib/types";
import { orderStatusLabels } from "@/lib/orders/status";
import { formatCurrency } from "@/lib/utils";

export function buildProductListReply(businessName: string, products: Product[]) {
  if (!products.length) {
    return `Belum ada produk yang aktif di ${businessName}, kak. Nanti kalau sudah ada, aku kabarin ya.`;
  }

  const list = products
    .filter((product) => product.is_active)
    .slice(0, 8)
    .map((product, index) => `${index + 1}. ${product.name} - ${formatCurrency(product.price)}`)
    .join("\n");

  return `Ready kak, yang ada sekarang ini:\n${list}\n\nKalau mau pesan, tulis nama produk sama jumlahnya aja.`;
}

export function buildAvailabilityReply({
  product,
  query,
  products,
}: {
  product?: Product | null;
  query?: string | null;
  products: Product[];
}) {
  if (product) {
    const totalStock = product.variants?.reduce((sum, variant) => sum + variant.stock, 0);
    const stockText =
      typeof totalStock === "number"
        ? totalStock > 0
          ? `stoknya ada ${totalStock}`
          : "stoknya lagi kosong"
        : "bisa dicek dulu";

    return `${product.name} ada di katalog, kak. Harganya ${formatCurrency(product.price)}, ${stockText}. Mau ambil berapa?`;
  }

  const availableProducts = products
    .filter((item) => item.is_active)
    .slice(0, 5)
    .map((item) => item.name)
    .join(", ");
  const searched = query?.trim() ? ` "${query.trim()}"` : "";

  return `Kalau${searched}, belum ada di katalog kami, kak. Yang ready sekarang: ${availableProducts || "belum ada produk aktif"}. Mau aku kirim menu lengkapnya?`;
}

export function buildPaymentReply(
  order: Order,
  paymentInstructions?: string | null,
  qrisImageUrl?: string | null,
) {
  const items = (order.items ?? [])
    .map((item) => `- ${item.product_name} x${item.quantity} = ${formatCurrency(item.total)}`)
    .join("\n");
  const qrisText = qrisImageUrl
    ? `\n\nQRIS pembayaran:\n${qrisImageUrl}\n\nSetelah transfer/scan QRIS, kirim bukti pembayaran di chat ini ya kak.`
    : "";

  return `Siap kak, pesanan berhasil dibuat.\nKode order: ${order.order_code}\n\nDetail:\n${items}\nTotal: ${formatCurrency(order.grand_total)}\n\n${paymentInstructions ?? "Silakan transfer ke rekening toko, lalu kirim bukti pembayaran di sini."}${qrisText}`;
}

export function buildOrderStatusReply(order: Order) {
  const status = orderStatusLabels[order.status];
  const tracking = order.shipment?.tracking_number
    ? `\nResi: ${order.shipment.tracking_number}`
    : "";

  return `Status pesanan ${order.order_code} saat ini: ${status}.${tracking}`;
}

export function buildPaymentMethodReply(
  businessName: string,
  paymentInstructions?: string | null,
  qrisImageUrl?: string | null,
) {
  const qrisText = qrisImageUrl
    ? `\nQRIS toko juga tersedia, nanti akan dikirim setelah order dibuat.`
    : "";

  return `Metode pembayaran ${businessName}: ${paymentInstructions ?? "admin akan mengirim instruksi pembayaran setelah order dibuat."}${qrisText}`;
}

export function buildDeliveryReply(businessName: string, address?: string | null) {
  const addressText = address ? `\nAlamat toko: ${address}` : "";

  return `${businessName} bisa bantu proses pesanan untuk pengiriman. Ongkir dan estimasi akan dikonfirmasi admin sesuai alamat tujuan.${addressText}`;
}

export function buildTalkToAdminReply() {
  return "Baik kak, saya teruskan ke admin ya. Sambil menunggu, kakak bisa tulis detail kebutuhan atau pertanyaannya di chat ini.";
}

export function buildFallbackReply(businessName?: string, customerMessage?: string | null) {
  const normalized = (customerMessage ?? "").toLowerCase();
  const storeName = businessName ?? "toko kami";
  const trimmed = normalized.trim();

  if (/^(p|ping|test)$/i.test(trimmed)) {
    return "Iya kak, cari apa?";
  }

  if (/\b(kontol|memek|anjing|bangsat|tolol|goblok|babi)\b/i.test(normalized)) {
    return "Santai kak, aku bantu. Lagi nyari apa?";
  }

  if (/^(halo|hallo|hai|hi|hello|cuy|pagi|siang|sore|malam)\b/i.test(trimmed)) {
    return `Halo kak, mau cari apa di ${storeName}?`;
  }

  if (
    normalized.includes("nama toko") ||
    normalized.includes("nama umkm") ||
    normalized.includes("nama usah") ||
    normalized.includes("tokonya apa") ||
    normalized.includes("umkmnya apa")
  ) {
    return `Ini ${storeName}, kak. Mau aku kirim menu yang tersedia?`;
  }

  if (
    normalized.includes("ngoding") ||
    normalized.includes("coding") ||
    normalized.includes("program") ||
    normalized.includes("komputer")
  ) {
    return `Wah kalau soal ngoding aku kurang pas jadi tempat nanyanya, kak. Aku di sini pegang chat ${storeName}. Mau aku bantu cek menu atau bikin pesanan?`;
  }

  if (
    normalized.includes("gimana") ||
    normalized.includes("bagaimana") ||
    normalized.includes("caranya") ||
    normalized.includes("cara")
  ) {
    return `Maksudnya cara pesan ya, kak? Gampang kok. Pilih produknya, tulis jumlahnya, lalu kirim nama dan alamat kalau mau dikirim. Nanti setelah order dibuat, aku kirim detail pembayaran.`;
  }

  return `Aku kurang nangkep maksudnya, kak. Maksudnya mau tanya menu, harga, cara pesan, atau cek pesanan?`;
}
