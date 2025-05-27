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
import { useState, useEffect } from "react";
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
  service_id: z.string({
    required_error: "Por favor selecione um serviço",
  }),
});

type Department = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  name: string;
  department_id: string | null;
};

type SectorFormValues = z.infer<typeof formSchema>;

interface SectorFormProps {
  initialData?: {
    id: string;
    name: string;
    department_id: string | null;
    service_id: string | null;
  };
  departments: Department[];
  services: Service[];
  closeDialog: () => void;
  onSuccess?: (updatedSector: any) => void;
}

export function SectorForm({ initialData, departments, services, closeDialog }: SectorFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  
  const form = useForm<SectorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      department_id: initialData?.department_id || "",
      service_id: initialData?.service_id || "",
    },
  });

  // Filter services based on selected department
  const departmentId = form.watch("department_id");
  useEffect(() => {
    if (departmentId) {
      const filtered = services.filter(service => service.department_id === departmentId);
      setFilteredServices(filtered);
      
      // If current service is not in the filtered list, reset it
      const currentServiceId = form.getValues("service_id");
      if (currentServiceId && !filtered.some(s => s.id === currentServiceId)) {
        form.setValue("service_id", "");
      }
    } else {
      setFilteredServices([]);
      form.setValue("service_id", "");
    }
  }, [departmentId, services, form]);
  
  async function onSubmit(values: SectorFormValues) {
    setIsSubmitting(true);
    
    try {
      if (initialData) {
        // Update existing sector
        const response = await fetch(`/api/admin/dictionary/sector/${initialData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          throw new Error("Falha ao atualizar o sector");
        }
        
        toast({
          title: "Sector actualizado",
          description: "O sector foi atualizado com sucesso.",
          variant: "default",
        });
      } else {
        // Create new sector
        const response = await fetch("/api/admin/dictionary/sector", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          throw new Error("Falha ao criar o sector");
        }
        
        toast({
          title: "Sector criado",
          description: "O sector foi criado com sucesso.",
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
                <Input placeholder="Nome do sector" {...field} />
              </FormControl>
              <FormDescription>
                O nome do sector deve ser único na combinação departamento/serviço.
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
                value={field.value}
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
                O departamento ao qual este sector pertence.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="service_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço*</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
                disabled={!departmentId || filteredServices.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !departmentId ? "Selecione um departamento primeiro" : 
                      filteredServices.length === 0 ? "Nenhum serviço disponível" : 
                      "Selecione um serviço"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                O serviço ao qual este sector pertence.
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