// src/app/api/request-filter-options/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [requestTypes, requestStatuses, directions, departments] = await Promise.all([
      // Request Types
      db.request
        .findMany({ distinct: ["type"], select: { type: true } })
        .then((res) => res.map((r) => r.type).filter(Boolean)),
      // Request Statuses
      db.request
        .findMany({ distinct: ["status"], select: { status: true } })
        .then((res) => res.map((r) => r.status).filter(Boolean)),
      // Directions
      db.direction.findMany({ select: { id: true, name: true } }),
      // Departments
      db.department.findMany({ select: { id: true, name: true, direction_id: true } }),
    ]);

    return NextResponse.json({
      requestTypes,
      requestStatuses,
      directions,
      departments,
    });
  } catch (error) {
    console.error("Error fetching request filter options:", error);
    return NextResponse.json({ error: "Failed to fetch request filter options" }, { status: 500 });
  }
}