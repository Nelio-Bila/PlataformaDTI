import { DefaultSession } from "next-auth";
export declare module "next-auth" {
    interface Session {
        user: {
            id: string; // From JWT token.id and Prisma user
            name?: string | null; // From DefaultSession["user"] and Prisma
            email?: string | null; // From DefaultSession["user"] and Prisma
            groups?: Array<{
                name: string;
                permissions: string[];
            }>; // From Prisma session callback
        }& DefaultSession["user"];
    }

    interface User {
        id: string; // Returned by authorize
        name?: string | null; // Returned by authorize
        email?: string | null; // Returned by authorize
    }
}

export declare module "next-auth/jwt" {
    interface JWT {
        id?: string; // Only id is stored in JWT
    }
}



