// src/app/(dashboard)/permissions/add/page.tsx
import { PermissionForm } from "@/components/forms/permission-form";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Nova Permissão",
    description: "Criar uma nova permissão",
  };
}

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Utilizadores", link: "/users" },
  { title: "Grupos de utilizadores", link: "/users/groups" },
  { title: "Permissões", link: "/users/groups/permissions" },
  { title: "Nova Permissão", link: "/users/groups/permissions/add" },
];

export default function PermissionAddPage() {
  return (
    <div className="p-6 w-full">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl font-bold text-center my-3">Nova Permissão</h1>
      <PermissionForm />
    </div>
  );
}