"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACTIVE_BUSINESS_COOKIE } from "@/lib/data/queries";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
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

export async function deleteAccountAction(formData: FormData) {
  if (!isSupabaseServerConfigured()) {
    redirect("/login");
  }

  if (!isSupabaseAdminConfigured()) {
    redirect(
      `/dashboard/settings?accountError=${encodeURIComponent("Service role Supabase belum dikonfigurasi.")}`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email?.trim().toLowerCase();
  const confirmation = String(formData.get("confirm_email") ?? "").trim().toLowerCase();
  const guestEmail = process.env.GUEST_ACCOUNT_EMAIL?.trim().toLowerCase();

  if (!email) {
    redirect(
      `/dashboard/settings?accountError=${encodeURIComponent("Akun ini tidak punya email untuk konfirmasi hapus akun.")}`,
    );
  }

  if (guestEmail && email === guestEmail) {
    redirect(
      `/dashboard/settings?accountError=${encodeURIComponent("Akun tamu tidak boleh menghapus akun.")}`,
    );
  }

  if (confirmation !== email) {
    redirect(
      `/dashboard/settings?accountError=${encodeURIComponent("Konfirmasi email belum sesuai.")}`,
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: ownedMemberships, error: ownershipError } = await admin
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .eq("role", "OWNER");

  if (ownershipError) {
    redirect(
      `/dashboard/settings?accountError=${encodeURIComponent(`Gagal memeriksa kepemilikan bisnis: ${ownershipError.message}`)}`,
    );
  }

  const ownedBusinessIds = (ownedMemberships ?? [])
    .map((membership) => String(membership.business_id))
    .filter(Boolean);

  if (ownedBusinessIds.length) {
    const { error: inactiveError } = await admin
      .from("businesses")
      .update({ is_active: false, owner_id: null })
      .in("id", ownedBusinessIds);

    if (inactiveError) {
      redirect(
        `/dashboard/settings?accountError=${encodeURIComponent(`Gagal menyembunyikan toko dari publik: ${inactiveError.message}`)}`,
      );
    }
  }

  const { error: businessError } = await admin
    .from("businesses")
    .update({ is_active: false, owner_id: null })
    .eq("owner_id", user.id);

  if (businessError) {
    redirect(
      `/dashboard/settings?accountError=${encodeURIComponent(`Gagal menyembunyikan toko dari publik: ${businessError.message}`)}`,
    );
  }

  const profileReferences = [
    ["inventory_movements", "created_by"],
    ["payments", "verified_by"],
    ["order_status_logs", "changed_by"],
  ] as const;

  for (const [table, column] of profileReferences) {
    const { error } = await admin
      .from(table)
      .update({ [column]: null })
      .eq(column, user.id);

    if (error) {
      redirect(
        `/dashboard/settings?accountError=${encodeURIComponent(`Gagal membersihkan riwayat akun: ${error.message}`)}`,
      );
    }
  }

  const { error: membershipError } = await admin
    .from("business_members")
    .delete()
    .eq("user_id", user.id);

  if (membershipError) {
    redirect(
      `/dashboard/settings?accountError=${encodeURIComponent(`Gagal menghapus akses bisnis: ${membershipError.message}`)}`,
    );
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    redirect(
      `/dashboard/settings?accountError=${encodeURIComponent(`Gagal menghapus akun: ${deleteError.message}`)}`,
    );
  }

  await supabase.auth.signOut();
  (await cookies()).delete(ACTIVE_BUSINESS_COOKIE);

  redirect(
    `/login?success=${encodeURIComponent("Akun berhasil dihapus. Data toko dan riwayat transaksi tetap tersimpan.")}`,
  );
}

export async function logoutAction() {
  if (isSupabaseServerConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  (await cookies()).delete(ACTIVE_BUSINESS_COOKIE);
  redirect("/login");
}
