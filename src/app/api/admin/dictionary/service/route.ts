import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(2).max(100),
  department_id: z.string(),
});

export async function GET() {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    const services = await db.service.findMany({
      orderBy: { name: 'asc' },
      include: {
        department: {
          select: {
            name: true
          }
        }
      }
    });
    
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Falha ao obter serviços" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Validate input
    const validatedData = serviceSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Dados de entrada inválidos", details: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    // Check if department exists
    const department = await db.department.findUnique({
      where: { id: validatedData.data.department_id },
    });
    
    if (!department) {
      return NextResponse.json(
        { error: "O departamento especificado não existe" },
        { status: 400 }
      );
    }
    
    // Check if service with same name already exists in the same department
    const existingService = await db.service.findFirst({
      where: { 
        name: validatedData.data.name,
        department_id: validatedData.data.department_id
      },
    });
    
    if (existingService) {
      return NextResponse.json(
        { error: "Já existe um serviço com este nome no departamento seleccionado" },
        { status: 409 }
      );
    }
    
    // Create new service
    const service = await db.service.create({
      data: {
        name: validatedData.data.name,
        department_id: validatedData.data.department_id,
      },
      include: {
        department: {
          select: {
            name: true
          }
        }
      }
    });
    
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Falha ao criar serviço" },
      { status: 500 }
    );
  }
}