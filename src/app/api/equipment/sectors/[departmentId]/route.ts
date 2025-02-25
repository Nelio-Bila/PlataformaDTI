import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ departmentId: string }> }) {
  const departmentId = (await params).departmentId;
  try {
    if (!departmentId) return NextResponse.json([], { status: 200 });
    const sectors = await db.sector.findMany({
      where: {
        department_id: departmentId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(sectors || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching sectors:", error);
    return NextResponse.json({ error: "Failed to fetch sectors" }, { status: 500 });
  }
}