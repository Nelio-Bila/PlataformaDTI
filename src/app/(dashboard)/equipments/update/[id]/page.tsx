// src/app/(dashboard)/equipments/add/page.tsx
"use client"
import { EquipmentUpdateForm } from "@/components/forms/equipment-update-form";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
// import type { Metadata } from "next";
import { useParams } from "next/navigation";

// export async function generateMetadata(): Promise<Metadata> {
//   return {
//     title: "Equipamentos",
//     description: "Equipamentos registrados",
//   };
// }

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Equipamentos", link: "/equipments" },
  { title: "Registro de Equipamento", link: "/equipments/add" },
];

export default function EquipmentAddPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="p-6 w-full">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl font-bold text-center my-3">Registro de equipamento</h1>
      <EquipmentUpdateForm equipmentId={id} />
    </div>

  )
}
