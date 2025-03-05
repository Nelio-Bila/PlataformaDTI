// src/app/(dashboard)/groups/page.tsx
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { GroupsClient } from "@/components/tables/groups-tables/client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Gestão de Grupos",
    description: "Gerir grupos de utilizadores e permissões",
  };
}

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Utilizadores", link: "/users" },
  { title: "Grupos de utilizadores", link: "/users/groups" },
];

export default function GroupsPage() {
  return (
    <PageContainer>
      <div className="p-6 w-full">
        <Breadcrumbs items={breadcrumbItems} />
        <GroupsClient />
      </div>
    </PageContainer>
  );
}