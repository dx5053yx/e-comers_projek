import { jsonOk } from "@/lib/api";
import { salesSeries } from "@/lib/data/demo";
import { isDemoMode } from "@/lib/data/queries";

export async function GET() {
  return jsonOk({ sales: salesSeries, demo: isDemoMode() });
}
