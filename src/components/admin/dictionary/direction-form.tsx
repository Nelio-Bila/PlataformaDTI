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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }).max(100, {
    message: "O nome não pode ter mais de 100 caracteres."
  }),
  description: z.string().optional(),
});

type DirectionFormValues = z.infer<typeof formSchema>;

interface DirectionFormProps {
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
  };
  closeDialog: () => void;
}

export function DirectionForm({ initialData, closeDialog }: DirectionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<DirectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });
  
  async function onSubmit(values: DirectionFormValues) {
    setIsSubmitting(true);
    
    try {
      if (initialData) {
        // Update existing direction
        const response = await fetch(`/api/admin/dictionary/direction/${initialData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          throw new Error("Falha ao atualizar a direcção");
        }
        
        toast({
          title: "Direcção atualizada",
          description: "A direcção foi atualizada com sucesso.",
          variant: "success",
        });
      } else {
        // Create new direction
        const response = await fetch("/api/admin/dictionary/direction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          throw new Error("Falha ao criar a direcção");
        }
        
        toast({
          title: "Direcção criada",
          description: "A direcção foi criada com sucesso.",
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
                <Input placeholder="Nome da direcção" {...field} />
              </FormControl>
              <FormDescription>
                O nome da direcção deve ser único no sistema.
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
                  placeholder="Descrição da direcção" 
                  className="resize-none min-h-[100px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Breve descrição das funções da direcção (opcional).
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