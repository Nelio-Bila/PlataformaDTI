// actions/equipment.ts
"use server";

import { EquipmentFormData } from "@/components/forms/equipment-form";
import { db } from "@/lib/db";

export async function fetchDirections() {
    try {
        const directions = await db.direction.findMany({
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        return directions || [];
    } catch (error) {
        console.error('Error fetching directions:', error);
        return [];
    }
}


export async function fetchDepartmentsByDirection(directionId: string | null) {
    try {
        if (!directionId) return [];
        const departments = await db.department.findMany({
            where: {
                direction_id: directionId
            },
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        return departments || [];
    } catch (error) {
        console.error('Error fetching departments:', error);
        return [];
    }
}


export async function fetchRepartitionsByDepartment(departmentId: string | null) {
    try {
        if (!departmentId) return [];
        const repartitions = await db.repartition.findMany({
            where: {
                department_id: departmentId
            },
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        return repartitions || [];
    } catch (error) {
        console.error('Error fetching repartitions:', error);
        return [];
    }
}

export async function fetchSectorsByDepartment(departmentId: string | null) {
    try {
        if (!departmentId) return [];
        const sectors = await db.sector.findMany({
            where: {
                department_id: departmentId
            },
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        return sectors || [];
    } catch (error) {
        console.error('Error fetching repartitions:', error);
        return [];
    }
}

export async function fetchServices(directionId: string | undefined, departmentId: string | null) {
    try {
        let whereClause = {};

        if (departmentId) {
            whereClause = { department_id: departmentId };
        } else if (directionId) {
            // Get all services from departments in this direction
            whereClause = {
                department: {
                    direction_id: directionId
                }
            };
        }

        const services = await db.service.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                department_id: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        return services || [];
    } catch (error) {
        console.error('Error fetching repartitions:', error);
        return [];
    }

}


export async function create_equipment(data: EquipmentFormData) {
    try {
        const equipment = await db.equipment.create({
            data: {
                serial_number: data.serial_number,
                type: data.type,
                brand: data.brand,
                model: data.model,
                purchase_date: data.purchase_date ? new Date(data.purchase_date) : null,
                warranty_end: data.warranty_end ? new Date(data.warranty_end) : null,
                status: data.status,
                direction_id: data.direction_id || null,
                department_id: data.department_id || null,
                sector_id: data.sector_id || null,
                service_id: data.service_id || null,
                repartition_id: data.repartition_id || null,
            },
        });
        return { success: true, equipment };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to create equipment" };
    }
}


