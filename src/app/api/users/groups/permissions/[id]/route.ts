import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const permission = await db.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      return NextResponse.json({ error: "Permission not found" }, { status: 404 });
    }
    return NextResponse.json(permission, { status: 200 });
  } catch (error) {
    console.error("Error fetching permission:", error);
    return NextResponse.json({ error: "Failed to fetch permission" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, description } = await request.json();

  try {
    const permission = await db.permission.update({
      where: { id },
      data: { name, description },
    });
    return NextResponse.json(permission, { status: 200 });
  } catch (error) {
    console.error("Error updating permission:", error);
    return NextResponse.json({ error: "Failed to update permission" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.permission.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Permission deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting permission:", error);
    return NextResponse.json({ error: "Failed to delete permission" }, { status: 500 });
  }
}