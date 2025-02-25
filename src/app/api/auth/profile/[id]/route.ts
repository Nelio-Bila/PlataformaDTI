// src/app/api/auth/profile/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest,{ params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id

    // Get user and return the data
    const user = await db.user.findUnique({
      where: { id: id },

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
      user
    }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: error.errors[0].message
      }, { status: 400 });
    }

    console.error("Profile get error:", error);
    return NextResponse.json({
      success: false,
      error: "Erro ao buscar perfil"
    }, { status: 500 });
  }
}