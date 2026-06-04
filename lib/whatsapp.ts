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

export function normalizeWhatsAppNumber(phone?: string | null) {
  const digits = normalizeIndonesianWhatsAppNumber(phone);

  return digits ? `+${digits}` : null;
}

export function createWhatsAppUrl(phone?: string | null, message?: string) {
  const number = normalizeIndonesianWhatsAppNumber(phone);

  if (!number) {
    return null;
  }

  const query = message ? `?text=${encodeURIComponent(message)}` : "";

  return `https://wa.me/${number}${query}`;
}

export function isPhoneLike(value?: string | null) {
  const digits = value?.replace(/\D/g, "") ?? "";

  return digits.length >= 8 && digits.length <= 18;
}

export function formatWhatsAppNumber(phone?: string | null) {
  const normalized = normalizeWhatsAppNumber(phone);

  if (!normalized) {
    return "-";
  }

  const digits = normalized.slice(1);

  if (digits.startsWith("62") && digits.length >= 10) {
    const local = digits.slice(2);
    const groups = [local.slice(0, 3), local.slice(3, 7), local.slice(7)]
      .filter(Boolean)
      .join("-");

    return `+62 ${groups}`;
  }

  return normalized;
}

export function createFallbackCustomerName(phone?: string | null) {
  const normalized = normalizeWhatsAppNumber(phone);
  const digits = normalized?.replace(/\D/g, "") ?? "";
  const suffix = digits.slice(-4);

  return suffix ? `Customer ${suffix}` : "Customer";
}
