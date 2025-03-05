import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { UserDetails } from "@/components/tables/users-tables/details";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const user = await db.user.findUnique({
    where: { id: params.id },
    select: { name: true, email: true },
  });

  if (!user) {
    return {
      title: "Utilizador Não Encontrado",
      description: "Detalhes de um utilizador",
    };
  }

  return {
    title: `Detalhes do Utilizador: ${user.name || user.email}`,
    description: `Visualizar detalhes, grupos e requisições do utilizador ${user.name || user.email}`,
  };
}

// Update breadcrumbItems to explicitly allow undefined link for the last item
const breadcrumbItems = (userName: string | null, userEmail: string | null) => [
  { title: "Painel", link: "/dashboard" },
  { title: "Utilizadores", link: "/users" },
  { title: userName || userEmail || "Utilizador", link: undefined }, // Explicitly set link as undefined
];

export default async function UserDetailsPage({ params }: { params: { id: string } }) {
  const user = await db.user.findUnique({
    where: { id: params.id },
    include: {
      groups: { include: { group: true } },
      requestsMade: true,
      requestsApproved: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <PageContainer>
      <div className="p-6 w-full">
        <Breadcrumbs items={breadcrumbItems(user.name, user.email)} />
        <UserDetails user={user} />
      </div>
    </PageContainer>
  );
}