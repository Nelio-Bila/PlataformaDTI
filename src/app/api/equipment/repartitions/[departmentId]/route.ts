import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { departmentId: string } }) {
  const  departmentId  = (await params).departmentId;

  try {
    if (!departmentId) return NextResponse.json([], { status: 200 });
    const repartitions = await db.repartition.findMany({
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
    return NextResponse.json(repartitions || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching repartitions:", error);
    return NextResponse.json({ error: "Failed to fetch repartitions" }, { status: 500 });
  }
}