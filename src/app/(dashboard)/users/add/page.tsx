// src/app/(dashboard)/users/add/page.tsx
import { UserForm } from "@/components/forms/user-form";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Novo Utilizador",
    description: "Criar um novo Utilizador",
  };
}

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Utilizadors", link: "/users" },
  { title: "Novo Utilizador", link: "/users/add" },
];

export default function UserAddPage() {
  return (
    <div className="p-6 w-full">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl font-bold text-center my-3">Novo Utilizador</h1>
      <UserForm />
    </div>
  );
}