import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DirectionTable } from "@/components/admin/dictionary/direction-table";
import { db } from "@/lib/db";
import { DirectionCreateButton } from "@/components/admin/dictionary/direction-create-button";

export const metadata: Metadata = {
  title: "Gestão de Direcções | Hospital IT Asset Tracker",
  description: "Gerir direcções da organização",
};

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Administração", link: "/admin" },
  { title: "Dicionário do Sistema", link: "/admin/dictionary" },
  { title: "Direcções" },
];

export default async function DirectionPage() {
  const session = await auth();
  
  // Check if user is authenticated and has admin permissions
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  // Fetch all directions
  const directions = await db.direction.findMany({
    orderBy: { name: 'asc' },
  });
  
  return (
    <PageContainer>
      <div className="flex flex-col gap-5">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Direcções</h1>
          <DirectionCreateButton />
        </div>
        
        <p className="text-muted-foreground">
          Gere as direcções da organização. As direcções são o nível superior da estrutura organizacional.
        </p>
        
        <DirectionTable initialDirections={directions} />
      </div>
    </PageContainer>
  );
}