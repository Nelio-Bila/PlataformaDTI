import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const departmentSchema = z.object({
  name: z.string().min(2).max(100),
  direction_id: z.string(),
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
    
    const department = await db.department.findUnique({
      where: { id: params.id },
      include: {
        direction: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (!department) {
      return NextResponse.json({ error: "Departamento não encontrado" }, { status: 404 });
    }
    
    return NextResponse.json(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    return NextResponse.json(
      { error: "Falha ao obter departamento" },
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
    const validatedData = departmentSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Dados de entrada inválidos", details: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    // Check if department exists
    const existingDepartment = await db.department.findUnique({
      where: { id: params.id },
    });
    
    if (!existingDepartment) {
      return NextResponse.json({ error: "Departamento não encontrado" }, { status: 404 });
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
    
    // Check if name is already used by another department in the same direction
    if (validatedData.data.name !== existingDepartment.name || 
        validatedData.data.direction_id !== existingDepartment.direction_id) {
      const nameExists = await db.department.findFirst({
        where: {
          name: validatedData.data.name,
          direction_id: validatedData.data.direction_id,
          id: { not: params.id },
        },
      });
      
      if (nameExists) {
        return NextResponse.json(
          { error: "Já existe um departamento com este nome na direcção seleccionada" },
          { status: 409 }
        );
      }
    }
    
    // Update department
    const updatedDepartment = await db.department.update({
      where: { id: params.id },
      data: {
        name: validatedData.data.name,
        direction_id: validatedData.data.direction_id,
      },
      include: {
        direction: {
          select: {
            name: true
          }
        }
      }
    });
    
    return NextResponse.json(updatedDepartment);
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Falha ao actualizar departamento" },
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
    
    // Check if department exists
    const department = await db.department.findUnique({
      where: { id: params.id },
      include: {
        services: { select: { id: true }, take: 1 },
        sectors: { select: { id: true }, take: 1 },
        repartitions: { select: { id: true }, take: 1 }
      },
    });
    
    if (!department) {
      return NextResponse.json({ error: "Departamento não encontrado" }, { status: 404 });
    }
    
    // Check if department has related entities
    if (department.services.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir o departamento porque existem serviços associados" },
        { status: 400 }
      );
    }
    
    if (department.sectors.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir o departamento porque existem sectores associados" },
        { status: 400 }
      );
    }
    
    if (department.repartitions.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir o departamento porque existem repartições associadas" },
        { status: 400 }
      );
    }
    
    // Delete department
    await db.department.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Falha ao eliminar departamento" },
      { status: 500 }
    );
  }
}