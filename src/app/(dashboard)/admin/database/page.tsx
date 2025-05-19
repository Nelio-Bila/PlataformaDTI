import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { DatabaseManager } from "@/components/admin/database-manager";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Database Management | Hospital IT Asset Tracker",
  description: "Backup and restore database for Hospital IT Asset Tracker",
};

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Administração", link: "/admin" },
  { title: "Gestão de Base de Dados" },
];

export default async function DatabaseManagementPage() {
  const session = await auth();
  
  // Check if user is authenticated and has admin permissions
  if (!session?.user) {
    redirect("/dashboard");
  }
//   if (!session?.user || !session.user.isAdmin) {
//     redirect("/dashboard");
//   }

  return (
    <PageContainer>
      <div className="flex flex-col gap-5">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Database Management</h1>
        </div>
        
        <div className="grid gap-4">
          <DatabaseManager />
        </div>
      </div>
    </PageContainer>
  );
}