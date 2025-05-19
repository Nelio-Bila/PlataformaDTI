import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const directionSchema = z.object({
  name: z.string().min(2).max(100),
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
    
    const direction = await db.direction.findUnique({
      where: { id: params.id },
    });
    
    if (!direction) {
      return NextResponse.json({ error: "Direcção não encontrada" }, { status: 404 });
    }
    
    return NextResponse.json(direction);
  } catch (error) {
    console.error("Error fetching direction:", error);
    return NextResponse.json(
      { error: "Falha ao obter direcção" },
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
    const validatedData = directionSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Dados de entrada inválidos", details: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    // Check if direction exists
    const existingDirection = await db.direction.findUnique({
      where: { id: params.id },
    });
    
    if (!existingDirection) {
      return NextResponse.json({ error: "Direcção não encontrada" }, { status: 404 });
    }
    
    // Check if name is already used by another direction
    if (validatedData.data.name !== existingDirection.name) {
      const nameExists = await db.direction.findFirst({
        where: {
          name: validatedData.data.name,
          id: { not: params.id },
        },
      });
      
      if (nameExists) {
        return NextResponse.json(
          { error: "Já existe uma direcção com este nome" },
          { status: 409 }
        );
      }
    }
    
    // Update direction
    const updatedDirection = await db.direction.update({
      where: { id: params.id },
      data: {
        name: validatedData.data.name,
      },
    });
    
    return NextResponse.json(updatedDirection);
  } catch (error) {
    console.error("Error updating direction:", error);
    return NextResponse.json(
      { error: "Falha ao actualizar direcção" },
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
    
    // Check if direction exists
    const direction = await db.direction.findUnique({
      where: { id: params.id },
      include: {
        departments: { select: { id: true }, take: 1 },
      },
    });
    
    if (!direction) {
      return NextResponse.json({ error: "Direcção não encontrada" }, { status: 404 });
    }
    
    // Check if direction has related departments
    if (direction.departments.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir a direcção porque existem departamentos associados" },
        { status: 400 }
      );
    }
    
    // Delete direction
    await db.direction.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting direction:", error);
    return NextResponse.json(
      { error: "Falha ao eliminar direcção" },
      { status: 500 }
    );
  }
}