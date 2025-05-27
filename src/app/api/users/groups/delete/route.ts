import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { checkAdminPermission } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    // Check authentication and admin permissions
    const session = await auth();
    const permissionCheck = checkAdminPermission(session);
    if (permissionCheck) {
      return permissionCheck;
    }

  const { ids } = await request.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Invalid or empty IDs array" }, { status: 400 });
  }

  try {
    await db.group.deleteMany({
      where: { id: { in: ids } },
    });
    return NextResponse.json({ message: "Groups deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting groups:", error);
    return NextResponse.json({ error: "Failed to delete groups" }, { status: 500 });
  }
}