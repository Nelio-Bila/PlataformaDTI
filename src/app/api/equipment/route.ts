import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

type FetchEquipmentParams = {
  page: number;
  page_size: number;
  sort_column?: string;
  sort_direction?: "asc" | "desc";
  filter?: string;
  type?: string;
  status?: string;
  direction_id?: string;
  department_id?: string;
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check for equipment:read permission
  const userGroups = await db.userGroup.findMany({
    where: { user_id: session.user.id },
    include: {
      group: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });

  const permissions = userGroups.flatMap(ug => ug.group.permissions.map(gp => gp.permission.name));
  if (!permissions.includes("equipment:read")) {
    return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    // Fetch single equipment by ID
    try {
      const equipment = await db.equipment.findUnique({
        where: { id },
        include: {
          direction: true,
          department: true,
          sector: true,
          service: true,
          repartition: true,
          images: true,
          registeredBy: true,
        },
      });
      if (!equipment) {
        return NextResponse.json({ error: "Equipment not found" }, { status: 404 });
      }
      return NextResponse.json(equipment);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 });
    }
  }

  // Fetch list of equipment
  const pageParam = url.searchParams.get("page");
  const pageSizeParam = url.searchParams.get("page_size");

  const params: FetchEquipmentParams = {
    page: pageParam !== null ? parseInt(pageParam, 10) : 0,
    page_size: pageSizeParam !== null ? parseInt(pageSizeParam, 10) : 10,
    sort_column: url.searchParams.get("sort_column") || "created_at",
    sort_direction: (url.searchParams.get("sort_direction") as "asc" | "desc") || "desc",
    filter: url.searchParams.get("filter") || "",
    type: url.searchParams.get("type") || undefined,
    status: url.searchParams.get("status") || undefined,
    direction_id: url.searchParams.get("direction_id") || undefined,
    department_id: url.searchParams.get("department_id") || undefined,
  };

  const skip = params.page * params.page_size;
  const where: any = {};

  if (params.filter) {
    where.OR = [
      { serial_number: { contains: params.filter, mode: "insensitive" } },
      { brand: { contains: params.filter, mode: "insensitive" } },
      { model: { contains: params.filter, mode: "insensitive" } },
    ];
  }

  if (params.type) {
    const types = params.type.split(",");
    where.type = { in: types };
  }

  if (params.status) {
    const statuses = params.status.split(",");
    where.status = { in: statuses };
  }

  if (params.direction_id) {
    const directionIds = params.direction_id.split(",");
    where.direction_id = { in: directionIds };
  }

  if (params.department_id) {
    const departmentIds = params.department_id.split(",");
    where.department_id = { in: departmentIds };
  }

  try {
    const [data, total] = await Promise.all([
      db.equipment.findMany({
        where,
        orderBy: { [params.sort_column!]: params.sort_direction },
        skip,
        take: params.page_size,
        include: {
          direction: true,
          department: true,
          sector: true,
          service: true,
          repartition: true,
          images: true,
        },
      }),
      db.equipment.count({ where }),
    ]);

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 });
  }
}