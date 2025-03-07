// src/app/(dashboard)/users/page.tsx
// import { Breadcrumbs } from "@/components/layout/breadcrumbs";
// import PageContainer from "@/components/layout/page-container";
// import { UsersClient } from "@/components/tables/users-tables/client";
// import type { Metadata } from "next";

// export async function generateMetadata(): Promise<Metadata> {
//   return {
//     title: "Gestão de Utilizadores",
//     description: "Gerir Utilizadores, grupos e permissões",
//   };
// }

// const breadcrumbItems = [
//   { title: "Painel", link: "/dashboard" },
//   { title: "Utilizadores", link: "/users" },
// ];

// export default function UsersPage() {
//   return (
//     <PageContainer>
//       <div className="p-6 w-full">
//         <Breadcrumbs items={breadcrumbItems} />
//         <UsersClient />
//       </div>
//     </PageContainer>
//   );
// }


import { auth } from "@/auth";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { UsersClient } from "@/components/tables/users-tables/client";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
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

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // Check for user:read permission
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
  if (!permissions.includes("user:read")) {
    return (
      <PageContainer>
        <div className="p-6 w-full">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p>Você não tem permissão para visualizar esta página.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="p-6 w-full">
        <Breadcrumbs items={breadcrumbItems} />
        <UsersClient />
      </div>
    </PageContainer>
  );
}