// src/components/forms/group-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const groupSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

export type GroupFormData = z.infer<typeof groupSchema>;

export function GroupForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
    },
  });

  const { data: permissions = [], isLoading: isPermissionsLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await fetch("/api/permissions");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create group");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      form.reset();
      toast({
        title: "Sucesso!",
        description: "Grupo criado com sucesso",
      });
      router.push("/groups");
    },
    onError: (error: Error) => {
      form.setError("root", { message: error.message });
    },
  });

  const onSubmit = (values: GroupFormData) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 border p-4 sm:p-6 rounded-lg shadow-sm w-full max-w-7xl mx-auto"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do grupo" {...field} />
              </FormControl>
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
                <Input placeholder="Digite a descrição do grupo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="permissionIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permissões</FormLabel>
              <Select
                onValueChange={(value) => field.onChange([...(field.value || []), value])}
                disabled={isPermissionsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione permissões" />
                </SelectTrigger>
                <SelectContent>
                  {permissions.map((permission: { id: string; name: string }) => (
                    <SelectItem key={permission.id} value={permission.id}>
                      {permission.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2">
                {field.value?.map((permissionId) => (
                  <div key={permissionId} className="flex items-center gap-2">
                    <span>{permissions.find((p: any) => p.id === permissionId)?.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => field.onChange(field.value?.filter((id) => id !== permissionId))}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p className="text-red-500">{form.formState.errors.root.message}</p>
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Criar Grupo
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}