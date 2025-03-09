// // src/app/api/notifications/mark-read/[id]/route.ts
// import { NextResponse } from "next/server";
// import { NotificationService } from "@/lib/notifications";

// export async function PATCH(request: Request, { params }: { params: { id: string } }) {
//   try {
//     const { id } = params;
//     const notification = await NotificationService.markAsRead(id);
//     return NextResponse.json(notification, { status: 200 });
//   } catch (error) {
//     console.error("Error marking notification as read:", error);
//     return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 });
//   }
// }


// src/app/api/notifications/mark-read/[id]/route.ts
import { NextResponse } from "next/server";
import { NotificationService } from "@/lib/notifications";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const notification = await NotificationService.markAsRead(id);
    return NextResponse.json(notification, { status: 200 });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 });
  }
}