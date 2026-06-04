import { PageHeader } from "@/components/dashboard/page-header";
import { WhatsAppConnectionPanel } from "@/components/dashboard/whatsapp-connection-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentBusiness } from "@/lib/data/queries";

export default async function WhatsAppPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <EmptyState
        title="Bisnis belum dibuat"
        description="Buat profil bisnis dulu sebelum menghubungkan WhatsApp."
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="WhatsApp"
        description="Hubungkan nomor WhatsApp bisnis, scan QR, dan atur gaya balasan AI."
      />
      <WhatsAppConnectionPanel business={business} />
    </div>
  );
}
