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
import { DepartmentForm } from "./department-form";
import { Input } from "@/components/ui/input";

type Direction = {
  id: string;
  name: string;
};

type Department = {
  id: string;
  name: string;
  direction_id: string;
  direction: { name: string };
};

interface DepartmentTableProps {
  initialDepartments: Department[];
  directions: Direction[];
}

export function DepartmentTable({ initialDepartments, directions }: DepartmentTableProps) {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredDepartments = departments.filter(department => 
    department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    department.direction.name.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  const handleDelete = async () => {
    if (!deletingDepartment) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/dictionary/department/${deletingDepartment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao eliminar o departamento");
      }

      setDepartments(departments.filter(d => d.id !== deletingDepartment.id));
      
      toast({
        title: "Departamento eliminado",
        description: "O departamento foi eliminado com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting department:", error);
      toast({
        title: "Erro ao eliminar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao eliminar o departamento",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingDepartment(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Input
            placeholder="Pesquisar departamentos..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="text-sm text-muted-foreground">
            Total: {filteredDepartments.length} {filteredDepartments.length === 1 ? "departamento" : "departamentos"}
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Direcção</TableHead>
                <TableHead className="w-[80px]">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum departamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{department.direction.name}</TableCell>
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
                          <DropdownMenuItem onClick={() => setEditingDepartment(department)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeletingDepartment(department)}
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
      <Dialog open={!!editingDepartment} onOpenChange={(open) => {
        if (!open) setEditingDepartment(null);
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Departamento</DialogTitle>
            <DialogDescription>
              Modifique os detalhes do departamento existente.
            </DialogDescription>
          </DialogHeader>
          {editingDepartment && (
            <DepartmentForm 
              initialData={editingDepartment}
              directions={directions}
              closeDialog={() => setEditingDepartment(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingDepartment} onOpenChange={(open) => {
        if (!open) setDeletingDepartment(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
            <DialogDescription>
              Tem a certeza que pretende eliminar o departamento &quot;{deletingDepartment?.name}&quot;? 
              Esta acção não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingDepartment(null)}>
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