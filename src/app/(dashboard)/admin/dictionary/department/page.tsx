import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DepartmentTable } from "@/components/admin/dictionary/department-table";
import { db } from "@/lib/db";
import { DepartmentCreateButton } from "@/components/admin/dictionary/department-create-button";

export const metadata: Metadata = {
  title: "Gestão de Departamentos | Hospital IT Asset Tracker",
  description: "Gerir departamentos da organização",
};

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Administração", link: "/admin" },
  { title: "Dicionário do Sistema", link: "/admin/dictionary" },
  { title: "Departamentos" },
];

export default async function DepartmentPage() {
  const session = await auth();
  
  // Check if user is authenticated and has admin permissions
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  // Fetch all departments with their directions
  const departments = await db.department.findMany({
    orderBy: { name: 'asc' },
    include: {
      direction: true,
    }
  });
  
  // Fetch all directions for the form
  const directions = await db.direction.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });
  
  return (
    <PageContainer>
      <div className="flex flex-col gap-5">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Departamentos</h1>
          <DepartmentCreateButton directions={directions} />
        </div>
        
        <p className="text-muted-foreground">
          Gerencie os departamentos da organização. Os departamentos estão associados a uma direcção.
        </p>
        
        <DepartmentTable initialDepartments={departments} directions={directions} />
      </div>
    </PageContainer>
  );
}