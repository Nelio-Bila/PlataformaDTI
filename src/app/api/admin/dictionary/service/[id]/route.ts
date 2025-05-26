import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(2).max(100),
  department_id: z.string(),
});

export async function GET(req: NextRequest, { params } : { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    const service = await db.service.findUnique({
      where: { id: id },
      include: {
        department: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }
    
    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Falha ao obter serviço" },
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
    const validatedData = serviceSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Dados de entrada inválidos", details: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    // Check if service exists
    const existingService = await db.service.findUnique({
      where: { id: id },
    });
    
    if (!existingService) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
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
    
    // Check if name is already used by another service in the same department
    if (validatedData.data.name !== existingService.name || 
        validatedData.data.department_id !== existingService.department_id) {
      const nameExists = await db.service.findFirst({
        where: {
          name: validatedData.data.name,
          department_id: validatedData.data.department_id,
          id: { not: id },
        },
      });
      
      if (nameExists) {
        return NextResponse.json(
          { error: "Já existe um serviço com este nome no departamento seleccionado" },
          { status: 409 }
        );
      }
    }
    
    // Update service
    const updatedService = await db.service.update({
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
    
    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Falha ao actualizar serviço" },
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
    
    // Check if service exists
    const service = await db.service.findUnique({
      where: { id: id },
      include: {
        sectors: { select: { id: true }, take: 1 },
      },
    });
    
    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }
    
    // Check if service has related sectors
    if (service.sectors.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir o serviço porque existem sectores associados" },
        { status: 400 }
      );
    }
    
    // Delete service
    await db.service.delete({
      where: { id: id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Falha ao eliminar serviço" },
      { status: 500 }
    );
  }
}