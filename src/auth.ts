import { login } from "@/actions/auth-actions";
import { SafeUserType } from "@/types";
import NextAuth, { DefaultSession } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

// async function login(email: string, password: string) {
//   const response = await fetch("/api/auth/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   });

//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error.error || "Credenciais inválidas");
//   }

//   const data = await response.json();
//   return data.user;
// }

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        try {
          const user = await login(credentials.email as string, credentials.password as string);
          return user;
        } catch (error: any) {
          console.log(error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      session.user = token.user as AdapterUser & SafeUserType;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token ? token : null;
    },
  },
});

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: SafeUserType;
  }

  interface User extends SafeUserType {}
}