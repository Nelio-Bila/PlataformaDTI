// src/app/api/requests/accept/[id]/route.ts
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NotificationService } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const request = await db.request.findUnique({
      where: { id },
      include: { requester: true, approver: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status !== "APPROVED") {
      return NextResponse.json({ error: "Request is not approved yet" }, { status: 400 });
    }

    const updatedRequest = await db.request.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    // Notify requester
    if (request.requester_id) {
      await NotificationService.createNotification({
        type: "RequestAccepted",
        notifiableId: request.requester_id,
        notifiableType: "User",
        data: {
          requestId: updatedRequest.id,
          requestNumber: updatedRequest.request_number,
          message: `Your request ${updatedRequest.request_number} has been accepted.`,
        },
      });
    }

    // Notify approver
    if (request.approved_by) {
      await NotificationService.createNotification({
        type: "RequestAccepted",
        notifiableId: request.approved_by,
        notifiableType: "User",
        data: {
          requestId: updatedRequest.id,
          requestNumber: updatedRequest.request_number,
          message: `Request ${updatedRequest.request_number} you approved has been accepted.`,
        },
      });
    }

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error("Error accepting request:", error);
    return NextResponse.json({ error: "Failed to accept request" }, { status: 500 });
  }
}