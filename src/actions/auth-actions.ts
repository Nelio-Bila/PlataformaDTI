"use server";

import { db } from "@/lib/db";
import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha actual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
});

const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  // phone: z.string().optional(),
  // birthDate: z.string().optional(),
  // location: z.string().optional(),
  // occupation: z.string().optional(),
  // address: z.string().optional(),
});

export async function hash_password(password: string) {
  return hash(password, 10);
}

export async function create_user(data: {
  email: string;
  password: string;
  name?: string | null;
}) {
  try {
    const hashed_password = await hash_password(data.password);
    const user = await db.user.create({
      data: {
        email: data.email,
        password: hashed_password,
        name: data.name || null,
        groups: {
          create: [
            {
              group: {
                connectOrCreate: {
                  where: { name: "Users" },
                  create: { name: "Users" },
                },
              },
            },
          ],
        },
      },
    });
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}



export async function login(email?: string, password?: string) {
  // Type guard to ensure email and password are strings
  if (!email || !password) return null;

  const user = await db.user.findUnique({
    where: { email: email }, // Now TypeScript knows email is a string
  });

  if (!user || !user.password) return null;

  const is_valid = await compare(password, user.password); // Fixed async issue
  if (!is_valid) return null;

  return { id: user.id, name: user.name, email: user.email };
}




export async function update_password(
  user_id: string,
  data: z.infer<typeof UpdatePasswordSchema>
) {
  try {
    const validatedFields = UpdatePasswordSchema.parse(data);

    const user = await db.user.findUnique({
      where: { id: user_id },
      select: { password: true },
    });

    if (!user?.password) {
      return { success: false, error: "Usuário não encontrado" };
    }

    const isValid = await compare(validatedFields.currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: "Senha actual incorrecta" };
    }

    const hashedPassword = await hash(validatedFields.newPassword, 10);
    await db.user.update({
      where: { id: user_id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Erro ao actualizar senha" };
  }
}

export async function update_profile(
  id: string,
  data: z.infer<typeof UpdateProfileSchema>
) {
  try {
    // Clean the input data by removing empty strings
    const cleanedData = {
      name: data.name,
    };

    const validatedFields = UpdateProfileSchema.parse(cleanedData);

    await db.user.update({
      where: { id: id },
      data: {
        ...validatedFields,
        updated_at: new Date(),
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Erro ao actualizar perfil" };
  }
}