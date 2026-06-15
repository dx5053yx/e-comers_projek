"use client";

/* eslint-disable @next/next/no-img-element, react-hooks/set-state-in-effect */

import { Power, QrCode, RefreshCw, RotateCcw, Save, Unplug } from "lucide-react";
import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/form";
import type { Business } from "@/lib/types";

type SessionStatus = {
  businessSlug: string;
  status: "connecting" | "qr" | "connected" | "disconnected" | "logged_out" | "stopped";
  qr?: string | null;
  phone?: string | null;
  error?: string | null;
};

type StatusResponse = {
  businessSlug: string;
  session: SessionStatus | null;
  botError?: string | null;
};

const defaultPrompt =
  "Default: AI membalas seperti admin toko yang ramah sekaligus sales. Setelah menjawab pertanyaan, AI boleh menawarkan produk ready, bantu pilih menu, tanya jumlah, dan mengarahkan customer ke order secara halus. Tetap wajib menjaga fakta produk, harga, stok, order, pembayaran, dan QRIS.";

export function WhatsAppConnectionPanel({
  business,
  readOnly = false,
}: {
  business: Business;
  readOnly?: boolean;
}) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [prompt, setPrompt] = useState(business.whatsapp_ai_prompt ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const autoStartRef = useRef(false);

  const session = status?.session;
  const isConnected = session?.status === "connected";
  const isPreparingQr = session?.status === "connecting" || session?.status === "qr";
  const statusLabel = useMemo(() => {
    if (status?.botError) {
      return "Bot service belum aktif";
    }

    if (!session) {
      return "Belum terhubung";
    }

    const labels: Record<string, string> = {
      connecting: "Menyiapkan QR",
      qr: "Menunggu scan QR",
      connected: "Terhubung",
      disconnected: "Terputus",
      logged_out: "Logout",
      stopped: "Berhenti",
    };

    return labels[session.status] ?? session.status;
  }, [session, status?.botError]);

  async function loadStatus() {
    const response = await fetch("/api/whatsapp/session");
    const payload = (await response.json().catch(() => null)) as StatusResponse | null;

    if (payload) {
      setStatus(payload);
    }
  }

  const connect = useCallback(async ({ automatic = false }: { automatic?: boolean } = {}) => {
    setIsConnecting(true);
    setMessage(automatic ? "Menyiapkan QR WhatsApp otomatis..." : "Menyiapkan QR WhatsApp...");

    try {
      const response = await fetch("/api/whatsapp/session", { method: "POST" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(payload?.error ?? "Gagal menyiapkan QR WhatsApp.");
        return;
      }

      setStatus(payload);
      setMessage(payload?.session?.qr ? "QR siap. Scan dari WhatsApp bisnis." : "QR sedang dibuat, tunggu sebentar ya.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const resetQr = useCallback(async () => {
    setIsResetting(true);
    setQrDataUrl(null);
    setMessage("Mereset session lama dan menyiapkan QR baru...");

    try {
      const response = await fetch("/api/whatsapp/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(payload?.error ?? "Gagal reset QR WhatsApp.");
        return;
      }

      setStatus(payload);
      setMessage(payload?.session?.qr ? "QR baru siap. Scan dari WhatsApp bisnis." : "Session lama direset. QR sedang dibuat, tunggu sebentar.");
    } finally {
      setIsResetting(false);
    }
  }, []);

  async function disconnect() {
    setIsDisconnecting(true);
    setMessage("Memutus koneksi WhatsApp...");

    try {
      const response = await fetch("/api/whatsapp/session", { method: "DELETE" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(payload?.error ?? "Gagal memutus koneksi WhatsApp.");
        return;
      }

      setStatus(payload);
      setMessage("Koneksi WhatsApp diputus.");
    } finally {
      setIsDisconnecting(false);
    }
  }

  async function savePrompt() {
    setIsSavingPrompt(true);
    setMessage("Menyimpan gaya balasan AI...");

    try {
      const response = await fetch(`/api/businesses/${business.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp_ai_prompt: prompt.trim() || null,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(payload?.error ?? "Gagal menyimpan prompt.");
        return;
      }

      setMessage("Prompt AI tersimpan.");
    } finally {
      setIsSavingPrompt(false);
    }
  }

  useEffect(() => {
    loadStatus().catch(() => null);
    const interval = window.setInterval(() => {
      loadStatus().catch(() => null);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (readOnly || !status || status.botError || status.session || autoStartRef.current) {
      return;
    }

    autoStartRef.current = true;
    connect({ automatic: true }).catch((error) => {
      setMessage(error instanceof Error ? error.message : "Gagal menyiapkan QR WhatsApp.");
    });
  }, [connect, readOnly, status]);

  useEffect(() => {
    if (!session?.qr) {
      setQrDataUrl(null);
      return;
    }

    QRCode.toDataURL(session.qr, {
      margin: 1,
      width: 280,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [session?.qr]);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-md border border-border bg-card p-4 sm:p-5">
        {readOnly ? (
          <div className="mb-4 rounded-md border border-amber-300/70 bg-amber-100/70 px-3 py-2 text-sm text-amber-950">
            Status WhatsApp dapat dilihat, tetapi koneksi dan prompt tidak dapat diubah oleh akun
            tamu.
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Nomor WhatsApp bisnis</p>
            <p className="mt-1 break-all text-lg font-semibold">{business.whatsapp_number ?? "Belum diisi"}</p>
          </div>
          <div className="w-full rounded-md border border-border px-3 py-2 text-sm sm:w-auto">
            <span className="text-muted-foreground">Status: </span>
            <span className={isConnected ? "font-semibold text-primary" : "font-semibold"}>
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[280px_1fr]">
          <div className="flex min-h-[240px] items-center justify-center rounded-md border border-border bg-muted/30 p-3 sm:min-h-[280px] sm:p-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR WhatsApp"
                className="aspect-square w-full max-w-[260px]"
              />
            ) : (
              <div className="grid justify-items-center gap-3 text-center text-sm text-muted-foreground">
                {isPreparingQr ? (
                  <RefreshCw className="h-10 w-10 animate-spin text-primary" aria-hidden />
                ) : (
                  <QrCode className="h-10 w-10" aria-hidden />
                )}
                {status?.botError
                  ? `Bot service belum bisa diakses: ${status.botError}`
                  : isConnected
                    ? "WhatsApp sudah terhubung."
                    : isPreparingQr
                      ? "QR sedang disiapkan, tunggu sebentar."
                      : "QR akan disiapkan otomatis. Klik Hubungkan kalau belum muncul."}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Slug otomatis</p>
              <p className="mt-1 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                {business.slug}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Slug ini diambil otomatis dari toko, jadi seller tidak perlu isi env.
              </p>
            </div>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <Button className="w-full sm:w-auto" disabled={readOnly || isConnecting || isConnected} onClick={() => connect()} type="button">
                {isConnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Power className="h-4 w-4" aria-hidden />
                )}
                Hubungkan
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={readOnly || isConnecting || isResetting}
                onClick={resetQr}
                type="button"
                variant="outline"
              >
                {isResetting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <RotateCcw className="h-4 w-4" aria-hidden />
                )}
                Reset QR
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={readOnly || isDisconnecting || !session}
                onClick={disconnect}
                type="button"
                variant="secondary"
              >
                <Unplug className="h-4 w-4" aria-hidden />
                Putuskan
              </Button>
            </div>

            <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              Scan QR dari WhatsApp bisnis: Linked devices &gt; Link a device.
            </div>

            {message ? (
              <div className="rounded-md border border-border bg-background px-3 py-2 text-sm">
                {message}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-4 sm:p-5">
        <div className="space-y-2">
          <Label htmlFor="whatsapp_ai_prompt">Custom prompt AI</Label>
          <Textarea
            id="whatsapp_ai_prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={defaultPrompt}
            rows={12}
            disabled={readOnly}
          />
          <p className="text-xs text-muted-foreground">
            Kosongkan untuk memakai gaya default. Isi bagian ini kalau toko ingin gaya balasan tertentu,
            misalnya lebih santai, pakai sapaan khusus, atau aturan kata yang harus dihindari.
          </p>
        </div>
        <Button
          className="mt-4 w-full"
          disabled={readOnly || isSavingPrompt}
          onClick={savePrompt}
          type="button"
        >
          {isSavingPrompt ? (
            <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          Simpan prompt
        </Button>
      </section>
    </div>
  );
}
