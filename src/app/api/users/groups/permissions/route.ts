// src/app/api/permissions/route.ts
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const permissions = await db.permission.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(permissions, { status: 200 });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await request.json();

  try {
    const permission = await db.permission.create({
      data: { name, description },
    });
    return NextResponse.json(permission, { status: 201 });
  } catch (error) {
    console.error("Error creating permission:", error);
    return NextResponse.json({ error: "Failed to create permission" }, { status: 500 });
  }
}