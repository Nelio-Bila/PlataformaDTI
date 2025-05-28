import { NextResponse } from 'next/server';

// src/app/api/dashboard/statistics/route.ts
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { RequestType } from '@prisma/client';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;


        // Get count of equipment registered by user
    const userRegisteredEquipmentCount = await db.equipment.count({
      where: {
        registered_by: userId
      }
    });

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

    const isAdmin = groupNames.includes("Admins");
    const isTechnician = groupNames.includes("Department: Tecnologias de Informação");
    const canViewEquipment = isAdmin || isTechnician;

    // Fetch departments for reference (used in filtering)
    const allDepartments = await db.department.findMany({
      select: { id: true, name: true },
    });

    // Get user's departments from their groups
    const userDepartmentIds = userGroups
      .filter(ug => ug.group.name.startsWith("Department:"))
      .map(ug => {
        const deptName = ug.group.name.replace("Department: ", "");
        return allDepartments.find(d => d.name === deptName)?.id;
      })
      .filter(id => id !== undefined) as string[];

    // Equipment Data (Admins and Technicians only)
    let equipmentData = null;
    if (canViewEquipment) {
      const [
        total,
        status_counts,
        department_counts,
        recentEquipment,
        equipmentByType,
        equipmentsByAge
      ] = await Promise.all([
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
        db.equipment.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            serial_number: true,
            type: true,
            brand: true,
            model: true,
            status: true,
            created_at: true,
            department: { select: { name: true } }
          }
        }),
        db.equipment.groupBy({
          by: ["type"],
          _count: { id: true },
        }),
        db.equipment.findMany({
          select: {
            id: true,
            purchase_date: true,
          },
          where: {
            purchase_date: { not: null }
          }
        })
      ]);

      // Process equipment age data
      const currentDate = new Date();
      const equipmentAge = {
        lessThan1Year: 0,
        between1And3Years: 0,
        between3And5Years: 0,
        moreThan5Years: 0
      };

      equipmentsByAge.forEach(equipment => {
        if (!equipment.purchase_date) return;

        const purchaseDate = new Date(equipment.purchase_date);
        const ageInYears = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

        if (ageInYears < 1) equipmentAge.lessThan1Year++;
        else if (ageInYears >= 1 && ageInYears < 3) equipmentAge.between1And3Years++;
        else if (ageInYears >= 3 && ageInYears < 5) equipmentAge.between3And5Years++;
        else equipmentAge.moreThan5Years++;
      });

      // Map department IDs to names
      const department_data = department_counts.map(dc => ({
        department: allDepartments.find(d => d.id === dc.department_id)?.name || "Unknown",
        count: dc._count.id,
      }));

      equipmentData = {
        total_equipment: total,
        status_data: status_counts.map(sc => ({
          status: sc.status,
          count: sc._count.id,
        })),
        department_data,
        recent_equipment: recentEquipment,
        equipment_by_type: equipmentByType.map(et => ({
          type: et.type,
          count: et._count.id,
        })),
        equipment_age: [
          { name: 'Less than 1 year', value: equipmentAge.lessThan1Year },
          { name: '1-3 years', value: equipmentAge.between1And3Years },
          { name: '3-5 years', value: equipmentAge.between3And5Years },
          { name: 'More than 5 years', value: equipmentAge.moreThan5Years }
        ]
      };
    }

    // Request Data (All users)
    const [
      myRequests,
      requestsByStatus,
      requestsByType,
      recentRequests,
      departmentRequests,
      monthlySummary
    ] = await Promise.all([
      // User's own requests
      db.request.count({
        where: { requester_id: userId }
      }),
      // All requests grouped by status
      db.request.groupBy({
        by: ["status"],
        _count: { id: true },
        where: isAdmin
          ? {}
          : {
              OR: [
                { requester_id: userId },
                { destination_department_id: { in: userDepartmentIds } }
              ]
            }
      }),
      // All requests grouped by type
      db.request.groupBy({
        by: ["type"],
        _count: { id: true },
        where: isAdmin
          ? {}
          : {
              OR: [
                { requester_id: userId },
                { destination_department_id: { in: userDepartmentIds } }
              ]
            }
      }),
      // Recent requests
      db.request.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        where: isAdmin
          ? {}
          : {
              OR: [
                { requester_id: userId },
                { destination_department_id: { in: userDepartmentIds } }
              ]
            },
        select: {
          id: true,
          request_number: true,
          type: true,
          status: true,
          created_at: true,
          requester: { select: { name: true } },
          requester_department: { select: { name: true } },
          destination_department: { select: { name: true } }
        }
      }),
      // Requests by department
      db.request.groupBy({
        by: ["destination_department_id"],
        _count: { id: true },
        where: {
          destination_department_id: { not: null }
        }
      }),
      // Monthly request summary for the current year
      db.request.findMany({
        where: {
          created_at: {
            gte: new Date(new Date().getFullYear(), 0, 1)
          },
          ...(isAdmin ? {} : {
            OR: [
              { requester_id: userId },
              { destination_department_id: { in: userDepartmentIds } }
            ]
          })
        },
        select: {
          created_at: true,
          status: true,
          type: true
        }
      })
    ]);

    // Process monthly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = new Array(12).fill(0).map((_, i) => ({
      month: monthNames[i],
      requisitions: 0,
      returns: 0,
      substitutions: 0
    }));

    monthlySummary.forEach(request => {
      const month = new Date(request.created_at).getMonth();

      switch (request.type) {
        case RequestType.REQUISITION:
          monthlyData[month].requisitions++;
          break;
        case RequestType.RETURN:
          monthlyData[month].returns++;
          break;
        case RequestType.SUBSTITUTION:
          monthlyData[month].substitutions++;
          break;
      }
    });

    // Map department data for requests
    const departmentRequestData = departmentRequests.map(dr => ({
      department: allDepartments.find(d => d.id === dr.destination_department_id)?.name || "Unknown",
      count: dr._count.id
    }));

    const requestData = {
      total_my_requests: myRequests,
      request_by_status: requestsByStatus.map(rs => ({
        status: rs.status,
        count: rs._count.id
      })),
      request_by_type: requestsByType.map(rt => ({
        type: rt.type,
        count: rt._count.id
      })),
      recent_requests: recentRequests,
      department_requests: departmentRequestData,
      monthly_requests: monthlyData
    };

    return NextResponse.json(
      {
        user: {
          id: userId,
          groups: groupNames,
          isAdmin,
          isTechnician,
          departments: userDepartmentIds,
          registered_equipment_count: userRegisteredEquipmentCount
        },
        equipment: equipmentData,
        requests: requestData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}