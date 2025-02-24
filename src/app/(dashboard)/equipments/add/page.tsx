// src/app/(dashboard)/equipments/add/page.tsx
import { EquipmentForm } from "@/components/forms/equipment-form";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Equipamentos",
    description: "Equipamentos registrados",
  };
}

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Equipamentos", link: "/equipments" },
  { title: "Registro de Equipamento", link: "/equipments/add" },
];

export default function EquipmentAddPage() {
  return (
    <div className="p-6 w-full">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl font-bold text-center my-3">Registro de equipamento</h1>
      <EquipmentForm />
    </div>

  )
}
