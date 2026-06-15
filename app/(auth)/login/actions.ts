"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACTIVE_BUSINESS_COOKIE } from "@/lib/data/queries";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";

export async function isGuestLoginConfigured() {
  return Boolean(
    process.env.GUEST_ACCOUNT_EMAIL &&
      process.env.GUEST_ACCOUNT_PASSWORD &&
      process.env.GUEST_BUSINESS_SLUG,
  );
}

export async function loginAction(formData: FormData) {
  if (!isSupabaseServerConfigured()) {
    redirect("/dashboard");
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    const { data: membership } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (membership?.business_id) {
      (await cookies()).set(ACTIVE_BUSINESS_COOKIE, membership.business_id, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  redirect("/dashboard");
}

export async function guestLoginAction() {
  if (!isSupabaseServerConfigured()) {
    redirect("/dashboard");
  }

  const email = process.env.GUEST_ACCOUNT_EMAIL?.trim().toLowerCase();
  const password = process.env.GUEST_ACCOUNT_PASSWORD;
  const businessSlug = process.env.GUEST_BUSINESS_SLUG?.trim().toLowerCase();

  if (!email || !password || !businessSlug) {
    redirect("/login?error=Akun tamu belum dikonfigurasi oleh administrator.");
  }

  const supabase = await createSupabaseServerClient();
  let authResult = await supabase.auth.signInWithPassword({ email, password });

  if (authResult.error) {
    if (!isSupabaseAdminConfigured()) {
      redirect("/login?error=Service role Supabase diperlukan untuk membuat akun tamu.");
    }

    const admin = createSupabaseAdminClient();
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "Tamu Presentasi siPandu",
        access: "viewer",
      },
    });

    if (createError && !createError.message.toLowerCase().includes("already")) {
      redirect(`/login?error=${encodeURIComponent(`Akun tamu gagal dibuat: ${createError.message}`)}`);
    }

    authResult = await supabase.auth.signInWithPassword({ email, password });
  }

  const user = authResult.data.user;

  if (authResult.error || !user) {
    redirect("/login?error=Akun tamu tidak dapat digunakan. Periksa konfigurasi email dan password.");
  }

  if (!isSupabaseAdminConfigured()) {
    redirect("/login?error=Service role Supabase belum dikonfigurasi.");
  }

  const admin = createSupabaseAdminClient();
  const { data: business, error: businessError } = await admin
    .from("businesses")
    .select("id")
    .eq("slug", businessSlug)
    .maybeSingle();

  if (businessError || !business) {
    await supabase.auth.signOut();
    redirect("/login?error=Toko untuk akun tamu tidak ditemukan. Periksa GUEST_BUSINESS_SLUG.");
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: user.id,
      full_name: "Tamu Presentasi siPandu",
      role: "BUSINESS_STAFF",
    },
    { onConflict: "id" },
  );

  const { error: membershipError } = await admin.from("business_members").upsert(
    {
      business_id: business.id,
      user_id: user.id,
      role: "VIEWER",
    },
    { onConflict: "business_id,user_id" },
  );

  if (profileError || membershipError) {
    await supabase.auth.signOut();
    redirect(
      "/login?error=Role VIEWER belum siap. Jalankan migration guest account terbaru di Supabase.",
    );
  }

  (await cookies()).set(ACTIVE_BUSINESS_COOKIE, business.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/dashboard");
}
