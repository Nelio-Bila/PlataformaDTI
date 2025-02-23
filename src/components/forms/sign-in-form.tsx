// components/forms/sign-in-form.tsx
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
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PasswordInput } from "../ui/password-input";

const sign_in_schema = z.object({
  email: z.string().email({ message: "Endereço de email inválido" }),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
});

type SignInFormData = z.infer<typeof sign_in_schema>;

export function SignInForm() {
  const [is_pending, start_transition] = useTransition();
  const router = useRouter();
  const form = useForm<SignInFormData>({
    resolver: zodResolver(sign_in_schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { toast } = useToast();

  const on_submit = (values: SignInFormData) => {
    start_transition(async () => {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        form.setError("root", { message: result.error });
        toast({
          title: "Credenciais inválidas",
          description: "As credenciais fornecidas estão incorretas.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Bem-vindo",
          description: "Redirecionando para o painel...",
        });
        router.push("/dashboard");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(on_submit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Digite sua senha" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p className="text-red-500 text-sm">{form.formState.errors.root.message}</p>
        )}
        <Button type="submit" className="w-full" disabled={is_pending}>
          {is_pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  );
}