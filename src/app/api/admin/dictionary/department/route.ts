import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const departmentSchema = z.object({
  name: z.string().min(2).max(100),
  direction_id: z.string(),
});

export async function GET() {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    const departments = await db.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        direction: {
          select: {
            name: true
          }
        }
      }
    });
    
    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Falha ao obter departamentos" },
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
    const validatedData = departmentSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Dados de entrada inválidos", details: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    // Check if direction exists
    const direction = await db.direction.findUnique({
      where: { id: validatedData.data.direction_id },
    });
    
    if (!direction) {
      return NextResponse.json(
        { error: "A direcção especificada não existe" },
        { status: 400 }
      );
    }
    
    // Check if department with same name already exists in the same direction
    const existingDepartment = await db.department.findFirst({
      where: { 
        name: validatedData.data.name,
        direction_id: validatedData.data.direction_id
      },
    });
    
    if (existingDepartment) {
      return NextResponse.json(
        { error: "Já existe um departamento com este nome na direcção seleccionada" },
        { status: 409 }
      );
    }
    
    // Create new department
    const department = await db.department.create({
      data: {
        name: validatedData.data.name,
        direction_id: validatedData.data.direction_id,
      },
    });
    
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: "Falha ao criar departamento" },
      { status: 500 }
    );
  }
}