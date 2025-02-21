"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { userAuthSchema } from "@/lib/validations/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Icons } from "@/components/icons";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type FormData = z.infer<typeof userAuthSchema>;

export function AuthForm({ className, ...props }: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const [loginError, setLoginError] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    const signInResult = await signIn("credentials", {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false,
      callbackUrl: searchParams?.get("from") || "/dashboard",
    });

    if (signInResult?.error) {
      setLoginError(true);
      setIsLoading(false);
      return toast({
        title: "As credênciais providenciadas são inválidas",
        variant: "destructive",
      });
    }

    toast({
      title: "Bem vindo",
      description: "Redirecionando...",
    });

    setIsLoading(false);

    router.push("/dashboard");
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {loginError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Houve um erro!</AlertTitle>
          <AlertDescription>
            As credênciais providenciadas não são válidas
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label className="sr-only" htmlFor="email">
          Email
        </Label>
        <Input
          id="email"
          placeholder="Email"
          required
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          onFocus={() => setLoginError(false)}
          disabled={isLoading}
          {...register("email")}
        />
        {errors?.email && (
          <p className="px-1 text-xs text-red-600 mt-1">
            {errors.email.message}
          </p>
        )}
      </div>
      <div className="relative">
        <Label className="sr-only" htmlFor="password">
          Palavra-passe
        </Label>
        <Input
          id="password"
          placeholder="Palavra-passe"
          type={showPassword ? "text" : "password"}
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect="off"
          disabled={isLoading}
          onFocus={() => setLoginError(false)}
          {...register("password")}
        />
        {errors?.password && (
          <p className="px-1 text-xs text-red-600">{errors.password.message}</p>
        )}
        <Button
          className="absolute right-2 top-1/2 -translate-y-1/2"
          size="icon"
          type="button"
          variant="ghost"
          onClick={togglePasswordVisibility}
        >
          <Icons.eyeIcon className="h-5 w-5" />
          <span className="sr-only">
            Alternar visibilidade da palavra-passe
          </span>
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember">Manter sessão iniciada</Label>
        </div>
        <Link
          className="text-sm font-medium text-gray-900 hover:underline dark:text-gray-50"
          href="/forgot-password"
        >
          Esqueçeu a palavra-passe
        </Link>
      </div>
      <button
        className={cn(buttonVariants())}
        disabled={isLoading}
        type="submit"
      >
        {isLoading && (
          <Spinner className="mr-2 h-5 w-5 animate-spin text-white" />
        )}
       <span className="text-white">Entrar</span>
      </button>
    </form>
  );
}
