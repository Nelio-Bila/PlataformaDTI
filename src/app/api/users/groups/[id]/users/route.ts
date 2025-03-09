// src/app/api/groups/[id]/users/route.ts
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const group = await db.group.findUnique({ where: { id } });
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!group || !user) {
      return NextResponse.json({ error: "Group or User not found" }, { status: 404 });
    }

    await db.userGroup.create({
      data: {
        group_id: id,
        user_id: userId,
      },
    });

    return NextResponse.json({ message: "User added to group successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error adding user to group:", error);
    return NextResponse.json({ error: "Failed to add user to group" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params; // Group ID
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    await db.userGroup.delete({
      where: {
        user_id_group_id: {
          user_id: userId,
          group_id: id,
        },
      },
    });

    return NextResponse.json({ message: "User removed from group successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error removing user from group:", error);
    return NextResponse.json({ error: "Failed to remove user from group" }, { status: 500 });
  }
}