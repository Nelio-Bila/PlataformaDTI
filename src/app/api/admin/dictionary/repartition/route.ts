import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const repartitionSchema = z.object({
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
    
    const repartitions = await db.repartition.findMany({
      orderBy: { name: 'asc' },
      include: {
        department: {
          select: {
            name: true
          }
        }
      }
    });
    
    return NextResponse.json(repartitions);
  } catch (error) {
    console.error("Error fetching repartitions:", error);
    return NextResponse.json(
      { error: "Falha ao obter repartições" },
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
    const validatedData = repartitionSchema.safeParse(body);
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
    
    // Check if repartition with same name already exists in the same department
    const existingRepartition = await db.repartition.findFirst({
      where: { 
        name: validatedData.data.name,
        department_id: validatedData.data.department_id
      },
    });
    
    if (existingRepartition) {
      return NextResponse.json(
        { error: "Já existe uma repartição com este nome no departamento seleccionado" },
        { status: 409 }
      );
    }
    
    // Create new repartition
    const repartition = await db.repartition.create({
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
    
    return NextResponse.json(repartition, { status: 201 });
  } catch (error) {
    console.error("Error creating repartition:", error);
    return NextResponse.json(
      { error: "Falha ao criar repartição" },
      { status: 500 }
    );
  }
}