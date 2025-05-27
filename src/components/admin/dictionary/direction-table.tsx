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
import { DirectionForm } from "./direction-form";
import { Input } from "@/components/ui/input";

type Direction = {
  id: string;
  name: string;
};

interface DirectionTableProps {
  initialDirections: Direction[];
}

export function DirectionTable({ initialDirections }: DirectionTableProps) {
  const [directions, setDirections] = useState<Direction[]>(initialDirections);
  const [editingDirection, setEditingDirection] = useState<Direction | null>(null);
  const [deletingDirection, setDeletingDirection] = useState<Direction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredDirections = directions.filter(direction => 
    direction.name.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  const handleDelete = async () => {
    if (!deletingDirection) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/dictionary/direction/${deletingDirection.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao eliminar a direcção");
      }

      setDirections(directions.filter(d => d.id !== deletingDirection.id));
      
      toast({
        title: "Direcção eliminada",
        description: "A direcção foi eliminada com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting direction:", error);
      toast({
        title: "Erro ao eliminar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao eliminar a direcção",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingDirection(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Input
            placeholder="Pesquisar direcções..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="text-sm text-muted-foreground">
            Total: {filteredDirections.length} {filteredDirections.length === 1 ? "direcção" : "direcções"}
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead className="w-[80px]">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDirections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Nenhuma direcção encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDirections.map((direction) => (
                  <TableRow key={direction.id}>
                    <TableCell className="font-medium">{direction.name}</TableCell>
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
                          <DropdownMenuItem onClick={() => setEditingDirection(direction)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeletingDirection(direction)}
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
      <Dialog open={!!editingDirection} onOpenChange={(open) => {
        if (!open) setEditingDirection(null);
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Direcção</DialogTitle>
            <DialogDescription>
              Modifique os detalhes da direcção existente.
            </DialogDescription>
          </DialogHeader>
          {editingDirection && (
            <DirectionForm 
              initialData={editingDirection}
              closeDialog={() => setEditingDirection(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingDirection} onOpenChange={(open) => {
        if (!open) setDeletingDirection(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
            <DialogDescription>
              Tem a certeza que pretende eliminar a direção &quot;{deletingDirection?.name}&quot;? 
              Esta acção não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingDirection(null)}>
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