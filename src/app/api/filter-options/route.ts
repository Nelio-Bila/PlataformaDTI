import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [types, statuses, directions, departments] = await Promise.all([
      db.equipment
        .findMany({ distinct: ["type"], select: { type: true } })
        .then((res) => res.map((r) => r.type).filter(Boolean)),
      db.equipment
        .findMany({ distinct: ["status"], select: { status: true } })
        .then((res) => res.map((r) => r.status).filter(Boolean)),
      db.direction.findMany({ select: { id: true, name: true } }),
      db.department.findMany({ select: { id: true, name: true, direction_id: true } }),
    ]);

    return NextResponse.json({ types, statuses, directions, departments });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json({ error: "Failed to fetch filter options" }, { status: 500 });
  }
}