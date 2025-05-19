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
import { DepartmentForm } from "./department-form";
import { useState } from "react";

type Direction = {
  id: string;
  name: string;
};

interface DepartmentCreateButtonProps {
  directions: Direction[];
}

export function DepartmentCreateButton({ directions }: DepartmentCreateButtonProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Departamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Departamento</DialogTitle>
          <DialogDescription>
            Adicione um novo departamento ao sistema. Os departamentos pertencem a uma direcção.
          </DialogDescription>
        </DialogHeader>
        <DepartmentForm closeDialog={() => setOpen(false)} directions={directions} />
      </DialogContent>
    </Dialog>
  );
}