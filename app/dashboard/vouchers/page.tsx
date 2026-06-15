import { PageHeader } from "@/components/dashboard/page-header";
import { VoucherManager } from "@/components/vouchers/voucher-manager";
import { getCurrentBusinessAccess, getVouchers } from "@/lib/data/queries";

export default async function VouchersPage() {
  const access = await getCurrentBusinessAccess();
  const business = access.business;
  const vouchers = await getVouchers(business?.id);

  if (!business) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promo & voucher"
        description="Buat voucher diskon dan promo beli X gratis Y. Promo aktif otomatis dipakai AI saat order memenuhi syarat."
      />
      <VoucherManager
        businessId={business.id}
        vouchers={vouchers}
        readOnly={access.role === "VIEWER"}
      />
    </div>
  );
}
