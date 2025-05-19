import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RepartitionTable } from "@/components/admin/dictionary/repartition-table";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { RepartitionCreateButton } from "@/components/admin/dictionary/repartition-create-button";

export const metadata: Metadata = {
  title: "Gestão de Repartições | Hospital IT Asset Tracker",
  description: "Gerir repartições da organização",
};

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Administração", link: "/admin" },
  { title: "Dicionário do Sistema", link: "/admin/dictionary" },
  { title: "Repartições" },
];

export default async function RepartitionPage() {
  const session = await auth();
  
  // Check if user is authenticated and has admin permissions
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  // Fetch all repartitions with their departments
  const repartitions = await db.repartition.findMany({
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
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Repartições</h1>
          <RepartitionCreateButton departments={departments} />
        </div>
        
        <p className="text-muted-foreground">
          Gerencie as repartições da organização. As repartições estão associadas a departamentos.
        </p>
        
        <RepartitionTable initialRepartitions={repartitions} departments={departments} />
      </div>
    </PageContainer>
  );
}