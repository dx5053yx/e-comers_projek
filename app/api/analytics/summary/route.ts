import { jsonOk } from "@/lib/api";
import { getDashboardSummary, isDemoMode } from "@/lib/data/queries";

export async function GET() {
  const summary = await getDashboardSummary();

  return jsonOk({ ...summary.stats, demo: isDemoMode() });
}
