import { demoBusiness } from "@/lib/data/demo";
import { getCurrentBusiness, isDemoMode } from "@/lib/data/queries";
import { jsonOk } from "@/lib/api";

export async function GET() {
  if (isDemoMode()) {
    return jsonOk({ business: demoBusiness, demo: true });
  }

  const business = await getCurrentBusiness();
  return jsonOk({ business, demo: false });
}
