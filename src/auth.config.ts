import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { login } from "@/actions/auth-actions";

export const authConfig = {
  pages: {
    error: "/",
    signIn: "/",
    signOut: "/",
  },
  callbacks: {
    authorized({ auth }) {
      const isAuthenticated = !!auth?.user;
      return isAuthenticated;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        return login(credentials.email as string, credentials.password as string);
      },
    }),
  ],
} satisfies NextAuthOptions;


