// src/app/(dashboard)/requests/add/page.tsx
import { RequestForm } from "@/components/forms/request-form";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Nova Requisição",
    description: "Criar uma nova requisição",
  };
}

const breadcrumbItems = [
  { title: "Página inicial", link: "/" },
  { title: "Nova Requisição", link: "/requests/add" },
];

export default function RequestAddPage() {
  return (
    <div className="p-6 w-full">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl font-bold text-center my-3">Nova Requisição</h1>
      <RequestForm />
    </div>
  );
}