// src/app/api/requests/create/route.ts
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NotificationService } from "@/lib/notifications";
import { NextResponse } from "next/server";

type RequestType = "REQUISITION" | "RETURN" | "SUBSTITUTION";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const type = formData.get("type") as string;
  const requester_name = formData.get("requester_name") as string;
  const itemsJson = formData.get("items") as string;

  const items = JSON.parse(itemsJson) as Array<{ description: string; quantity: number; unit?: string }>;

  if (!type || !requester_name || !items || items.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const validTypes: RequestType[] = ["REQUISITION", "RETURN", "SUBSTITUTION"];
  if (!validTypes.includes(type as RequestType)) {
    return NextResponse.json(
      { error: "Invalid request type. Must be one of: REQUISITION, RETURN, SUBSTITUTION." },
      { status: 400 }
    );
  }

  try {
    const requestCount = await db.request.count();
    const request_number = `REQ-${String(requestCount + 1).padStart(6, "0")}`;

    const newRequest = await db.request.create({
      data: {
        request_number,
        type: type as RequestType,
        requester_name,
        requester_id: session.user.id,
        items: {
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
          })),
        },
        requester_direction_id: formData.get("requester_direction_id") as string | undefined,
        requester_department_id: formData.get("requester_department_id") as string | undefined,
        requester_service_id: formData.get("requester_service_id") as string | undefined,
        requester_sector_id: formData.get("requester_sector_id") as string | undefined,
        requester_repartition_id: formData.get("requester_repartition_id") as string | undefined,
        destination_direction_id: formData.get("destination_direction_id") as string | undefined,
        destination_department_id: formData.get("destination_department_id") as string | undefined,
        destination_service_id: formData.get("destination_service_id") as string | undefined,
        destination_sector_id: formData.get("destination_sector_id") as string | undefined,
        destination_repartition_id: formData.get("destination_repartition_id") as string | undefined,
      },
      include: {
        items: true,
      },
    });

    // Notify the approver (assuming approver group is "Approvers")
    const approverGroup = await db.group.findFirst({ where: { name: "Approvers" } });
    if (approverGroup) {
      await NotificationService.createNotification({
        type: "RequestCreated",
        notifiableId: approverGroup.id,
        notifiableType: "Group",
        data: {
          requestId: newRequest.id,
          requestNumber: newRequest.request_number,
          requesterName: requester_name,
          message: `A new ${type.toLowerCase()} request (${request_number}) requires your approval.`,
        },
      });
    }

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}