import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SectorTable } from "@/components/admin/dictionary/sector-table";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { SectorCreateButton } from "@/components/admin/dictionary/sector-create-button";

export const metadata: Metadata = {
  title: "Gestão de Sectores | Hospital IT Asset Tracker",
  description: "Gerir sectores da organização",
};

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Administração", link: "/admin" },
  { title: "Dicionário do Sistema", link: "/admin/dictionary" },
  { title: "Sectores" },
];

export default async function SectorPage() {
  const session = await auth();
  
  // Check if user is authenticated and has admin permissions
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  // Fetch all sectors with their departments and services
  const sectors = await db.sector.findMany({
    orderBy: { name: 'asc' },
    include: {
      department: true,
      service: true,
    }
  });
  
  // Fetch all departments for the form
  const departments = await db.department.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  // Fetch all services for the form
  const services = await db.service.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, department_id: true }
  });
  
  return (
    <PageContainer>
      <div className="flex flex-col gap-5">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Sectores</h1>
          <SectorCreateButton departments={departments} services={services} />
        </div>
        
        <p className="text-muted-foreground">
          Gerencie os sectores da organização. Os sectores estão associados a departamentos e serviços.
        </p>
        
        <SectorTable 
          initialSectors={sectors} 
          departments={departments} 
          services={services}
        />
      </div>
    </PageContainer>
  );
}