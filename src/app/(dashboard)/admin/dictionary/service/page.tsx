import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ServiceTable } from "@/components/admin/dictionary/service-table";
import { db } from "@/lib/db";
import { ServiceCreateButton } from "@/components/admin/dictionary/service-create-button";

export const metadata: Metadata = {
  title: "Gestão de Serviços | Hospital IT Asset Tracker",
  description: "Gerir serviços da organização",
};

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Administração", link: "/admin" },
  { title: "Dicionário do Sistema", link: "/admin/dictionary" },
  { title: "Serviços" },
];

export default async function ServicePage() {
  const session = await auth();
  
  // Check if user is authenticated and has admin permissions
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  // Fetch all services with their departments
  const services = await db.service.findMany({
    orderBy: { name: 'asc' },
    include: {
      department: true,
    }
  });
  
  // Fetch all departments for the form
  const departments = await db.department.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });
  
  return (
    <PageContainer>
      <div className="flex flex-col gap-5">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Serviços</h1>
          <ServiceCreateButton departments={departments} />
        </div>
        
        <p className="text-muted-foreground">
          Gere os serviços da organização. Os serviços estão associados a departamentos.
        </p>
        
        <ServiceTable initialServices={services} departments={departments} />
      </div>
    </PageContainer>
  );
}