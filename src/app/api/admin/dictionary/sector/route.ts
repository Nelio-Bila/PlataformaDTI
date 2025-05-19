import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const sectorSchema = z.object({
  name: z.string().min(2).max(100),
  department_id: z.string(),
  service_id: z.string(),
});

export async function GET() {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    const sectors = await db.sector.findMany({
      orderBy: { name: 'asc' },
      include: {
        department: {
          select: {
            name: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      }
    });
    
    return NextResponse.json(sectors);
  } catch (error) {
    console.error("Error fetching sectors:", error);
    return NextResponse.json(
      { error: "Falha ao obter sectores" },
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
    const validatedData = sectorSchema.safeParse(body);
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
    
    // Check if service exists and belongs to the specified department
    const service = await db.service.findUnique({
      where: { 
        id: validatedData.data.service_id,
        department_id: validatedData.data.department_id
      },
    });
    
    if (!service) {
      return NextResponse.json(
        { error: "O serviço especificado não existe ou não pertence ao departamento seleccionado" },
        { status: 400 }
      );
    }
    
    // Check if sector with same name already exists in the same department/service combination
    const existingSector = await db.sector.findFirst({
      where: { 
        name: validatedData.data.name,
        department_id: validatedData.data.department_id,
        service_id: validatedData.data.service_id
      },
    });
    
    if (existingSector) {
      return NextResponse.json(
        { error: "Já existe um sector com este nome no departamento/serviço seleccionado" },
        { status: 409 }
      );
    }
    
    // Create new sector
    const sector = await db.sector.create({
      data: {
        name: validatedData.data.name,
        department_id: validatedData.data.department_id,
        service_id: validatedData.data.service_id,
      },
      include: {
        department: {
          select: {
            name: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      }
    });
    
    return NextResponse.json(sector, { status: 201 });
  } catch (error) {
    console.error("Error creating sector:", error);
    return NextResponse.json(
      { error: "Falha ao criar sector" },
      { status: 500 }
    );
  }
}