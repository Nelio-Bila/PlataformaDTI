import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RequestDetails } from "@/components/requests/request-details";
import { db } from "@/lib/db";
import type { Metadata } from "next";

import { AlertTriangleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StepBack } from "lucide-react";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dados de Requisição",
    description: "Detalhes de uma requisição",
  };
}

const breadcrumbItems = [
  { title: "Página inicial", link: "/" },
  { title: "Requisição", link: "/requests/view-guest" },
];


export default async function ViewGuestRequest({ searchParams }: { searchParams: Promise<{ ref: string }> }) {
  const { ref } = await searchParams;

  const request = await db.request.findFirst({
    where: { request_number: ref },
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
      <div className="p-6 w-full">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex min-h-svh">
          <div className="flex mx-auto my-auto">
            <Card className="w-full max-w-md mx-auto border">
              <CardHeader className="flex flex-col items-center gap-2 p-6">
                <AlertTriangleIcon className="h-8 w-8 text-red-500" />
                <CardTitle>Requisição inexistente</CardTitle>
                <CardDescription className="text-center">
                  Não foi encontrada requisição com esse número
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Link href="/">
                  <Button className="w-full">
                    <StepBack />
                    Voltar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
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