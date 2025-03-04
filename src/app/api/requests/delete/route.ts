// src/app/api/requests/delete/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid or empty IDs array" }, { status: 400 });
    }

    await db.request.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, message: "Requests deleted successfully" });
  } catch (error) {
    console.error("Error deleting requests:", error);
    return NextResponse.json({ error: "Failed to delete requests" }, { status: 500 });
  }
}