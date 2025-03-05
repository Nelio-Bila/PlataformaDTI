import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { GroupDetails } from "@/components/tables/groups-tables/details";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const group = await db.group.findUnique({
    where: { id: params.id },
    select: { name: true },
  });

  if (!group) {
    return {
      title: "Grupo Não Encontrado",
      description: "Detalhes de um grupo",
    };
  }

  return {
    title: `Detalhes do Grupo: ${group.name}`,
    description: `Visualizar detalhes, utilizadores e permissões do grupo ${group.name}`,
  };
}

const breadcrumbItems = (groupName: string) => [
  { title: "Painel", link: "/dashboard" },
  { title: "Utilizadores", link: "/users" },
  { title: "Grupos de utilizadores", link: "/users/groups" },
  { title: groupName},
];

export default async function GroupDetailsPage({ params }: { params: { id: string } }) {
  const group = await db.group.findUnique({
    where: { id: params.id },
    include: {
      users: { include: { user: true } },
      permissions: { include: { permission: true } },
    },
  });

  if (!group) {
    notFound();
  }

  return (
    <PageContainer>
      <div className="p-6 w-full">
        <Breadcrumbs items={breadcrumbItems(group.name)} />
        <GroupDetails group={group} />
      </div>
    </PageContainer>
  );
}