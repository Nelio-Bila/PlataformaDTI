// src/app/api/users/route.ts

import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { checkAdminPermission } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  // Check authentication and admin permissions
  const session = await auth();
  const permissionCheck = checkAdminPermission(session);
  if (permissionCheck) {
    return permissionCheck;
  }

  // Fetch user's groups and permissions
  const userGroups = await db.userGroup.findMany({
    where: { user_id: session?.user.id },
    include: {
      group: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });

  const permissions = userGroups.flatMap(ug => ug.group.permissions.map(gp => gp.permission.name));
  if (!permissions.includes("user:read")) {
    return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";

  try {
    const users = await db.user.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
      include: { groups: { include: { group: true } } },
      skip: page * pageSize,
      take: pageSize,
      orderBy: { created_at: "desc" },
    });

    const total = await db.user.count({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
    });

    return NextResponse.json({ data: users, total }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check for user:create permission
  const userGroups = await db.userGroup.findMany({
    where: { user_id: session.user.id },
    include: {
      group: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });

  const permissions = userGroups.flatMap(ug => ug.group.permissions.map(gp => gp.permission.name));
  if (!permissions.includes("user:create")) {
    return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
  }

  const { name, email, password, groupIds } = await request.json();

  try {
    const hashedPassword = await hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        groups: groupIds && groupIds.length > 0
          ? {
            create: groupIds.map((groupId: string) => ({
              group_id: groupId,
            })),
          }
          : undefined,
      },
      include: { groups: { include: { group: true } } },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}