// import { db } from "@/lib/db";
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     const [total_equipment, status_counts, department_counts] = await Promise.all([
//       db.equipment.count(),
//       db.equipment.groupBy({
//         by: ["status"],
//         _count: { id: true },
//       }),
//       db.equipment.groupBy({
//         by: ["department_id"],
//         _count: { id: true },
//         where: { department_id: { not: null } },
//       }),
//     ]);

//     const departments = await db.department.findMany({
//       where: { id: { in: department_counts.map((dc) => dc.department_id!) } },
//       select: { id: true, name: true },
//     });

//     const status_data = status_counts.map((sc) => ({
//       status: sc.status,
//       count: sc._count.id,
//     }));

//     const department_data = department_counts.map((dc) => ({
//       department: departments.find((d) => d.id === dc.department_id)?.name || "Unknown",
//       count: dc._count.id,
//     }));

//     return NextResponse.json(
//       {
//         total_equipment,
//         status_data,
//         department_data,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error fetching statistics:", error);
//     return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
//   }
// }




import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user's groups and permissions
    const userGroups = await db.userGroup.findMany({
      where: { user_id: userId },
      include: {
        group: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const groupNames = userGroups.map(ug => ug.group.name);
    const permissions = userGroups.flatMap(ug =>
      ug.group.permissions.map(gp => gp.permission.name)
    );

    const isAdmin = groupNames.includes("Admins");
    const isTechnician = groupNames.includes("Department: Tecnologias de Informação");

    // Equipment Data (Admins and Technicians only)
    let total_equipment = 0;
    let status_data: { status: string; count: number }[] = [];
    let department_data: { department: string; count: number }[] = [];

    if (isAdmin || isTechnician) {
      const [total, status_counts, department_counts] = await Promise.all([
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

      total_equipment = total;
      status_data = status_counts.map(sc => ({
        status: sc.status,
        count: sc._count.id,
      }));

      const departments = await db.department.findMany({
        where: { id: { in: department_counts.map(dc => dc.department_id!) } },
        select: { id: true, name: true },
      });

      department_data = department_counts.map(dc => ({
        department: departments.find(d => d.id === dc.department_id)?.name || "Unknown",
        count: dc._count.id,
      }));
    }

    // Request Data (All groups)
    const request_counts = await db.request.groupBy({
      by: ["status"],
      _count: { id: true },
      where: {
        OR: [
          { requester_id: userId }, // Requests emitted by user
          // Requests received by user's department or related entities
          {
            destination_department_id: {
              in: userGroups
                .filter(ug => ug.group.name.startsWith("Department:"))
                .map(ug => {
                  const deptName = ug.group.name.replace("Department: ", "");
                  return allDepartments.find(d => d.name === deptName)?.id;
                })
                .filter(id => id !== undefined) as string[],
            },
          },
        ],
      },
    });

    const request_data = request_counts.map(rc => ({
      status: rc.status,
      count: rc._count.id,
    }));

    // Fetch all departments for reference (used in request filtering)
    const allDepartments = await db.department.findMany({
      select: { id: true, name: true },
    });

    return NextResponse.json(
      {
        total_equipment: isAdmin || isTechnician ? total_equipment : null,
        status_data: isAdmin || isTechnician ? status_data : [],
        department_data: isAdmin || isTechnician ? department_data : [],
        request_data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}