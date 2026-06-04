import { jsonOk } from "@/lib/api";
import { getReviews, isDemoMode } from "@/lib/data/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reviews = await getReviews(searchParams.get("businessId") ?? undefined);

  return jsonOk({ reviews, demo: isDemoMode() });
}
