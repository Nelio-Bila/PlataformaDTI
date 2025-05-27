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
import { RepartitionForm } from "./repartition-form";
import { Input } from "@/components/ui/input";

type Department = {
  id: string;
  name: string;
};

type Repartition = {
  id: string;
  name: string;
  department_id: string;
  department: { name: string };
};

interface RepartitionTableProps {
  initialRepartitions: Repartition[];
  departments: Department[];
}

export function RepartitionTable({ initialRepartitions, departments }: RepartitionTableProps) {
  const [repartitions, setRepartitions] = useState<Repartition[]>(initialRepartitions);
  const [editingRepartition, setEditingRepartition] = useState<Repartition | null>(null);
  const [deletingRepartition, setDeletingRepartition] = useState<Repartition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredRepartitions = repartitions.filter(repartition => 
    repartition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repartition.department.name.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  const handleDelete = async () => {
    if (!deletingRepartition) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/dictionary/repartition/${deletingRepartition.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao eliminar a repartição");
      }

      setRepartitions(repartitions.filter(r => r.id !== deletingRepartition.id));
      
      toast({
        title: "Repartição eliminada",
        description: "A repartição foi eliminada com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting repartition:", error);
      toast({
        title: "Erro ao eliminar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao eliminar a repartição",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingRepartition(null);
    }
  };

  // Function to update local state when a repartition is updated
  const handleRepartitionUpdated = (updatedRepartition: any) => {
    setRepartitions(prev => 
      prev.map(repartition => {
        if (repartition.id === updatedRepartition.id) {
          const departmentName = departments.find(d => d.id === updatedRepartition.department_id)?.name || '';
          
          return {
            ...repartition,
            ...updatedRepartition,
            department: { name: departmentName }
          };
        }
        return repartition;
      })
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Input
            placeholder="Pesquisar repartições..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="text-sm text-muted-foreground">
            Total: {filteredRepartitions.length} {filteredRepartitions.length === 1 ? "repartição" : "repartições"}
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead className="w-[80px]">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepartitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhuma repartição encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRepartitions.map((repartition) => (
                  <TableRow key={repartition.id}>
                    <TableCell className="font-medium">{repartition.name}</TableCell>
                    <TableCell>{repartition.department?.name}</TableCell>
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
                          <DropdownMenuItem onClick={() => setEditingRepartition(repartition)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeletingRepartition(repartition)}
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
      <Dialog open={!!editingRepartition} onOpenChange={(open) => {
        if (!open) setEditingRepartition(null);
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Repartição</DialogTitle>
            <DialogDescription>
              Modifique os detalhes da repartição existente.
            </DialogDescription>
          </DialogHeader>
          {editingRepartition && (
            <RepartitionForm 
              initialData={editingRepartition}
              departments={departments}
              closeDialog={() => setEditingRepartition(null)}
              onSuccess={(updatedRepartition) => {
                handleRepartitionUpdated(updatedRepartition);
                setEditingRepartition(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingRepartition} onOpenChange={(open) => {
        if (!open) setDeletingRepartition(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
            <DialogDescription>
              Tem a certeza que pretende eliminar a repartição &quot;{deletingRepartition?.name}&quot;? 
              Esta acção não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingRepartition(null)}>
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