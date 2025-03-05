// src/app/(dashboard)/groups/add/page.tsx
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { GroupForm } from "@/components/forms/group-form";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Novo Grupo",
    description: "Criar um novo grupo",
  };
}

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Utilizadores", link: "/users" },
  { title: "Grupos de utilizadores", link: "/users/groups" },
  { title: "Novo Grupo de utilizadores", link: "/users/groups/add" },
];

export default function GroupAddPage() {
  return (
    <div className="p-6 w-full">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl font-bold text-center my-3">Novo Grupo de utilizadores</h1>
      <GroupForm />
    </div>
  );
}