"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }).max(100, {
    message: "O nome não pode ter mais de 100 caracteres."
  }),
  description: z.string().optional(),
  direction_id: z.string({
    required_error: "Por favor selecione uma direcção",
  }),
});

type Direction = {
  id: string;
  name: string;
};

type DepartmentFormValues = z.infer<typeof formSchema>;

interface DepartmentFormProps {
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    direction_id: string;
  };
  directions: Direction[];
  closeDialog: () => void;
}

export function DepartmentForm({ initialData, directions, closeDialog }: DepartmentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      direction_id: initialData?.direction_id || "",
    },
  });
  
  async function onSubmit(values: DepartmentFormValues) {
    setIsSubmitting(true);
    
    try {
      if (initialData) {
        // Update existing department
        const response = await fetch(`/api/admin/dictionary/department/${initialData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          throw new Error("Falha ao atualizar o departamento");
        }
        
        toast({
          title: "Departamento atualizado",
          description: "O departamento foi atualizado com sucesso.",
          variant: "success",
        });
      } else {
        // Create new department
        const response = await fetch("/api/admin/dictionary/department", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          throw new Error("Falha ao criar o departamento");
        }
        
        toast({
          title: "Departamento criado",
          description: "O departamento foi criado com sucesso.",
          variant: "success",
        });
        
        // Reset form
        form.reset();
      }
      
      // Close dialog
      closeDialog();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Ocorreu um erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar o pedido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome*</FormLabel>
              <FormControl>
                <Input placeholder="Nome do departamento" {...field} />
              </FormControl>
              <FormDescription>
                O nome do departamento deve ser único na direcção seleccionada.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="direction_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Direcção*</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione uma direcção" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {directions.map((direction) => (
                    <SelectItem key={direction.id} value={direction.id}>
                      {direction.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                A direcção à qual este departamento pertence.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição do departamento" 
                  className="resize-none min-h-[100px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Breve descrição das funções do departamento (opcional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={closeDialog}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Actualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}