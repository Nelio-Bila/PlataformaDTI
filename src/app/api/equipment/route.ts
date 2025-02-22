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

  // Existing list-fetch logic
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
  if (params.type) where.type = params.type;
  if (params.status) where.status = params.status;
  if (params.direction_id) where.direction_id = params.direction_id;
  if (params.department_id) where.department_id = params.department_id;

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