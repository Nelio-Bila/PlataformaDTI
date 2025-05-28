import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const userId = id;
    
    // Ensure users can only see their own activity unless they're admins
    if (session.user.id !== userId && 
        !(session.user.groups || []).some(group => group.name === "Admins")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    
    // Get total equipment registered by user
    const totalEquipmentRegistered = await db.equipment.count({
      where: { registered_by: userId }
    });
    
    // Get equipment types breakdown
    const equipmentByType = await db.equipment.groupBy({
      by: ['type'],
      where: { registered_by: userId },
      _count: { id: true },
    });
    
    // Get equipment by department/location
    const equipmentByDepartment = await db.equipment.groupBy({
      by: ['department_id'],
      where: { 
        registered_by: userId,
        department_id: { not: null }
      },
      _count: { id: true },
    });
    
    // Get related department names
    const departmentIds = equipmentByDepartment.map(item => item.department_id);
    const departments = await db.department.findMany({
      where: { id: { in: departmentIds as string[] } },
      select: { id: true, name: true }
    });
    
    // Map department IDs to names
    const departmentMap = new Map(departments.map(dept => [dept.id, dept.name]));
    
    // Get equipment registration timeline by month
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    const equipmentByTimeline = await db.equipment.findMany({
      where: {
        registered_by: userId,
        created_at: { gte: oneYearAgo }
      },
      select: { created_at: true },
      orderBy: { created_at: 'asc' }
    });
    
    // Process timeline data by month
    const monthlyData = new Map();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    equipmentByTimeline.forEach(item => {
      const date = new Date(item.created_at);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${months[month]} ${year}`;
      
      monthlyData.set(key, (monthlyData.get(key) || 0) + 1);
    });
    
    // Format the data for the frontend
    const equipmentByMonth = Array.from(monthlyData).map(([month, count]) => ({
      month,
      count,
    }));
    
    // Get equipment by year
    const yearlyData = new Map();
    
    equipmentByTimeline.forEach(item => {
      const year = new Date(item.created_at).getFullYear();
      yearlyData.set(year, (yearlyData.get(year) || 0) + 1);
    });
    
    const equipmentByYear = Array.from(yearlyData).map(([year, count]) => ({
      year: year.toString(),
      count,
    }));
    
    // Get detailed records of equipment registered by this user
    const equipmentDetails = await db.equipment.findMany({
      where: { 
        registered_by: userId 
      },
      select: {
        id: true,
        type: true,
        brand: true,
        model: true,
        serial_number: true,
        created_at: true,
        department: {
          select: { 
            id: true,
            name: true 
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    // Format the equipment details
    const formattedEquipmentDetails = equipmentDetails.map(item => ({
      id: item.id,
      type: item.type,
      brand: item.brand,
      model: item.model,
      serial_number: item.serial_number,
      location: departmentMap.get(item.department?.id || '') || 'Desconhecido',
      department_name: item.department?.name || 'Desconhecido',
      created_at: item.created_at.toISOString()
    }));
    
    return NextResponse.json({
      totalEquipmentRegistered,
      equipmentByType: equipmentByType.map(item => ({
        type: item.type,
        count: item._count.id,
      })),
      equipmentByLocation: equipmentByDepartment
        .filter(item => item.department_id !== null)
        .map(item => ({
          location: departmentMap.get(item.department_id as string) || "Desconhecido",
          count: item._count.id,
        })),
      equipmentByMonth,
      equipmentByYear,
      equipmentDetails: formattedEquipmentDetails 
    });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return NextResponse.json(
      { error: "Falha ao obter dados de atividade" },
      { status: 500 }
    );
  }
}