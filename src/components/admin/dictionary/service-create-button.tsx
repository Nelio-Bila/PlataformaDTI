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
import { ServiceForm } from "./service-form";
import { useState } from "react";

type Department = {
  id: string;
  name: string;
};

interface ServiceCreateButtonProps {
  departments: Department[];
}

export function ServiceCreateButton({ departments }: ServiceCreateButtonProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Serviço</DialogTitle>
          <DialogDescription>
            Adicione um novo serviço ao sistema. Os serviços pertencem a um departamento.
          </DialogDescription>
        </DialogHeader>
        <ServiceForm 
          closeDialog={() => setOpen(false)} 
          departments={departments}
        />
      </DialogContent>
    </Dialog>
  );
}