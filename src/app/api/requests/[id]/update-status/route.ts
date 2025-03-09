// // src/app/api/requests/[id]/update-status/route.ts
// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import { NextResponse } from "next/server";

// export async function PATCH(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await auth();
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
//     }

//     const { id } = params;
//     const { status } = await request.json();

//     // Validate status
//     const allowedStatuses = [
//       "PENDING",
//       "APPROVED",
//       "REJECTED",
//       "IN_PROGRESS",
//       "COMPLETED",
//       "CANCELLED",
//     ];
//     if (!allowedStatuses.includes(status)) {
//       return NextResponse.json(
//         { error: "Estado inválido" },
//         { status: 400 }
//       );
//     }

//     // Fetch the request with destination entities
//     const requestData = await db.request.findUnique({
//       where: { id },
//       include: {
//         requester: true,
//         destination_direction: true,
//         destination_department: true,
//         destination_service: true,
//         destination_sector: true,
//         destination_repartition: true,
//       },
//     });

//     if (!requestData) {
//       return NextResponse.json(
//         { error: "Requisição não encontrada" },
//         { status: 404 }
//       );
//     }

//     // Check if the user is the requester
//     const isRequester = requestData.requester_id === session.user.id;

//     // If the user is the requester, allow the update
//     if (isRequester) {
//       const updatedRequest = await db.request.update({
//         where: { id },
//         data: {
//           status,
//           updated_at: new Date(),
//         },
//       });
//       return NextResponse.json(updatedRequest, { status: 200 });
//     }

//     // Fetch the user's group memberships
//     const userGroups = await db.userGroup.findMany({
//       where: { user_id: session.user.id },
//       include: { group: true },
//     });

//     const userGroupNames = userGroups.map((ug) => ug.group.name);

//     // Construct destination group names based on entity types
//     const destinationGroupNames = [
//       requestData.destination_direction
//         ? `Direction: ${requestData.destination_direction.name}`
//         : null,
//       requestData.destination_department
//         ? `Department: ${requestData.destination_department.name}`
//         : null,
//       requestData.destination_service
//         ? `Service: ${requestData.destination_service.name}`
//         : null,
//       requestData.destination_sector
//         ? `Sector: ${requestData.destination_sector.name}`
//         : null,
//       requestData.destination_repartition
//         ? `Repartition: ${requestData.destination_repartition.name}`
//         : null,
//     ].filter((name): name is string => !!name); // Filter out null/undefined

//     // Check if the user belongs to any destination group
//     const isDestinationMember = destinationGroupNames.some((groupName) =>
//       userGroupNames.includes(groupName)
//     );

//     if (!isDestinationMember) {
//       return NextResponse.json(
//         { error: "Apenas o solicitante ou membros dos grupos destinatários podem actualizar o estado" },
//         { status: 403 }
//       );
//     }

//     // Update the request status
//     const updatedRequest = await db.request.update({
//       where: { id },
//       data: {
//         status,
//         updated_at: new Date(),
//       },
//     });

//     return NextResponse.json(updatedRequest, { status: 200 });
//   } catch (error) {
//     console.error("Erro ao actualizar o estado da requisição:", error);
//     return NextResponse.json(
//       { error: "Falha ao actualizar o estado da requisição" },
//       { status: 500 }
//     );
//   }
// }


// src/app/api/requests/[id]/update-status/route.ts
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NotificationService } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    // Validate status
    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    // Fetch the request with destination entities
    const requestData = await db.request.findUnique({
      where: { id },
      include: {
        requester: true,
        destination_direction: true,
        destination_department: true,
        destination_service: true,
        destination_sector: true,
        destination_repartition: true,
      },
    });

    if (!requestData) {
      return NextResponse.json(
        { error: "Requisição não encontrada" },
        { status: 404 }
      );
    }

    // Check if the user is the requester
    const isRequester = requestData.requester_id === session.user.id;

    // If the user is the requester, allow the update
    if (isRequester) {
      const updatedRequest = await db.request.update({
        where: { id },
        data: {
          status,
          updated_at: new Date(),
        },
      });
      // Notify involved users (excluding the requester)
      await notifyInvolvedUsers(updatedRequest, session.user.id);
      return NextResponse.json(updatedRequest, { status: 200 });
    }

    // Fetch the user's group memberships
    const userGroups = await db.userGroup.findMany({
      where: { user_id: session.user.id },
      include: { group: true },
    });

    const userGroupNames = userGroups.map((ug) => ug.group.name);

    // Construct destination group names based on entity types
    const destinationGroupNames = [
      requestData.destination_direction
        ? `Direction: ${requestData.destination_direction.name}`
        : null,
      requestData.destination_department
        ? `Department: ${requestData.destination_department.name}`
        : null,
      requestData.destination_service
        ? `Service: ${requestData.destination_service.name}`
        : null,
      requestData.destination_sector
        ? `Sector: ${requestData.destination_sector.name}`
        : null,
      requestData.destination_repartition
        ? `Repartition: ${requestData.destination_repartition.name}`
        : null,
    ].filter((name): name is string => !!name); // Filter out null/undefined

    // Check if the user belongs to any destination group
    const isDestinationMember = destinationGroupNames.some((groupName) =>
      userGroupNames.includes(groupName)
    );

    if (!isDestinationMember) {
      return NextResponse.json(
        { error: "Apenas o solicitante ou membros dos grupos destinatários podem actualizar o estado" },
        { status: 403 }
      );
    }

    // Update the request status
    const updatedRequest = await db.request.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(),
      },
    });

    // Notify involved users (excluding the updating user)
    await notifyInvolvedUsers(updatedRequest, session.user.id);

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error("Erro ao actualizar o estado da requisição:", error);
    return NextResponse.json(
      { error: "Falha ao actualizar o estado da requisição" },
      { status: 500 }
    );
  }
}

// Helper function to notify involved users
async function notifyInvolvedUsers(request: any, updatingUserId: string) {
  // Fetch destination groups
  const destinationGroupNames = [
    request.destination_direction
      ? `Direction: ${request.destination_direction.name}`
      : null,
    request.destination_department
      ? `Department: ${request.destination_department.name}`
      : null,
    request.destination_service
      ? `Service: ${request.destination_service.name}`
      : null,
    request.destination_sector
      ? `Sector: ${request.destination_sector.name}`
      : null,
    request.destination_repartition
      ? `Repartition: ${request.destination_repartition.name}`
      : null,
  ].filter((name): name is string => !!name);

  const destinationGroups = destinationGroupNames.length
    ? await db.group.findMany({
        where: {
          name: { in: destinationGroupNames },
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

  // Collect all involved users (requester and destination group members)
  const usersToNotify = new Map<string, { id: string; name: string | null; groupName: string }>();

  // Add requester (if different from updating user)
  if (request.requester_id && request.requester_id !== updatingUserId) {
    const requester = await db.user.findUnique({
      where: { id: request.requester_id },
      select: { id: true, name: true },
    });
    if (requester) {
      usersToNotify.set(requester.id, {
        id: requester.id,
        name: requester.name,
        groupName: "Solicitante",
      });
    }
  }

  // Add users from destination groups (excluding the updating user)
  destinationGroups.forEach((group) => {
    group.users.forEach((userGroup) => {
      if (userGroup.user.id !== updatingUserId) {
        usersToNotify.set(userGroup.user.id, {
          id: userGroup.user.id,
          name: userGroup.user.name,
          groupName: group.name,
        });
      }
    });
  });

  // Create notifications for each user (only if there are users to notify)
  if (usersToNotify.size > 0) {
    const statusTranslations: Record<string, string> = {
      PENDING: "Pendente",
      APPROVED: "Aprovado",
      REJECTED: "Rejeitado",
      IN_PROGRESS: "Em Progresso",
      COMPLETED: "Concluído",
      CANCELLED: "Cancelado",
    };

    const translatedStatus = statusTranslations[request.status] || request.status;

    const notificationPromises = Array.from(usersToNotify.values()).map((user) => {
      const isRequester = user.groupName === "Solicitante";
      return NotificationService.createNotification({
        type: "RequestUpdated",
        notifiableId: user.id,
        notifiableType: "User",
        data: {
          requestId: request.id,
          requestNumber: request.request_number,
          newStatus: translatedStatus,
          message: isRequester
            ? `O estado da sua requisição (${request.request_number}) foi actualizado para ${translatedStatus.toLowerCase()}.`
            : `O estado da requisição (${request.request_number}) foi actualizado para ${translatedStatus.toLowerCase()} no seu grupo (${user.groupName}).`,
        },
      });
    });

    // Execute all notifications concurrently
    await Promise.all(notificationPromises);
  }
}