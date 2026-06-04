import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function VouchersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Promotion / voucher" description="Schema voucher sudah tersedia untuk fixed amount atau percentage discount." />
      <EmptyState
        title="Voucher siap dikembangkan"
        description="Tabel vouchers, constraint kode unik per bisnis, dan field usage sudah ada di migration."
      />
    </div>
  );
}
