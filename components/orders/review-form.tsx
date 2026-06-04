"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/form";

export function ReviewForm({ orderCode }: { orderCode: string }) {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setMessage("Mengirim review...");
        const response = await fetch(`/api/orders/${orderCode}/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: form.get("rating"),
            comment: form.get("comment"),
          }),
        });

        setMessage(response.ok ? "Terima kasih, review tersimpan." : "Gagal menyimpan review.");
      }}
    >
      {message ? (
        <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
          {message}
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="rating">Rating</Label>
        <Select id="rating" name="rating" defaultValue="5">
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="comment">Komentar</Label>
        <Textarea id="comment" name="comment" />
      </div>
      <Button type="submit">
        <Star className="h-4 w-4" aria-hidden />
        Kirim review
      </Button>
    </form>
  );
}
