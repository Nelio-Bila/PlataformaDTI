// src/app/(dashboard)/equipments/add/page.tsx
import { EquipmentUpdateForm } from "@/components/forms/equipment-update-form";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Edição de dados de equipamento",
    description: "Edição de dados de um equipamento",
  };
}



export default async function EquipmentUpdatePage({ params, }: { params: Promise<{ id: string }> }) {
  const id = (await params).id

  const breadcrumbItems = [
    { title: "Painel", link: "/dashboard" },
    { title: "Equipamentos", link: "/equipments" },
    { title: "Edição de Equipamento", link: `/equipments/update/${id}` },
  ];

  return (
    <div className="p-6 w-full">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl font-bold text-center my-3">Edição de dados de equipamento</h1>
      <EquipmentUpdateForm equipmentId={id} />
    </div>

  )
}
