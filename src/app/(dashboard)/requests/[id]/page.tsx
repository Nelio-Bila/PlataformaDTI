// src/app/(dashboard)/requests/[id]/page.tsx
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { RequestDetails } from "@/components/requests/request-details";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dados da Requisição",
    description: "Detalhes de uma requisição específica",
  };
}

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Requisições", link: "/requests" },
  { title: "Detalhes da Requisição" },
];

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request_id = id;

  const request = await db.request.findFirst({
    where: { id: request_id },
    include: {
      items: true,
      requester_department: true,
      destination_department: true,
      requester: { select: { name: true } },
      approver: { select: { name: true } },
    },
  });


  if (!request) {
    return (
      <PageContainer>
        <div className="p-6 w-full">
          <Breadcrumbs items={breadcrumbItems} />
          <p>Requisição não encontrada.</p>
        </div>
      </PageContainer>
    );
  }

  // Transform the data to match the RequestDetailsData interface
  const requestData = {
    id: request.id,
    request_number: request.request_number,
    type: request.type,
    status: request.status,
    created_at: request.created_at.toISOString(),
    updated_at: request.updated_at.toISOString(),
    requester: request.requester,
    requester_department: request.requester_department,
    destination_department: request.destination_department,
    items: request.items,
    comments: request.comments,
    approved_by: request.approved_by,
    approver: request.approver,
  };

  return (
    <div className="p-6 w-full">
      <Breadcrumbs items={breadcrumbItems} />
      <RequestDetails requestData={requestData} />
    </div>
  );
}