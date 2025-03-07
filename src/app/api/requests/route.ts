// // src/app/api/requests/route.ts
// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import { NextResponse } from "next/server";

// type FetchRequestParams = {
//   page: number;
//   page_size: number;
//   sort_column?: string;
//   sort_direction?: "asc" | "desc";
//   filter?: string;
//   type?: string; // Comma-separated values (e.g., "REQUISITION,RETURN")
//   status?: string; // Comma-separated values
//   requester_direction_id?: string; // Comma-separated values
//   requester_department_id?: string; // Comma-separated values
// };

// export async function GET(request: Request) {
//   const session = await auth();
//   const userId = session?.user?.id;

//   if (!userId) {
//     return NextResponse.json(
//       { error: "Utilizador não autenticado. Você deve estar logado para visualizar requisições." },
//       { status: 401 }
//     );
//   }

//   const url = new URL(request.url);
//   const id = url.searchParams.get("id");

//   if (id) {
//     // Fetch single request by ID
//     try {
//       const requestData = await db.request.findUnique({
//         where: { id },
//         include: {
//           requester: true,
//           approver: true,
//           requester_direction: true,
//           requester_department: true,
//           requester_service: true,
//           requester_sector: true,
//           requester_repartition: true,
//           destination_direction: true,
//           destination_department: true,
//           destination_service: true,
//           destination_sector: true,
//           destination_repartition: true,
//           items: true,
//         },
//       });
//       if (!requestData) {
//         return NextResponse.json({ error: "Request not found" }, { status: 404 });
//       }
//       return NextResponse.json(requestData);
//     } catch (error) {
//       console.error("Error fetching request:", error);
//       return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 });
//     }
//   }

//   // Fetch list of requests
//   const pageParam = url.searchParams.get("page");
//   const pageSizeParam = url.searchParams.get("page_size");

//   const params: FetchRequestParams = {
//     page: pageParam !== null ? parseInt(pageParam, 10) : 0,
//     page_size: pageSizeParam !== null ? parseInt(pageSizeParam, 10) : 10,
//     sort_column: url.searchParams.get("sort_column") || "created_at",
//     sort_direction: (url.searchParams.get("sort_direction") as "asc" | "desc") || "desc",
//     filter: url.searchParams.get("filter") || "",
//     type: url.searchParams.get("type") || undefined,
//     status: url.searchParams.get("status") || undefined,
//     requester_direction_id: url.searchParams.get("requester_direction_id") || undefined,
//     requester_department_id: url.searchParams.get("requester_department_id") || undefined,
//   };

//   const skip = params.page * params.page_size;
//   const where: any = {};

//   if (params.filter) {
//     where.OR = [
//       { request_number: { contains: params.filter, mode: "insensitive" } },
//       { comments: { contains: params.filter, mode: "insensitive" } },
//       { requester_name: { contains: params.filter, mode: "insensitive" } },
//     ];
//   }

//   // Handle multi-select filters
//   if (params.type) {
//     const types = params.type.split(",");
//     where.type = { in: types };
//   }

//   if (params.status) {
//     const statuses = params.status.split(",");
//     where.status = { in: statuses };
//   }

//   if (params.requester_direction_id) {
//     const directionIds = params.requester_direction_id.split(",");
//     where.requester_direction_id = { in: directionIds };
//   }

//   if (params.requester_department_id) {
//     const departmentIds = params.requester_department_id.split(",");
//     where.requester_department_id = { in: departmentIds };
//   }

//   try {
//     const [data, total] = await Promise.all([
//       db.request.findMany({
//         where,
//         orderBy: { [params.sort_column!]: params.sort_direction },
//         skip,
//         take: params.page_size,
//         include: {
//           requester: true,
//           approver: true,
//           requester_direction: true,
//           requester_department: true,
//           requester_service: true,
//           requester_sector: true,
//           requester_repartition: true,
//           destination_direction: true,
//           destination_department: true,
//           destination_service: true,
//           destination_sector: true,
//           destination_repartition: true,
//           items: true,
//         },
//       }),
//       db.request.count({ where }),
//     ]);

//     return NextResponse.json({ data, total });
//   } catch (error) {
//     console.error("Error fetching requests:", error);
//     return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
//   }
// }


import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

type FetchRequestParams = {
  page: number;
  page_size: number;
  sort_column?: string;
  sort_direction?: "asc" | "desc";
  filter?: string;
  type?: string;
  status?: string;
  requester_direction_id?: string;
  requester_department_id?: string;
};

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Utilizador não autenticado. Você deve estar logado para visualizar requisições." },
      { status: 401 }
    );
  }

  // Fetch user's groups and permissions
  const userGroups = await db.userGroup.findMany({
    where: { user_id: userId },
    include: {
      group: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });

  const permissions = userGroups.flatMap(ug => ug.group.permissions.map(gp => gp.permission.name));
  const hasFullReadPermission = permissions.includes("request:read");

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    // Fetch single request by ID
    try {
      const requestData = await db.request.findUnique({
        where: { id },
        include: {
          requester: true,
          approver: true,
          requester_direction: true,
          requester_department: true,
          requester_service: true,
          requester_sector: true,
          requester_repartition: true,
          destination_direction: true,
          destination_department: true,
          destination_service: true,
          destination_sector: true,
          destination_repartition: true,
          items: true,
        },
      });

      if (!requestData) {
        return NextResponse.json({ error: "Request not found" }, { status: 404 });
      }

      // Check if user has permission to view this specific request
      const isRequester = requestData.requester_id === userId;
      const isRecipient = requestData.destination_department_id && userGroups.some(ug =>
        ug.group.name === `Department: ${requestData.destination_department?.name}`
      );
      if (!hasFullReadPermission && !isRequester && !isRecipient) {
        return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
      }

      return NextResponse.json(requestData);
    } catch (error) {
      console.error("Error fetching request:", error);
      return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 });
    }
  }

  // Fetch list of requests
  const pageParam = url.searchParams.get("page");
  const pageSizeParam = url.searchParams.get("page_size");

  const params: FetchRequestParams = {
    page: pageParam !== null ? parseInt(pageParam, 10) : 0,
    page_size: pageSizeParam !== null ? parseInt(pageSizeParam, 10) : 10,
    sort_column: url.searchParams.get("sort_column") || "created_at",
    sort_direction: (url.searchParams.get("sort_direction") as "asc" | "desc") || "desc",
    filter: url.searchParams.get("filter") || "",
    type: url.searchParams.get("type") || undefined,
    status: url.searchParams.get("status") || undefined,
    requester_direction_id: url.searchParams.get("requester_direction_id") || undefined,
    requester_department_id: url.searchParams.get("requester_department_id") || undefined,
  };

  const skip = params.page * params.page_size;
  const where: any = {};

  if (!hasFullReadPermission) {
    // Fetch all departments to map group names to department IDs
    const departments = await db.department.findMany({
      select: { id: true, name: true },
    });

    // Filter requests to only those where user is requester or recipient
    const departmentIds = userGroups
      .filter(ug => ug.group.name.startsWith("Department:"))
      .map(ug => {
        const deptName = ug.group.name.replace("Department: ", "");
        return departments.find(d => d.name === deptName)?.id;
      })
      .filter(id => id) as string[];

    where.OR = [
      { requester_id: userId }, // User is the requester
      { destination_department_id: { in: departmentIds } }, // User’s department is the recipient
    ];
  }

  if (params.filter) {
    where.AND = where.AND || [];
    where.AND.push({
      OR: [
        { request_number: { contains: params.filter, mode: "insensitive" } },
        { comments: { contains: params.filter, mode: "insensitive" } },
        { requester_name: { contains: params.filter, mode: "insensitive" } },
      ],
    });
  }

  if (params.type) {
    const types = params.type.split(",");
    where.type = { in: types };
  }

  if (params.status) {
    const statuses = params.status.split(",");
    where.status = { in: statuses };
  }

  if (params.requester_direction_id) {
    const directionIds = params.requester_direction_id.split(",");
    where.requester_direction_id = { in: directionIds };
  }

  if (params.requester_department_id) {
    const departmentIds = params.requester_department_id.split(",");
    where.requester_department_id = { in: departmentIds };
  }

  try {
    const [data, total] = await Promise.all([
      db.request.findMany({
        where,
        orderBy: { [params.sort_column!]: params.sort_direction },
        skip,
        take: params.page_size,
        include: {
          requester: true,
          approver: true,
          requester_direction: true,
          requester_department: true,
          requester_service: true,
          requester_sector: true,
          requester_repartition: true,
          destination_direction: true,
          destination_department: true,
          destination_service: true,
          destination_sector: true,
          destination_repartition: true,
          items: true,
        },
      }),
      db.request.count({ where }),
    ]);

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}