import { MessageCircle, UserCheck, UserPlus, Users } from "lucide-react";
import { CustomerTable } from "@/components/dashboard/customer-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentBusiness, getCustomers } from "@/lib/data/queries";

export default async function CustomersPage() {
  const business = await getCurrentBusiness();
  const customers = await getCustomers(business?.id);
  const withWhatsApp = customers.filter((customer) => customer.whatsapp_number || customer.phone).length;
  const returningCustomers = customers.filter(
    (customer) => customer.segment === "RETURNING" || customer.segment === "LOYAL",
  ).length;
  const stats = [
    { label: "Total customer", value: customers.length, icon: Users },
    { label: "Punya WhatsApp", value: withWhatsApp, icon: MessageCircle },
    { label: "Customer baru", value: customers.filter((item) => item.segment === "NEW").length, icon: UserPlus },
    { label: "Repeat/Loyal", value: returningCustomers, icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer management"
        description="Database pelanggan, nomor WhatsApp, segmentasi, dan riwayat order dalam satu tempat."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
              </div>
              <div className="rounded-md bg-primary/10 p-2.5 text-primary">
                <stat.icon className="h-5 w-5" aria-hidden />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CustomerTable customers={customers} />
    </div>
  );
}
