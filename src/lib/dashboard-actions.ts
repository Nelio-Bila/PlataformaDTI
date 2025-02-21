"use server";

import { prisma } from "@/lib/prisma";

export async function fetch_statistics() {
  const [total_equipment, status_counts, department_counts] = await Promise.all([
    prisma.equipment.count(),
    prisma.equipment.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.equipment.groupBy({
      by: ["department_id"],
      _count: { id: true },
      where: { department_id: { not: null } },
    }),
  ]);

  const departments = await prisma.department.findMany({
    where: { id: { in: department_counts.map((dc) => dc.department_id!) } },
    select: { id: true, name: true },
  });

  const status_data = status_counts.map((sc) => ({
    status: sc.status,
    count: sc._count.id,
  }));

  const department_data = department_counts.map((dc) => ({
    department: departments.find((d) => d.id === dc.department_id)?.name || "Unknown",
    count: dc._count.id,
  }));

  return {
    total_equipment,
    status_data,
    department_data,
  };
}

export async function fetch_equipment({
  page = 0,
  page_size = 10,
  sort_column = "created_at",
  sort_direction = "desc",
  filter = "",
}: {
  page?: number;
  page_size?: number;
  sort_column?: string;
  sort_direction?: "asc" | "desc";
  filter?: string;
}) {
  const skip = page * page_size;
  const where = filter
    ? {
        OR: [
          { serial_number: { contains: filter } },
          { name: { contains: filter } },
          { brand: { contains: filter } },
          { model: { contains: filter } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.equipment.findMany({
      where,
      orderBy: { [sort_column]: sort_direction },
      skip,
      take: page_size,
      include: { department: true, sector: true, service: true, repartition: true },
    }),
    prisma.equipment.count({ where }),
  ]);

  return { data, total };
}