import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Check authentication and admin group membership
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user belongs to Admins group
  const userGroups = session.user.groups || [];
  const isAdmin = userGroups.some(group => group.name === "Admins");
  
  if (!isAdmin) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
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