// src/app/(dashboard)/equipments/page.tsx
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { EquipmentClient } from "@/components/tables/equipment-tables/client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Equipamento",
    description: "Equipamento registrados",
  };
}

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Equipamento", link: "/equipment" },
];


export default function EquipmentsPage() {
  return (
    <PageContainer>
      <div className="p-6 w-full">
        <Breadcrumbs items={breadcrumbItems} />
        <EquipmentClient />
      </div>
    </PageContainer>
  );
}