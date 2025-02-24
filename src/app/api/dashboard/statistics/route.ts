import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [total_equipment, status_counts, department_counts] = await Promise.all([
      db.equipment.count(),
      db.equipment.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      db.equipment.groupBy({
        by: ["department_id"],
        _count: { id: true },
        where: { department_id: { not: null } },
      }),
    ]);

    const departments = await db.department.findMany({
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

    return NextResponse.json(
      {
        total_equipment,
        status_data,
        department_data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}