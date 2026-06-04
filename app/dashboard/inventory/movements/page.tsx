import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function InventoryMovementsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Riwayat perubahan stok" description="Endpoint /api/inventory/movements sudah siap untuk mencatat movement stok." />
      <EmptyState
        title="Riwayat akan muncul setelah update stok"
        description="Gunakan API movement atau aksi payment verification untuk membuat catatan stok."
      />
    </div>
  );
}
