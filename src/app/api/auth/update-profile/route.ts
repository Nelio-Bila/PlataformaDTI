// src/app/api/auth/update-profile/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  id: z.string().min(1, "User ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedFields = UpdateProfileSchema.parse(body);

    // Update user and return the updated data
    const updatedUser = await db.user.update({
      where: { id: validatedFields.id },
      data: {
        name: validatedFields.name,
        updated_at: new Date(),
      },
      // Select only the fields we need
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        created_at: true,
        updated_at: true,
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: error.errors[0].message
      }, { status: 400 });
    }

    console.error("Profile update error:", error);
    return NextResponse.json({
      success: false,
      error: "Erro ao actualizar perfil"
    }, { status: 500 });
  }
}