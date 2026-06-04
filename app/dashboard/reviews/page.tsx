import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { getCurrentBusiness, getReviews } from "@/lib/data/queries";
import { formatDate } from "@/lib/utils";

export default async function ReviewsPage() {
  const business = await getCurrentBusiness();
  const reviews = await getReviews(business?.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Review & feedback" description="Rating customer dan komentar order." />
      <Card>
        <CardContent className="p-0">
          <div className="table-scroll border-0">
            <Table>
              <thead>
                <tr>
                  <Th>Customer</Th>
                  <Th>Order</Th>
                  <Th>Rating</Th>
                  <Th>Komentar</Th>
                  <Th>Status</Th>
                  <Th>Tanggal</Th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <Td>{review.customer?.name ?? "-"}</Td>
                    <Td>{review.order?.order_code ?? "-"}</Td>
                    <Td>{review.rating}/5</Td>
                    <Td>{review.comment ?? "-"}</Td>
                    <Td><Badge tone={review.is_visible ? "green" : "gray"}>{review.is_visible ? "Visible" : "Hidden"}</Badge></Td>
                    <Td>{formatDate(review.created_at)}</Td>
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
