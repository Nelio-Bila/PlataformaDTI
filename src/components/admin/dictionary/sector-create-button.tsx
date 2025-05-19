"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SectorForm } from "./sector-form";
import { useState } from "react";

type Department = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  name: string;
  department_id: string;
};

interface SectorCreateButtonProps {
  departments: Department[];
  services: Service[];
}

export function SectorCreateButton({ departments, services }: SectorCreateButtonProps) {
  const [open, setOpen] = useState(false);
  
  const handleSuccess = (newSector: any) => {
    setOpen(false);
    // Optionally trigger a refresh or update of the parent component
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Sector
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Sector</DialogTitle>
          <DialogDescription>
            Adicione um novo sector ao sistema. Os sectores pertencem a um departamento e serviço.
          </DialogDescription>
        </DialogHeader>
        <SectorForm 
          closeDialog={() => setOpen(false)} 
          departments={departments}
          services={services}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}