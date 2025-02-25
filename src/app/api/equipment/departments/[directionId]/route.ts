// src/app/api/equipment/departments/[directionId]/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest, { params } : { params: Promise<{ directionId: string }> }) {
  const { directionId } = await params;

  try {
    if (!directionId) return NextResponse.json([], { status: 200 });
    const departments = await db.department.findMany({
      where: {
        direction_id: directionId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(departments || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}