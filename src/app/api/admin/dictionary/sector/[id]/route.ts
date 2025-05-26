import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const sectorSchema = z.object({
  name: z.string().min(2).max(100),
  department_id: z.string(),
  service_id: z.string(),
});

export async function GET(req: NextRequest, { params } : { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    const sector = await db.sector.findUnique({
      where: { id: id },
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
    
    if (!sector) {
      return NextResponse.json({ error: "Sector não encontrado" }, { status: 404 });
    }
    
    return NextResponse.json(sector);
  } catch (error) {
    console.error("Error fetching sector:", error);
    return NextResponse.json(
      { error: "Falha ao obter sector" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params } : { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    
    // Check if sector exists
    const existingSector = await db.sector.findUnique({
      where: { id: id },
    });
    
    if (!existingSector) {
      return NextResponse.json({ error: "Sector não encontrado" }, { status: 404 });
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
    
    // Check if name is already used by another sector in the same dept/service combination
    if (validatedData.data.name !== existingSector.name || 
        validatedData.data.department_id !== existingSector.department_id ||
        validatedData.data.service_id !== existingSector.service_id) {
        
      const nameExists = await db.sector.findFirst({
        where: {
          name: validatedData.data.name,
          department_id: validatedData.data.department_id,
          service_id: validatedData.data.service_id,
          id: { not: id },
        },
      });
      
      if (nameExists) {
        return NextResponse.json(
          { error: "Já existe um sector com este nome no departamento/serviço seleccionado" },
          { status: 409 }
        );
      }
    }
    
    // Update sector
    const updatedSector = await db.sector.update({
      where: { id: params.id },
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
    
    return NextResponse.json(updatedSector);
  } catch (error) {
    console.error("Error updating sector:", error);
    return NextResponse.json(
      { error: "Falha ao actualizar sector" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params } : { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    // Check if sector exists
    const sector = await db.sector.findUnique({
      where: { id: id },
      include: {
        equipments: { select: { id: true }, take: 1 },
      },
    });
    
    if (!sector) {
      return NextResponse.json({ error: "Sector não encontrado" }, { status: 404 });
    }
    
    // Check if sector has related equipment
    if (sector.equipments.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir o sector porque existem equipamentos associados" },
        { status: 400 }
      );
    }
    
    // Delete sector
    await db.sector.delete({
      where: { id: id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sector:", error);
    return NextResponse.json(
      { error: "Falha ao eliminar sector" },
      { status: 500 }
    );
  }
}