import { cookies } from "next/headers";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { ACTIVE_BUSINESS_COOKIE, type BusinessAccessRole } from "@/lib/data/queries";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";

async function getBusinessForRequest() {
  if (!isSupabaseServerConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("business_members")
    .select("role, business_id, business:businesses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const memberships = (data ?? []).flatMap((membership) => {
    const business = Array.isArray(membership.business)
      ? membership.business[0]
      : membership.business;

    if (!business) {
      return [];
    }

    return [
      {
        business: business as Business,
        role: membership.role as BusinessAccessRole,
      },
    ];
  });
  const activeBusinessId = (await cookies()).get(ACTIVE_BUSINESS_COOKIE)?.value;
  const activeMembership =
    memberships.find((membership) => membership.business.id === activeBusinessId) ??
    memberships[0];

  return {
    business: activeMembership?.business ?? null,
    role: activeMembership?.role ?? null,
  };
}

function botApiConfig() {
  const url = process.env.OPENCLAW_BOT_API_URL ?? "http://localhost:3020";
  const secret =
    process.env.OPENCLAW_BOT_API_SECRET ?? process.env.OPENCLAW_WEBHOOK_SECRET;

  return { url: url.replace(/\/$/, ""), secret };
}

async function callBotApi(path: string, init?: RequestInit) {
  const { url, secret } = botApiConfig();

  if (!secret) {
    return { error: "OPENCLAW_BOT_API_SECRET/OPENCLAW_WEBHOOK_SECRET belum diisi." };
  }

  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-openclaw-bot-secret": secret,
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return { error: payload?.error ?? `Bot API gagal: ${response.status}` };
  }

  return payload;
}

export async function GET() {
  try {
    const access = await getBusinessForRequest();
    const business = access?.business;

    if (!business) {
      return jsonError("Business tidak ditemukan.", 404);
    }

    const payload = await callBotApi(`/sessions/${business.slug}`);

    return jsonOk({
      businessSlug: business.slug,
      session: "error" in payload ? null : payload.session,
      botError: "error" in payload ? payload.error : null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const access = await getBusinessForRequest();
    const business = access?.business;

    if (!business) {
      return jsonError("Business tidak ditemukan.", 404);
    }

    if (access?.role === "VIEWER") {
      return jsonError("Akun tamu hanya dapat melihat status WhatsApp.", 403);
    }

    const webhookUrl =
      process.env.NEXT_WEBHOOK_URL ??
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/webhooks/openclaw`;
    const webhookSecret = process.env.OPENCLAW_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return jsonError("OPENCLAW_WEBHOOK_SECRET belum diisi.", 500);
    }

    const body = await request.json().catch(() => ({}));
    const reset = body?.reset === true;

    const payload = await callBotApi("/sessions", {
      method: "POST",
      body: JSON.stringify({
        businessSlug: business.slug,
        webhookUrl,
        webhookSecret,
        reset,
      }),
    });

    if ("error" in payload) {
      return jsonError(payload.error, 502);
    }

    return jsonOk({ businessSlug: business.slug, session: payload.session });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    return handleRouteError(error);
  }
}

export async function DELETE() {
  try {
    const access = await getBusinessForRequest();
    const business = access?.business;

    if (!business) {
      return jsonError("Business tidak ditemukan.", 404);
    }

    if (access?.role === "VIEWER") {
      return jsonError("Akun tamu tidak dapat memutus koneksi WhatsApp.", 403);
    }

    const payload = await callBotApi(`/sessions/${business.slug}`, {
      method: "DELETE",
    });

    if ("error" in payload) {
      return jsonError(payload.error, 502);
    }

    return jsonOk({ businessSlug: business.slug, session: payload.session });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }

    return handleRouteError(error);
  }
}
