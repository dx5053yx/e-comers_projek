import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getCurrentBusiness, getCustomers } from "@/lib/data/queries";
import { formatDate } from "@/lib/utils";

export default async function CustomersPage() {
  const business = await getCurrentBusiness();
  const customers = await getCustomers(business?.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Customer management" description="Database pelanggan, nomor WhatsApp, segmentasi, dan riwayat order." />
      <Card>
        <CardContent className="p-0">
          <div className="table-scroll border-0">
            <Table>
              <thead>
                <tr>
                  <Th>Nama</Th>
                  <Th>WhatsApp</Th>
                  <Th>Email</Th>
                  <Th>Segment</Th>
                  <Th>Dibuat</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <Td className="font-medium">{customer.name ?? "Customer"}</Td>
                    <Td>{customer.whatsapp_number ?? customer.phone ?? "-"}</Td>
                    <Td>{customer.email ?? "-"}</Td>
                    <Td><Badge tone="blue">{customer.segment}</Badge></Td>
                    <Td>{formatDate(customer.created_at)}</Td>
                    <Td>
                      <Link className="font-medium text-primary" href={`/dashboard/customers/${customer.id}`}>
                        Detail
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
