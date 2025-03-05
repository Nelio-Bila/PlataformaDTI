// src/app/(dashboard)/users/page.tsx
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { UsersClient } from "@/components/tables/users-tables/client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Gestão de Utilizadores",
    description: "Gerir Utilizadores, grupos e permissões",
  };
}

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Utilizadores", link: "/users" },
];

export default function UsersPage() {
  return (
    <PageContainer>
      <div className="p-6 w-full">
        <Breadcrumbs items={breadcrumbItems} />
        <UsersClient />
      </div>
    </PageContainer>
  );
}