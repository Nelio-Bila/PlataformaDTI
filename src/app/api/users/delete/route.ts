import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids } = await request.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Invalid or empty IDs array" }, { status: 400 });
  }

  try {
    await db.user.deleteMany({
      where: { id: { in: ids } },
    });
    return NextResponse.json({ message: "Users deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting users:", error);
    return NextResponse.json({ error: "Failed to delete users" }, { status: 500 });
  }
}