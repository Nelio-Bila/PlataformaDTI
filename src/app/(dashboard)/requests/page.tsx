// src/app/(dashboard)/requests/page.tsx
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { RequestClient } from "@/components/tables/request-tables/client";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Requisições",
    description: "Gestão de requisições",
  };
}

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Requisições", link: "/requests" },
];

export default function RequestsPage() {
  return (
    <PageContainer>
      <div className="p-6 w-full">
        <Breadcrumbs items={breadcrumbItems} />
        <RequestClient />
      </div>
    </PageContainer>
  );
}