"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectorForm } from "./sector-form";
import { Input } from "@/components/ui/input";

type Department = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  name: string;
  department_id: string | null;
};

type Sector = {
  id: string;
  name: string;
  department_id: string | null;
  service_id: string | null;
  department: {  name: string; id: string; created_at: Date; updated_at: Date; direction_id: string; } | null ;
  service: { id: string; name: string; direction_id: string | null; created_at: Date; updated_at: Date; department_id: string | null; } | null;
};

interface SectorTableProps {
  initialSectors: Sector[];
  departments: Department[];
  services: Service[];
}

export function SectorTable({
  initialSectors,
  departments,
  services,
}: SectorTableProps) {
  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredSectors = sectors.filter(
    (sector) =>
      sector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sector.department?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      sector.service?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deletingSector) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/dictionary/sector/${deletingSector.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao eliminar o sector");
      }

      setSectors(sectors.filter((s) => s.id !== deletingSector.id));

      toast({
        title: "Sector eliminado",
        description: "O sector foi eliminado com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting sector:", error);
      toast({
        title: "Erro ao eliminar",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao eliminar o sector",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingSector(null);
    }
  };

  // Function to update local state when a sector is updated
  const handleSectorUpdated = (updatedSector: any) => {
    setSectors((prev) =>
      prev.map((sector) => {
        if (sector.id === updatedSector.id) {
          const departmentName =
            departments.find((d) => d.id === updatedSector.department_id)
              ?.name || "";
          const serviceName =
            services.find((s) => s.id === updatedSector.service_id)?.name || "";

          return {
            ...sector,
            ...updatedSector,
            department: { name: departmentName },
            service: { name: serviceName },
          };
        }
        return sector;
      })
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Input
            placeholder="Pesquisar sectores..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="text-sm text-muted-foreground">
            Total: {filteredSectors.length}{" "}
            {filteredSectors.length === 1 ? "sector" : "sectores"}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead className="hidden md:table-cell">
                  Descrição
                </TableHead>
                <TableHead className="w-[80px]">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSectors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum sector encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSectors.map((sector) => (
                  <TableRow key={sector.id}>
                    <TableCell className="font-medium">{sector.name}</TableCell>
                    <TableCell>{sector.department?.name}</TableCell>
                    <TableCell>{sector.service?.name}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acções</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setEditingSector(sector)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingSector(sector)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingSector}
        onOpenChange={(open) => {
          if (!open) setEditingSector(null);
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Sector</DialogTitle>
            <DialogDescription>
              Modifique os detalhes do sector existente.
            </DialogDescription>
          </DialogHeader>
          {editingSector && (
            <SectorForm
              initialData={editingSector}
              departments={departments}
              services={services}
              closeDialog={() => setEditingSector(null)}
              onSuccess={(updatedSector) => {
                handleSectorUpdated(updatedSector);
                setEditingSector(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingSector}
        onOpenChange={(open) => {
          if (!open) setDeletingSector(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
            <DialogDescription>
              Tem a certeza que pretende eliminar o sector &quot;
              {deletingSector?.name}&quot;? Esta acção não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingSector(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "A eliminar..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
