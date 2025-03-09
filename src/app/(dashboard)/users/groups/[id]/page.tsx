import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { GroupDetails } from "@/components/tables/groups-tables/details";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const group_id = id;

  const group = await db.group.findUnique({
    where: { id: group_id },
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

export default async function GroupDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const grouo_id = id;

  const group = await db.group.findUnique({
    where: { id: grouo_id },
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