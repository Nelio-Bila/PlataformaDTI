"use server";

import { db } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs"; // Using bcryptjs as per your suggestion

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
    const user = await prisma.user.create({
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


export async function login(credentials: Partial<Record<"email" | "password", unknown>>) {
  if (!credentials?.email || !credentials?.password) return null;

  const user = await db.user.findUnique({
    where: { email: credentials?.email },
  });

  if (!user || !user.password) return null;

  const is_valid = compare(credentials.password, user.password);
  if (!is_valid) return null;

  return { id: user.id, name: user.name, email: user.email };

}