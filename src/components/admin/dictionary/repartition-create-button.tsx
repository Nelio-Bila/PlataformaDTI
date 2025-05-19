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
import { RepartitionForm } from "./repartition-form";
import { useState } from "react";

type Department = {
  id: string;
  name: string;
};

interface RepartitionCreateButtonProps {
  departments: Department[];
}

export function RepartitionCreateButton({ departments }: RepartitionCreateButtonProps) {
  const [open, setOpen] = useState(false);
  
  const handleSuccess = (newRepartition: any) => {
    setOpen(false);
    // Optionally trigger a refresh or update of the parent component
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Repartição
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Repartição</DialogTitle>
          <DialogDescription>
            Adicione uma nova repartição ao sistema. As repartições pertencem a um departamento.
          </DialogDescription>
        </DialogHeader>
        <RepartitionForm 
          closeDialog={() => setOpen(false)} 
          departments={departments}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}