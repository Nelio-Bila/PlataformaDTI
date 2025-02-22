// app/api/test-equipment/route.ts
import { fetch_equipment } from "@/actions/equipment";

export async function GET() {
  const result = await fetch_equipment({ page: 0, page_size: 10 });
  return Response.json(result);
}