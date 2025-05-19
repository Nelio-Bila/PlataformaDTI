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
import { DirectionForm } from "./direction-form";
import { useState } from "react";

export function DirectionCreateButton() {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Direcção
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Direcção</DialogTitle>
          <DialogDescription>
            Adicione uma nova direcção ao sistema. As direcções são o nível superior da estrutura organizacional.
          </DialogDescription>
        </DialogHeader>
        <DirectionForm closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}