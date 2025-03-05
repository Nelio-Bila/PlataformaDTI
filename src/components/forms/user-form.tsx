// // src/components/forms/user-form.tsx
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
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const userSchema = z
  .object({
    name: z.string().min(1, { message: "Nome é obrigatório" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
    confirmPassword: z.string().min(6, { message: "A confirmação deve ter pelo menos 6 caracteres" }),
    groupIds: z.array(z.string()).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type UserFormData = z.infer<typeof userSchema>;

export function UserForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      groupIds: [],
    },
  });

  const { data: groups = [], isLoading: isGroupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await fetch("/api/users/groups");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const { confirmPassword, ...dataToSend } = data; // Exclude confirmPassword from API request
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      form.reset();
      toast({
        title: "Sucesso!",
        description: "Utilizador criado com sucesso",
      });
      router.push("/users");
    },
    onError: (error: Error) => {
      form.setError("root", { message: error.message });
    },
  });

  const onSubmit = (values: UserFormData) => {
    mutation.mutate(values);
  };

  // Transform groups data for MultiSelect
  const groupOptions = groups.map((group: { id: string; name: string }) => ({
    label: group.name,
    value: group.id,
  }));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 border p-4 sm:p-6 rounded-lg shadow-sm w-full max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do utilizador" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o email do utilizador" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Digite a senha do utilizador"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmação da Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirme a senha do utilizador"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <FormField
            control={form.control}
            name="groupIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupos</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={groupOptions}
                    onValueChange={field.onChange}
                    defaultValue={field.value || []}
                    placeholder="Selecione grupos"
                    variant="default"
                    maxCount={3}
                    disabled={isGroupsLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
                <UserPlus className="mr-2 h-4 w-4" />
                Criar Utilizador
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}