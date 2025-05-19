import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const repartitionSchema = z.object({
  name: z.string().min(2).max(100),
  department_id: z.string(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    const repartition = await db.repartition.findUnique({
      where: { id: params.id },
      include: {
        department: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (!repartition) {
      return NextResponse.json({ error: "Repartição não encontrada" }, { status: 404 });
    }
    
    return NextResponse.json(repartition);
  } catch (error) {
    console.error("Error fetching repartition:", error);
    return NextResponse.json(
      { error: "Falha ao obter repartição" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Check if repartition exists
    const existingRepartition = await db.repartition.findUnique({
      where: { id: params.id },
    });
    
    if (!existingRepartition) {
      return NextResponse.json({ error: "Repartição não encontrada" }, { status: 404 });
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
    
    // Check if name is already used by another repartition in the same department
    if (validatedData.data.name !== existingRepartition.name || 
        validatedData.data.department_id !== existingRepartition.department_id) {
      const nameExists = await db.repartition.findFirst({
        where: {
          name: validatedData.data.name,
          department_id: validatedData.data.department_id,
          id: { not: params.id },
        },
      });
      
      if (nameExists) {
        return NextResponse.json(
          { error: "Já existe uma repartição com este nome no departamento seleccionado" },
          { status: 409 }
        );
      }
    }
    
    // Update repartition
    const updatedRepartition = await db.repartition.update({
      where: { id: params.id },
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
    
    return NextResponse.json(updatedRepartition);
  } catch (error) {
    console.error("Error updating repartition:", error);
    return NextResponse.json(
      { error: "Falha ao actualizar repartição" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    // Check if repartition exists
    const repartition = await db.repartition.findUnique({
      where: { id: params.id },
      include: {
        equipments: { select: { id: true }, take: 1 },
      },
    });
    
    if (!repartition) {
      return NextResponse.json({ error: "Repartição não encontrada" }, { status: 404 });
    }
    
    // Check if repartition has related equipment
    if (repartition.equipments.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir a repartição porque existem equipamentos associados" },
        { status: 400 }
      );
    }
    
    // Delete repartition
    await db.repartition.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting repartition:", error);
    return NextResponse.json(
      { error: "Falha ao eliminar repartição" },
      { status: 500 }
    );
  }
}