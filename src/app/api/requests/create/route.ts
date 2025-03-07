// src/app/api/requests/create/route.ts

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NotificationService } from "@/lib/notifications";
import { NextResponse } from "next/server";

type RequestType = "REQUISITION" | "RETURN" | "SUBSTITUTION";

export async function POST(request: Request) {
  const session = await auth(); // Session is optional now

  const formData = await request.formData();
  const type = formData.get("type") as string;
  const requester_name = formData.get("requester_name") as string;
  const itemsJson = formData.get("items") as string;

  const items = JSON.parse(itemsJson) as Array<{ description: string; quantity: number; unit?: string }>;

  // Validate required fields
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

    // Create the request, setting requester_id to session.user.id if authenticated, null otherwise
    const newRequest = await db.request.create({
      data: {
        request_number,
        type: type as RequestType,
        requester_name,
        requester_id: session?.user?.id || null, // Nullable for unauthenticated users
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

    // Collect destination entity IDs
    const destinationIds = {
      direction: formData.get("destination_direction_id") as string | undefined,
      department: formData.get("destination_department_id") as string | undefined,
      service: formData.get("destination_service_id") as string | undefined,
      sector: formData.get("destination_sector_id") as string | undefined,
      repartition: formData.get("destination_repartition_id") as string | undefined,
    };

    // Fetch names of destination entities
    const destinationEntities = await Promise.all([
      destinationIds.direction
        ? db.direction.findUnique({ where: { id: destinationIds.direction }, select: { name: true } })
        : null,
      destinationIds.department
        ? db.department.findUnique({ where: { id: destinationIds.department }, select: { name: true } })
        : null,
      destinationIds.service
        ? db.service.findUnique({ where: { id: destinationIds.service }, select: { name: true } })
        : null,
      destinationIds.sector
        ? db.sector.findUnique({ where: { id: destinationIds.sector }, select: { name: true } })
        : null,
      destinationIds.repartition
        ? db.repartition.findUnique({ where: { id: destinationIds.repartition }, select: { name: true } })
        : null,
    ]);

    // Map entity types to their group names and filter out nulls
    const entityNames = [
      destinationEntities[0] ? `Direction: ${destinationEntities[0].name}` : null,
      destinationEntities[1] ? `Department: ${destinationEntities[1].name}` : null,
      destinationEntities[2] ? `Service: ${destinationEntities[2].name}` : null,
      destinationEntities[3] ? `Sector: ${destinationEntities[3].name}` : null,
      destinationEntities[4] ? `Repartition: ${destinationEntities[4].name}` : null,
    ].filter(Boolean) as string[];

    // Fetch groups corresponding to destination entities
    const destinationGroups = entityNames.length
      ? await db.group.findMany({
          where: {
            name: { in: entityNames },
          },
          include: {
            users: {
              select: {
                user: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        })
      : [];

    // Fetch the Approvers group
    const approverGroup = await db.group.findFirst({
      where: { name: "Approvers" },
      include: {
        users: {
          select: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Collect all users to notify (from destination groups and Approvers)
    const usersToNotify = new Map<string, { id: string; name: string | null; groupName: string }>();

    // Add users from destination groups
    destinationGroups.forEach((group) => {
      group.users.forEach((userGroup) => {
        usersToNotify.set(userGroup.user.id, {
          id: userGroup.user.id,
          name: userGroup.user.name,
          groupName: group.name,
        });
      });
    });

    // Add users from Approvers group
    if (approverGroup) {
      approverGroup.users.forEach((userGroup) => {
        usersToNotify.set(userGroup.user.id, {
          id: userGroup.user.id,
          name: userGroup.user.name,
          groupName: approverGroup.name,
        });
      });
    }

    // Create notifications for each user (only if there are users to notify)
    if (usersToNotify.size > 0) {
      const notificationPromises = Array.from(usersToNotify.values()).map((user) => {
        const isApprover = user.groupName === "Approvers";
        return NotificationService.createNotification({
          type: "RequestCreated",
          notifiableId: user.id,
          notifiableType: "User",
          data: {
            requestId: newRequest.id,
            requestNumber: newRequest.request_number,
            requesterName: requester_name,
            message: isApprover
              ? `A new ${type.toLowerCase()} request (${request_number}) requires your approval.`
              : `A new ${type.toLowerCase()} request (${request_number}) has been created for your group (${user.groupName}).`,
          },
        });
      });

      // Execute all notifications concurrently
      await Promise.all(notificationPromises);
    }

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}