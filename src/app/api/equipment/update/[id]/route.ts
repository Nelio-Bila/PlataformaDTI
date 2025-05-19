// src/app/api/equipment/update/[id]/route.ts
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { z } from "zod";
import { equipment_schema } from "@/schemas/equipment";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const {id} = await params
    try {
        const equipment = await db.equipment.findUnique({
            where: { id: id },
            include: {
                images: true,
                direction: true,
                department: true,
                sector: true,
                service: true,
                repartition: true,
            },
        });

        if (!equipment) {
            return NextResponse.json(
                { success: false, error: "Equipment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, equipment });
    } catch (error) {
        console.error("Error fetching equipment:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch equipment" },
            { status: 500 }
        );
    }
}


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const formData = await req.formData();
    const data = {
      serial_number: formData.get("serial_number")?.toString() || "",
      type: formData.get("type")?.toString() || "",
      brand: formData.get("brand")?.toString() || "",
      model: formData.get("model")?.toString() || "",
      purchase_date: formData.get("purchase_date")?.toString(),
      warranty_end: formData.get("warranty_end")?.toString(),
      status: formData.get("status")?.toString() as "ACTIVO" | "MANUTENÇÃO" | "INACTIVO" | undefined,
      direction_id: formData.get("direction_id")?.toString(),
      department_id: formData.get("department_id")?.toString(),
      sector_id: formData.get("sector_id")?.toString(),
      service_id: formData.get("service_id")?.toString(),
      repartition_id: formData.get("repartition_id")?.toString(),
      deleted_image_ids: formData.get("deleted_image_ids")
        ? JSON.parse(formData.get("deleted_image_ids") as string)
        : [],
      observations: formData.get("observations")?.toString(),
      extra_fields: formData.get("extra_fields")
        ? JSON.parse(formData.get("extra_fields") as string)
        : undefined,
    };

    // Validate data with Zod
    const validatedData = equipment_schema.parse(data);

    // Check if equipment exists
    const existingEquipment = await db.equipment.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingEquipment) {
      return NextResponse.json(
        { success: false, error: "Equipment not found" },
        { status: 404 }
      );
    }

    // Handle deleted images
    if (validatedData.deleted_image_ids && validatedData.deleted_image_ids.length > 0) {
      const imagesToDelete = existingEquipment.images.filter((img) =>
        validatedData.deleted_image_ids?.includes(img.id)
      );

      for (const image of imagesToDelete) {
        if (image.cloudinary_public_id) {
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });

          await cloudinary.uploader.destroy(image.cloudinary_public_id);
        }
      }

      await db.equipmentImage.deleteMany({
        where: {
          id: {
            in: validatedData.deleted_image_ids,
          },
        },
      });
    }

    // Upload new images
    let uploadedImages: { url: string; public_id: string }[] = [];
    const imageFiles = formData.getAll("images") as File[];

    if (imageFiles && imageFiles.length > 0 && imageFiles[0].size > 0) {
      const uploadPromises = imageFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise<{ url: string; public_id: string }>((resolve, reject) => {
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });
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

    // Update equipment with new data
    const equipment = await db.equipment.update({
      where: { id },
      data: {
        serial_number: validatedData.serial_number,
        type: validatedData.type,
        brand: validatedData.brand,
        model: validatedData.model,
        purchase_date: validatedData.purchase_date ? new Date(validatedData.purchase_date) : null,
        warranty_end: validatedData.warranty_end ? new Date(validatedData.warranty_end) : null,
        status: validatedData.status,
        direction_id: validatedData.direction_id || null,
        department_id: validatedData.department_id || null,
        sector_id: validatedData.sector_id || null,
        service_id: validatedData.service_id || null,
        repartition_id: validatedData.repartition_id || null,
        observations: validatedData.observations || null,
        extra_fields: validatedData.extra_fields || Prisma.JsonNull,
        images: uploadedImages.length > 0
          ? {
              create: uploadedImages.map((img) => ({
                url: img.url,
                description: `Imagem de ${validatedData.serial_number || "equipamento"}`,
                cloudinary_public_id: img.public_id,
              })),
            }
          : undefined,
      },
      include: { images: true },
    });

    return NextResponse.json({ success: true, equipment }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Error updating equipment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update equipment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }>}
) {
    const {id} = await params;
    try {
        // Find equipment with images
        const equipment = await db.equipment.findUnique({
            where: { id: id },
            include: { images: true },
        });

        if (!equipment) {
            return NextResponse.json(
                { success: false, error: "Equipment not found" },
                { status: 404 }
            );
        }

        // Delete images from Cloudinary
        if (equipment.images.length > 0) {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });

            for (const image of equipment.images) {
                if (image.cloudinary_public_id) {
                    await cloudinary.uploader.destroy(image.cloudinary_public_id);
                }
            }
        }

        // Delete equipment and related images
        await db.equipment.delete({
            where: { id: id },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error deleting equipment:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete equipment" },
            { status: 500 }
        );
    }
}