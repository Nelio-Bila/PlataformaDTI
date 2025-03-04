// src/app/api/requests/route.ts
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

type FetchRequestParams = {
  page: number;
  page_size: number;
  sort_column?: string;
  sort_direction?: "asc" | "desc";
  filter?: string;
  type?: string; // Comma-separated values (e.g., "REQUISITION,RETURN")
  status?: string; // Comma-separated values
  requester_direction_id?: string; // Comma-separated values
  requester_department_id?: string; // Comma-separated values
};

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Usuário não autenticado. Você deve estar logado para visualizar requisições." },
      { status: 401 }
    );
  }

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

  if (params.filter) {
    where.OR = [
      { request_number: { contains: params.filter, mode: "insensitive" } },
      { comments: { contains: params.filter, mode: "insensitive" } },
      { requester_name: { contains: params.filter, mode: "insensitive" } },
    ];
  }

  // Handle multi-select filters
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