import { SafeUserType } from "@/types";
import NextAuth, { DefaultSession } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { login } from "./actions/auth-actions";
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
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        return login(credentials.email as string, credentials.password as string);
      },
    }),
  ],
  session: {
    strategy: "jwt",
    // maxAge: 15 * 60, // 15 minutes in seconds (matching Django's ACCESS_TOKEN_LIFETIME)
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

  interface User extends SafeUserType { }
}
