"use client";

import { Archive, Pencil, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ProductActions({
  productId,
  productName,
  isActive,
  showEdit = true,
  readOnly = false,
}: {
  productId: string;
  productName: string;
  isActive: boolean;
  showEdit?: boolean;
  readOnly?: boolean;
}) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  if (readOnly) {
    return <span className="text-xs font-medium text-muted-foreground">Hanya lihat</span>;
  }

  async function updateProductStatus(nextActive: boolean) {
    const confirmed = nextActive
      ? true
      : window.confirm(
          `Nonaktifkan ${productName}? Produk akan hilang dari katalog dan tidak ditawarkan chatbot, tapi riwayat order tetap aman.`,
        );

    if (!confirmed) {
      return;
    }

    try {
      setIsPending(true);

      const response = await fetch(`/api/products/${productId}`, {
        method: nextActive ? "PATCH" : "DELETE",
        headers: nextActive ? { "Content-Type": "application/json" } : undefined,
        body: nextActive ? JSON.stringify({ is_active: true }) : undefined,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Gagal mengubah status produk.");
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Gagal mengubah status produk.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showEdit ? (
        <Link href={`/dashboard/products/${productId}/edit`}>
          <Button size="sm" variant="outline">
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </Button>
        </Link>
      ) : null}
      {isActive ? (
        <Button
          size="sm"
          variant="danger"
          disabled={isPending}
          onClick={() => updateProductStatus(false)}
        >
          <Archive className="h-4 w-4" aria-hidden />
          {isPending ? "Memproses" : "Hapus dari katalog"}
        </Button>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() => updateProductStatus(true)}
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          {isPending ? "Memproses" : "Aktifkan lagi"}
        </Button>
      )}
    </div>
  );
}
