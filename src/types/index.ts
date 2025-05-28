import { Icons } from '@/components/icons';

// types/index.ts
export interface SafeUserType {
    id: string; // Required: User's unique ID from Prisma
    name?: string | null; // Optional: User's name, nullable per Prisma schema
    email?: string | null; // Optional: User's email, nullable per Prisma schema
    created_at?: string | null;
    updated_at?: string | null;
    groups?: Array<{
        name: string; // Group name from Prisma Group model
        permissions: string[]; // Array of permission names from Prisma Permission model
    }>; // Optional: Groups and their permissions fetched via Prisma
}


export interface NavItem {
    title: string;
    href?: string;
    disabled?: boolean;
    external?: boolean;
    icon?: keyof typeof Icons;
    label?: string;
    description?: string;
  }