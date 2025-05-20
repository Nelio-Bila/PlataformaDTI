import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Database, Layers, ListChecks, Network, FolderTree } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dicionário do Sistema | Hospital IT Asset Tracker",
  description: "Gerir dados de referência do sistema",
};

const breadcrumbItems = [
  { title: "Painel", link: "/dashboard" },
  { title: "Administração", link: "/admin" },
  { title: "Dicionário do Sistema" },
];

const dictionaryItems = [
  {
    title: "Direcções",
    description: "Gerir direcções da organização",
    icon: <Building2 className="h-8 w-8 text-primary" />,
    link: "/admin/dictionary/direction",
  },
  {
    title: "Departamentos",
    description: "Gerir departamentos da organização",
    icon: <FolderTree className="h-8 w-8 text-primary" />,
    link: "/admin/dictionary/department",
  },
  {
    title: "Serviços",
    description: "Gerir serviços da organização",
    icon: <Layers className="h-8 w-8 text-primary" />,
    link: "/admin/dictionary/service",
  },
  {
    title: "Sectores",
    description: "Gerir sectores da organização",
    icon: <ListChecks className="h-8 w-8 text-primary" />,
    link: "/admin/dictionary/sector",
  },
  {
    title: "Repartições",
    description: "Gerir repartições da organização",
    icon: <Network className="h-8 w-8 text-primary" />,
    link: "/admin/dictionary/repartition",
  },
  {
    title: "Gestão da Base de Dados",
    description: "Backup e restauração da base de dados",
    icon: <Database className="h-8 w-8 text-primary" />,
    link: "/admin/database",
  },
];

export default async function DictionaryPage() {
  const session = await auth();
  
  // Check if user is authenticated and has admin permissions
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  return (
    <PageContainer>
      <div className="flex flex-col gap-5">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dicionário do Sistema</h1>
        </div>
        
        <p className="text-muted-foreground">
          Gerencie os dados de referência usados em todo o sistema. Estas entidades formam a estrutura organizacional para o rastreamento de activos.
        </p>
        
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {dictionaryItems.map((item) => (
            <Link href={item.link} key={item.title}>
              <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{item.title}</CardTitle>
                    {item.icon}
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}