export function normalizeIndonesianWhatsAppNumber(phone?: string | null) {
  const digits = phone?.replace(/\D/g, "") ?? "";

  if (!digits) {
    return null;
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("8")) {
    return `62${digits}`;
  }

  return digits;
}

export function createWhatsAppUrl(phone?: string | null, message?: string) {
  const number = normalizeIndonesianWhatsAppNumber(phone);

  if (!number) {
    return null;
  }

  const query = message ? `?text=${encodeURIComponent(message)}` : "";

  return `https://wa.me/${number}${query}`;
}
