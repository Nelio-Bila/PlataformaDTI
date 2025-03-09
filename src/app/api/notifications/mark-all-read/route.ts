// src/app/api/notifications/mark-all-read/route.ts
import { auth } from "@/auth";
import { NotificationService } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function PATCH() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await NotificationService.markAllAsRead(session.user.id, "User");
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 });
  }
}