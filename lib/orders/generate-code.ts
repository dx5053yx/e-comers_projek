import type { SupabaseClient } from "@supabase/supabase-js";

export function generateOrderCode(sequence: number, date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const paddedSequence = String(sequence).padStart(3, "0");

  return `SP-${year}${month}${day}-${paddedSequence}`;
}

export async function generateAvailableOrderCode(
  supabase: SupabaseClient,
  date = new Date(),
) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
  const { count, error: countError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", start);

  if (countError) {
    throw countError;
  }

  const firstSequence = (count ?? 0) + 1;

  for (let sequence = firstSequence; sequence < firstSequence + 1000; sequence += 1) {
    const orderCode = generateOrderCode(sequence, date);
    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("order_code", orderCode)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return orderCode;
    }
  }

  throw new Error("Gagal membuat kode order unik.");
}
