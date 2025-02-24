import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const directionId = searchParams.get("directionId");
  const departmentId = searchParams.get("departmentId");

  try {
    let whereClause = {};
    if (departmentId) {
      whereClause = { department_id: departmentId };
    } else if (directionId) {
      whereClause = {
        department: {
          direction_id: directionId,
        },
      };
    }

    const services = await db.service.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        department_id: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(services || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}