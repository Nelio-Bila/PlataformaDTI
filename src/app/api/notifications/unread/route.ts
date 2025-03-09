// src/app/api/notifications/unread/route.ts
import { auth } from "@/auth";
import { NotificationService } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await NotificationService.getUnreadNotifications(session.user.id, "User");
    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}