// actions/equipment.ts
"use server";

import { EquipmentFormData } from "@/components/forms/equipment-form";
import { db } from "@/lib/db";
import { v2 as cloudinary } from 'cloudinary';

type FetchEquipmentParams = {
  page?: number;
  page_size?: number;
  sort_column?: string;
  sort_direction?: "asc" | "desc";
  filter?: string;
  type?: string;
  status?: string;
  direction_id?: string;
  department_id?: string;
};

export async function fetch_equipment(params: FetchEquipmentParams) {
  const {
    page = 0,
    page_size = 10,
    sort_column = "created_at",
    sort_direction = "desc",
    filter = "",
    type,
    status,
    direction_id,
    department_id,
  } = params;

  console.log("fetch_equipment invoked with params:", params);

  const skip = page * page_size;
  const where: any = {};
  if (filter) {
    where.OR = [
      { serial_number: { contains: filter, mode: "insensitive" } },
      { brand: { contains: filter, mode: "insensitive" } },
      { model: { contains: filter, mode: "insensitive" } },
    ];
  }
  if (type) where.type = type;
  if (status) where.status = status;
  if (direction_id) where.direction_id = direction_id;
  if (department_id) where.department_id = department_id;

  try {
    const [data, total] = await Promise.all([
      db.equipment.findMany({
        where,
        orderBy: { [sort_column]: sort_direction },
        skip,
        take: page_size,
        include: {
          direction: true,
          department: true,
          sector: true,
          service: true,
          repartition: true,
        },
      }),
      db.equipment.count({ where }),
    ]);

    console.log("fetch_equipment result:", { data, total });
    return { data, total };
  } catch (error) {
    console.error("Error fetching equipment:", error);
    throw new Error("Failed to fetch equipment");
  }
}

export async function fetch_filter_options() {
  console.log("fetch_filter_options invoked");
  try {
    const [types, statuses, directions, departments] = await Promise.all([
      db.equipment
        .findMany({ distinct: ["type"], select: { type: true } })
        .then((res) => res.map((r) => r.type).filter(Boolean)),
      db.equipment
        .findMany({ distinct: ["status"], select: { status: true } })
        .then((res) => res.map((r) => r.status).filter(Boolean)),
      db.direction.findMany({ select: { id: true, name: true } }),
      db.department.findMany({ select: { id: true, name: true, direction_id: true } }),
    ]);
    console.log("fetch_filter_options result:", { types, statuses, directions, departments });
    return { types, statuses, directions, departments };
  } catch (error) {
    console.error("Error in fetch_filter_options:", error);
    throw new Error("Failed to fetch filter options");
  }
}

export async function delete_equipment(ids: string[]) {
  try {
    console.log("delete_equipment invoked with ids:", ids);
    await db.equipment.deleteMany({ where: { id: { in: ids } } });
    return { success: true };
  } catch (error) {
    console.error("Error in delete_equipment:", error);
    throw error;
  }
}

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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function create_equipment(formData: FormData) {
  const data: EquipmentFormData = {
    serial_number: formData.get("serial_number") as string,
    type: formData.get("type") as string,
    brand: formData.get("brand") as string,
    model: formData.get("model") as string,
    purchase_date: formData.get("purchase_date") as string | undefined,
    warranty_end: formData.get("warranty_end") as string | undefined,
    status: formData.get("status") as "ACTIVO" | "MANUTENÇÃO" | "INACTIVO",
    direction_id: formData.get("direction_id") as string | undefined,
    department_id: formData.get("department_id") as string | undefined,
    sector_id: formData.get("sector_id") as string | undefined,
    service_id: formData.get("service_id") as string | undefined,
    repartition_id: formData.get("repartition_id") as string | undefined,
  };

  const imageFiles = formData.getAll("images") as File[];

  try {
    let uploadedImages: { url: string; public_id: string }[] = [];

    if (imageFiles && imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise<{ url: string; public_id: string }>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "equipment",
                resource_type: "image",
              },
              (error, result) => {
                if (error) reject(error);
                else if (result)
                  resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                  });
              }
            )
            .end(buffer);
        });
      });

      uploadedImages = await Promise.all(uploadPromises);
    }

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
        images: uploadedImages.length > 0
          ? {
              create: uploadedImages.map((img) => ({
                url: img.url,
                description: `Imagem de ${data.serial_number || "equipamento"}`,
                cloudinary_public_id: img.public_id, // Optional: for future deletions
              })),
            }
          : undefined,
      },
      include: { images: true },
    });

    return { success: true, equipment };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create equipment",
    };
  }
}
