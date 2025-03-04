// src/app/api/requests/create/route.ts
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  type: z.enum(["REQUISITION", "RETURN", "SUBSTITUTION"], { required_error: "Tipo é obrigatório" }),
  requester_name: z.string().min(1, { message: "Nome do solicitante é obrigatório" }),
  description: z.string().min(1, { message: "Descrição é obrigatória" }),
  quantity: z.number().min(1, { message: "Quantidade deve ser pelo menos 1" }),
  unit: z.string().optional(),
  requester_direction_id: z.string().optional(),
  requester_department_id: z.string().optional(),
  requester_service_id: z.string().optional(),
  requester_sector_id: z.string().optional(),
  requester_repartition_id: z.string().optional(),
  destination_direction_id: z.string().optional(),
  destination_department_id: z.string().optional(),
  destination_service_id: z.string().optional(),
  destination_sector_id: z.string().optional(),
  destination_repartition_id: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const formData = await req.formData();
    const data = {
      type: formData.get("type") as string,
      requester_name: formData.get("requester_name") as string,
      description: formData.get("description") as string,
      quantity: parseInt(formData.get("quantity") as string),
      unit: formData.get("unit") as string | undefined,
      requester_direction_id: formData.get("requester_direction_id") as string | undefined,
      requester_department_id: formData.get("requester_department_id") as string | undefined,
      requester_service_id: formData.get("requester_service_id") as string | undefined,
      requester_sector_id: formData.get("requester_sector_id") as string | undefined,
      requester_repartition_id: formData.get("requester_repartition_id") as string | undefined,
      destination_direction_id: formData.get("destination_direction_id") as string | undefined,
      destination_department_id: formData.get("destination_department_id") as string | undefined,
      destination_service_id: formData.get("destination_service_id") as string | undefined,
      destination_sector_id: formData.get("destination_sector_id") as string | undefined,
      destination_repartition_id: formData.get("destination_repartition_id") as string | undefined,
    };

    const validatedData = requestSchema.parse(data);

    // Generate a unique request number
    const requestCount = await db.request.count();
    const requestNumber = `REQ${(requestCount + 1).toString().padStart(6, "0")}`;

    const request = await db.request.create({
      data: {
        request_number: requestNumber,
        type: validatedData.type,
        requester_id: userId || null, // Set to null if not authenticated
        requester_name: validatedData.requester_name,
        requester_direction_id: validatedData.requester_direction_id || null,
        requester_department_id: validatedData.requester_department_id || null,
        requester_service_id: validatedData.requester_service_id || null,
        requester_sector_id: validatedData.requester_sector_id || null,
        requester_repartition_id: validatedData.requester_repartition_id || null,
        destination_direction_id: validatedData.destination_direction_id || null,
        destination_department_id: validatedData.destination_department_id || null,
        destination_service_id: validatedData.destination_service_id || null,
        destination_sector_id: validatedData.destination_sector_id || null,
        destination_repartition_id: validatedData.destination_repartition_id || null,
        items: {
          create: [
            {
              description: validatedData.description,
              quantity: validatedData.quantity,
              unit: validatedData.unit || "UM",
            },
          ],
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error:", error.message, error.code, error.meta);
      return NextResponse.json({ success: false, error: "Erro no banco de dados." }, { status: 500 });
    }
    console.error("Error creating request:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false, error: "Falha ao criar requisição." }, { status: 500 });
  }
}