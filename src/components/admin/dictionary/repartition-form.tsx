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
  department_id: z.string({
    required_error: "Por favor selecione um departamento",
  }),
});

type Department = {
  id: string;
  name: string;
};

type RepartitionFormValues = z.infer<typeof formSchema>;

interface RepartitionFormProps {
  initialData?: {
    id: string;
    name: string;
    department_id: string;
  };
  departments: Department[];
  closeDialog: () => void;
  onSuccess?: (updatedRepartition: any) => void;
}

export function RepartitionForm({ initialData, departments, closeDialog }: RepartitionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<RepartitionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      department_id: initialData?.department_id || "",
    },
  });
  
  async function onSubmit(values: RepartitionFormValues) {
    setIsSubmitting(true);
    
    try {
      if (initialData) {
        // Update existing repartition
        const response = await fetch(`/api/admin/dictionary/repartition/${initialData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          throw new Error("Falha ao atualizar a repartição");
        }
        

        toast({
          title: "Repartição atualizada",
          description: "A repartição foi atualizada com sucesso.",
          variant: "default",
        });
      } else {
        // Create new repartition
        const response = await fetch("/api/admin/dictionary/repartition", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          throw new Error("Falha ao criar a repartição");
        }
        
        toast({
          title: "Repartição criada",
          description: "A repartição foi criada com sucesso.",
          variant: "default",
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
                <Input placeholder="Nome da repartição" {...field} />
              </FormControl>
              <FormDescription>
                O nome da repartição deve ser único no departamento selecionado.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="department_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento*</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um departamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                O departamento ao qual esta repartição pertence.
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