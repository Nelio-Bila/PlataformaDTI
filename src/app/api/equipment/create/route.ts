// src/app/api/equipment/create/route.ts
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { z } from "zod";

const equipment_schema = z.object({
  serial_number: z.string().min(1, { message: "Número de série é obrigatório" }),
  type: z.string().min(1, { message: "Tipo é obrigatório" }),
  brand: z.string().min(1, { message: "Marca é obrigatória" }),
  model: z.string().min(1, { message: "Modelo é obrigatório" }),
  purchase_date: z.string().optional().nullable().transform((val) => (val === "" ? undefined : val)),
  warranty_end: z.string().optional().nullable().transform((val) => (val === "" ? undefined : val)),
  status: z.enum(["ACTIVO", "MANUTENÇÃO", "INACTIVO"], {
    required_error: "Status é obrigatório",
  }),
  direction_id: z.string().optional().nullable().transform((val) => (val === "" || val === null ? undefined : val)),
  department_id: z.string().optional().nullable().transform((val) => (val === "" || val === null ? undefined : val)),
  sector_id: z.string().optional().nullable().transform((val) => (val === "" || val === null ? undefined : val)),
  service_id: z.string().optional().nullable().transform((val) => (val === "" || val === null ? undefined : val)),
  repartition_id: z.string().optional().nullable().transform((val) => (val === "" || val === null ? undefined : val)),
  observations: z.string().optional().nullable().transform((val) => (val === "" || val === null ? undefined : val)),
  extra_fields: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val === "") return undefined;
      try {
        return JSON.parse(val);
      } catch {
        throw new Error("extra_fields deve ser um JSON válido");
      }
    }),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Utilizador não autenticado. Você deve estar logado para registrar um equipamento." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const data = {
      serial_number: formData.get("serial_number") as string,
      type: formData.get("type") as string,
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      purchase_date: formData.get("purchase_date") as string | null,
      warranty_end: formData.get("warranty_end") as string | null,
      status: formData.get("status") as "ACTIVO" | "MANUTENÇÃO" | "INACTIVO",
      direction_id: formData.get("direction_id") as string | null,
      department_id: formData.get("department_id") as string | null,
      sector_id: formData.get("sector_id") as string | null,
      service_id: formData.get("service_id") as string | null,
      repartition_id: formData.get("repartition_id") as string | null,
      observations: formData.get("observations") as string | null,
      extra_fields: formData.get("extra_fields") as string | null,
    };

    const validatedData = equipment_schema.parse(data);
    const imageFiles = formData.getAll("images") as File[];

    let uploadedImages: { url: string; public_id: string }[] = [];

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

    const equipment = await db.equipment.create({
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
        registered_by: userId,
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

    return NextResponse.json({ success: true, equipment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod validation error:", error.errors);
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error:", error.message, error.code, error.meta);
      if (error.code === "P2003") {
        return NextResponse.json(
          { success: false, error: "Violação de chave estrangeira: Utilizador ou outro registro não encontrado." },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: false, error: "Erro no banco de dados." }, { status: 500 });
    }
    console.error("Error creating equipment:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false, error: "Falha ao criar equipamento." }, { status: 500 });
  }
}