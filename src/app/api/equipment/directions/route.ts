import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const directions = await db.direction.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(directions || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching directions:", error);
    return NextResponse.json({ error: "Failed to fetch directions" }, { status: 500 });
  }
}