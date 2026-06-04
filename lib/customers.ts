import type { Customer } from "@/lib/types";
import {
  createFallbackCustomerName,
  formatWhatsAppNumber,
  isPhoneLike,
} from "@/lib/whatsapp";

export function getCustomerPrimaryPhone(customer: Pick<Customer, "whatsapp_number" | "phone">) {
  return customer.whatsapp_number || customer.phone || null;
}

export function getCustomerDisplayName(
  customer: Pick<Customer, "name" | "whatsapp_number" | "phone">,
) {
  const name = customer.name?.trim();
  const phone = getCustomerPrimaryPhone(customer);

  if (name && !isPhoneLike(name) && name !== phone) {
    return name;
  }

  return createFallbackCustomerName(phone);
}

export function getCustomerDisplayPhone(customer: Pick<Customer, "whatsapp_number" | "phone">) {
  return formatWhatsAppNumber(getCustomerPrimaryPhone(customer));
}
