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
  { title: "Equipamentos", link: "/dashboard/equipments" },
];

export default function EquipmentAddPage() {
    return (
        <div className="space-y-6">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="text-2xl font-bold text-center">Registro de equipamento</h1>
                <EquipmentForm />
        </div>

    )
}
