import { db } from "@/lib/db";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Endereço de email inválido" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedFields = loginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: validatedFields.email },
      select: { id: true, name: true, email: true, password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const isValid = await compare(validatedFields.password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Return user data (this will be used to create a session/token)
    return NextResponse.json(
      { success: true, user: { id: user.id, name: user.name, email: user.email } },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Error in login:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao fazer login" },
      { status: 500 }
    );
  }
}