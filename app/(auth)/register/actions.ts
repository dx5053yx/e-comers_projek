"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function registerAction(formData: FormData) {
  if (!isSupabaseServerConfigured()) {
    redirect("/dashboard");
  }

  const fullName = String(formData.get("full_name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const businessName = String(formData.get("business_name") ?? "");
  const whatsappNumber = String(formData.get("whatsapp_number") ?? "");
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error || !data.user) {
    redirect(`/register?error=${encodeURIComponent(error?.message ?? "Register gagal.")}`);
  }

  if (!isSupabaseAdminConfigured()) {
    redirect("/register?error=Supabase service role belum dikonfigurasi.");
  }

  const admin = createSupabaseAdminClient();

  await admin.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    phone: whatsappNumber,
    role: "BUSINESS_OWNER",
  });

  const { data: business } = await admin
    .from("businesses")
    .insert({
      owner_id: data.user.id,
      name: businessName,
      slug: slugify(businessName),
      category: "UMKM",
      whatsapp_number: whatsappNumber,
      payment_instructions: "Atur instruksi pembayaran di menu Settings.",
    })
    .select("id")
    .single();

  if (business?.id) {
    await admin.from("business_members").insert({
      business_id: business.id,
      user_id: data.user.id,
      role: "OWNER",
    });
  }

  redirect("/dashboard");
}
