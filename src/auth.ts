// // src/auth.ts
import { login } from "@/actions/auth-actions";
import { SafeUserType } from "@/types";
import NextAuth from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

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
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes in seconds
  },
  callbacks: {
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as AdapterUser & SafeUserType;
      }
      session.expires = new Date(Date.now() + 15 * 60 * 1000).toISOString() as any; // Temporary workaround
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
        token.iat = Math.floor(Date.now() / 1000);
        token.exp = Math.floor(Date.now() / 1000) + 15 * 60;
      }
      if (token.exp && Date.now() / 1000 > token.exp) {
        return null;
      }
      return token;
    },
  },

});

// Type augmentations for NextAuth
declare module "next-auth" {
  interface Session {
    user: SafeUserType;
    expires: string; // Explicitly a string
  }

  interface User extends SafeUserType { }

  interface JWT {
    user?: SafeUserType;
    iat?: number;
    exp?: number;
  }
}

