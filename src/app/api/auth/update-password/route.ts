import { db } from "@/lib/db";
import { compare, hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdatePasswordSchema = z.object({
  userId: z.string().min(1, "User ID é obrigatório"),
  currentPassword: z.string().min(1, "Senha actual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedFields = UpdatePasswordSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: validatedFields.userId },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 });
    }

    const isValid = await compare(validatedFields.currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Senha actual incorrecta" }, { status: 400 });
    }

    const hashedPassword = await hash(validatedFields.newPassword, 10);
    await db.user.update({
      where: { id: validatedFields.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Erro ao actualizar senha" }, { status: 500 });
  }
}