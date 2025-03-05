// src/app/api/requests/approve/[id]/route.ts
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NotificationService } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const request = await db.request.findUnique({
      where: { id },
      include: { requester: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status !== "PENDING") {
      return NextResponse.json({ error: "Request is not pending approval" }, { status: 400 });
    }

    const updatedRequest = await db.request.update({
      where: { id },
      data: {
        status: "APPROVED",
        approved_by: session.user.id,
      },
    });

    // Notify destination group (e.g., based on destination_department_id)
    if (request.destination_department_id) {
      const destinationGroup = await db.group.findFirst({
        where: { name: "DestinationHandlers" }, // Adjust group name as needed
      });
      if (destinationGroup) {
        await NotificationService.createNotification({
          type: "RequestApproved",
          notifiableId: destinationGroup.id,
          notifiableType: "Group",
          data: {
            requestId: updatedRequest.id,
            requestNumber: updatedRequest.request_number,
            message: `Request ${updatedRequest.request_number} has been approved and requires your action.`,
          },
        });
      }
    }

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error("Error approving request:", error);
    return NextResponse.json({ error: "Failed to approve request" }, { status: 500 });
  }
}