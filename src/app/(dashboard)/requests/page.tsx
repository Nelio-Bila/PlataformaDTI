// src/app/(dashboard)/requests/page.tsx
import { auth } from "@/auth";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { RequestClient } from "@/components/tables/request-tables/client";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Requisições",
    description: "Gestão de requisições",
  };
}

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Requisições", link: "/requests" },
];

export default async function RequestsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // Check for request:read permission
  const userGroups = await db.userGroup.findMany({
    where: { user_id: session.user.id },
    include: {
      group: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });

  const permissions = userGroups.flatMap(ug => ug.group.permissions.map(gp => gp.permission.name));
  const hasFullReadPermission = permissions.includes("request:read");

  // If user has no full read permission, they can still see their own or department-related requests
  return (
    <PageContainer>
      <div className="p-6 w-full">
        <Breadcrumbs items={breadcrumbItems} />
        <RequestClient />
      </div>
    </PageContainer>
  );
}