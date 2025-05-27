import { NextResponse } from 'next/server';

// src/app/api/groups/route.ts
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
    const groups = await db.group.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

export async function POST(request: Request) {
    // Check authentication and admin permissions
    const session = await auth();
    const permissionCheck = checkAdminPermission(session);
    if (permissionCheck) {
      return permissionCheck;
    }

  const { name, description, permissionIds } = await request.json();

  try {
    const group = await db.group.create({
      data: {
        name,
        description,
        permissions: {
          create: permissionIds.map((permissionId: string) => ({
            permission_id: permissionId,
          })),
        },
      },
      include: { permissions: { include: { permission: true } } },
    });
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}