"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACTIVE_BUSINESS_COOKIE } from "@/lib/data/queries";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

export async function switchBusinessAction(formData: FormData) {
  if (!isSupabaseServerConfigured()) {
    redirect("/dashboard");
  }

  const businessId = String(formData.get("business_id") ?? "");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !businessId) {
    redirect("/login");
  }

  const { data: membership, error } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .eq("business_id", businessId)
    .maybeSingle();

  if (error || !membership) {
    redirect("/dashboard");
  }

  (await cookies()).set(ACTIVE_BUSINESS_COOKIE, businessId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  if (isSupabaseServerConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  (await cookies()).delete(ACTIVE_BUSINESS_COOKIE);
  redirect("/login");
}
