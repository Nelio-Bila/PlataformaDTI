"use client";

import { useState } from 'react';

import {
  Edit,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

import { ServiceForm } from './service-form';

type Department = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  name: string;
  department_id: string | null;
  department: { name: string; id: string; direction_id: string; created_at: Date; updated_at: Date; } | null;
};

interface ServiceTableProps {
  initialServices: Service[];
  departments: Department[];
}

export function ServiceTable({ initialServices, departments }: ServiceTableProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.department?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deletingService) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/dictionary/service/${deletingService.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao eliminar o serviço");
      }

      setServices(services.filter(s => s.id !== deletingService.id));
      
      toast({
        title: "Serviço eliminado",
        description: "O serviço foi eliminado com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Erro ao eliminar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao eliminar o serviço",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingService(null);
    }
  };

  // Function to update local state when a service is updated
  const handleServiceUpdated = (updatedService: Service) => {
    setServices(prev => 
      prev.map(service => {
        if (service.id === updatedService.id) {
          // Find the department details from the departments array
          const departmentDetails = departments.find(d => d.id === updatedService.department_id);
          
          return {
            ...service,
            ...updatedService,
            // Only update department if we have department_id and can find the department
            department: updatedService.department_id && departmentDetails ? {
              name: departmentDetails.name,
              id: departmentDetails.id,
              // These fields might not be available in the departments array
              // so we'll use placeholder values or keep existing ones
              direction_id: service.department?.direction_id || '',
              created_at: service.department?.created_at || new Date(),
              updated_at: service.department?.updated_at || new Date(),
            } : null
          };
        }
        return service;
      })
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Input
            placeholder="Pesquisar serviços..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="text-sm text-muted-foreground">
            Total: {filteredServices.length} {filteredServices.length === 1 ? "serviço" : "serviços"}
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
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum serviço encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.department?.name}</TableCell>
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
                          <DropdownMenuItem onClick={() => setEditingService(service)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeletingService(service)}
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
      <Dialog open={!!editingService} onOpenChange={(open) => {
        if (!open) setEditingService(null);
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
            <DialogDescription>
              Modifique os detalhes do serviço existente.
            </DialogDescription>
          </DialogHeader>
          {editingService && (
            <ServiceForm 
              initialData={editingService}
              departments={departments}
              closeDialog={() => setEditingService(null)}
              onSuccess={(updatedService) => {
                handleServiceUpdated(updatedService);
                setEditingService(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingService} onOpenChange={(open) => {
        if (!open) setDeletingService(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
            <DialogDescription>
              Tem a certeza que pretende eliminar o serviço &quot;{deletingService?.name}&quot;? 
              Esta acção não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingService(null)}>
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