// // src/components/forms/sign-in-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
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
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
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

  // State to manage password visibility
  const [showPassword, setShowPassword] = React.useState(false);

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
                <Input placeholder="Digite seu email" type="email" className="w-full" {...field} />
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
                <PasswordInput
                  placeholder="Digite sua senha"
                  className="w-full"
                  {...field}
                  showPassword={showPassword} // Pass showPassword state to control visibility
                />
              </FormControl>
              <div className="mt-2 flex items-center space-x-2">
                <Checkbox
                  id="show-password"
                  checked={showPassword}
                  onCheckedChange={(checked) => setShowPassword(checked as boolean)}
                />
                <label htmlFor="show-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Mostrar senha
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p className="text-red-500 text-sm">{form.formState.errors.root.message}</p>
        )}
        <div className="flex justify-end">

          <Button type="submit" disabled={is_pending}>
            {is_pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

