"use client";

import { Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form";

export function PaymentProofForm({ orderId }: { orderId: string }) {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setMessage("Mengirim bukti pembayaran...");
        const response = await fetch(`/api/orders/${orderId}/payment-proof`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proof_url: form.get("proof_url"),
            note: form.get("note"),
          }),
        });

        setMessage(response.ok ? "Bukti pembayaran terkirim." : "Gagal mengirim bukti pembayaran.");
      }}
    >
      {message ? (
        <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
          {message}
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="proof_url">URL bukti pembayaran</Label>
        <Input id="proof_url" name="proof_url" type="url" placeholder="https://..." required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="note">Catatan</Label>
        <Textarea id="note" name="note" />
      </div>
      <Button type="submit">
        <Upload className="h-4 w-4" aria-hidden />
        Kirim bukti bayar
      </Button>
    </form>
  );
}
