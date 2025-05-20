"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Building2, 
  Database, 
  Layers, 
  ListChecks, 
  Network 
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";

export function Dict() {
  const router = useRouter();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <BookOpen className="h-5 w-5" />
          <span className="sr-only">Acesso ao Dicionário</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href="/admin/dictionary"><DropdownMenuLabel>Dicionário do Sistema</DropdownMenuLabel></Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/admin/dictionary/direction")}>
          <Building2 className="h-4 w-4 mr-2" />
          <span>Direcções</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/admin/dictionary/department")}>
          <Database className="h-4 w-4 mr-2" />
          <span>Departamentos</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/admin/dictionary/service")}>
          <Layers className="h-4 w-4 mr-2" />
          <span>Serviços</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/admin/dictionary/sector")}>
          <ListChecks className="h-4 w-4 mr-2" />
          <span>Sectores</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/admin/dictionary/repartition")}>
          <Network className="h-4 w-4 mr-2" />
          <span>Repartições</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
