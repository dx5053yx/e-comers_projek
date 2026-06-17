import { PageHeader } from "@/components/dashboard/page-header";
import { BusinessSettingsForm } from "@/components/dashboard/business-settings-form";
import { DeleteAccountCard } from "@/components/dashboard/delete-account-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentBusinessAccess, isDemoMode } from "@/lib/data/queries";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountError?: string }>;
}) {
  const [access, user, params] = await Promise.all([
    getCurrentBusinessAccess(),
    getCurrentUser(),
    searchParams,
  ]);
  const business = access.business;
  const readOnly = access.role === "VIEWER";

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Profil bisnis, instruksi pembayaran, dan status konfigurasi." />
      <Card>
        <CardHeader>
          <CardTitle>Edit profil bisnis</CardTitle>
        </CardHeader>
        <CardContent>
          {business ? (
            <BusinessSettingsForm business={business} readOnly={readOnly} />
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
      <DeleteAccountCard
        errorMessage={params.accountError}
        readOnly={readOnly}
        userEmail={user?.email}
      />
    </div>
  );
}
