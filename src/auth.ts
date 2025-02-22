//src/auth.ts

import { db } from "@/lib/db";
import { SafeUserType } from "@/types";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { DefaultSession } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { login } from "./actions/auth-actions";

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        return login(credentials);
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 15 * 60,
  },
  callbacks: {
    async session({ session, token }) {
      session.user = token.user as AdapterUser & SafeUserType;
      return session;
    },
    async jwt({ token, user }) {
      // On initial login, add user ID to token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: SafeUserType;
  }

  interface User extends SafeUserType { }
}



