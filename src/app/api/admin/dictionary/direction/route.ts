import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const directionSchema = z.object({
  name: z.string().min(2).max(100),
});

export async function GET() {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    const directions = await db.direction.findMany({
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json(directions);
  } catch (error) {
    console.error("Error fetching directions:", error);
    return NextResponse.json(
      { error: "Falha ao obter direcções" },
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
    const validatedData = directionSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Dados de entrada inválidos", details: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    // Check if direction with same name already exists
    const existingDirection = await db.direction.findFirst({
      where: { name: validatedData.data.name },
    });
    
    if (existingDirection) {
      return NextResponse.json(
        { error: "Já existe uma direcção com este nome" },
        { status: 409 }
      );
    }
    
    // Create new direction
    const direction = await db.direction.create({
      data: {
        name: validatedData.data.name,
      },
    });
    
    return NextResponse.json(direction, { status: 201 });
  } catch (error) {
    console.error("Error creating direction:", error);
    return NextResponse.json(
      { error: "Falha ao criar direcção" },
      { status: 500 }
    );
  }
}