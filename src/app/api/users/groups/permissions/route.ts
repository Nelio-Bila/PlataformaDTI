import { NextResponse } from 'next/server';

// src/app/api/permissions/route.ts
import { auth } from '@/auth';
import { checkAdminPermission } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET() {
  // Check authentication and admin permissions
  const session = await auth();
  const permissionCheck = checkAdminPermission(session);
  if (permissionCheck) {
    return permissionCheck;
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
  // Check authentication and admin permissions
  const session = await auth();
  const permissionCheck = checkAdminPermission(session);
  if (permissionCheck) {
    return permissionCheck;
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