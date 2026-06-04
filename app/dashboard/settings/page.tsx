import { PageHeader } from "@/components/dashboard/page-header";
import { BusinessSettingsForm } from "@/components/dashboard/business-settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentBusiness, isDemoMode } from "@/lib/data/queries";

export default async function SettingsPage() {
  const business = await getCurrentBusiness();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Profil bisnis, instruksi pembayaran, dan status konfigurasi." />
      <Card>
        <CardHeader>
          <CardTitle>Edit profil bisnis</CardTitle>
        </CardHeader>
        <CardContent>
          {business ? (
            <BusinessSettingsForm business={business} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Belum ada bisnis. Daftar ulang atau buat business profile terlebih dahulu.
            </p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Mode data: {isDemoMode() ? "Demo fallback" : "Supabase"}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
