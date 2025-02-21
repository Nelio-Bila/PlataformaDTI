"use client";

import AuthHeader from "@/components/layout/auth-header";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "@/components/icons";
import { useEffect } from "react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // logger.info(error);
    console.debug(error);
  }, [error]);

  return (
    <>
      <AuthHeader />
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Secção de Autenticação
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {/* Introduza email e palavra-passe para aceder o sistema */}
            </p>
          </div>
          <Card className="w-full max-w-md mx-auto border">
            <CardHeader className="flex flex-col items-center gap-2 p-6">
              <AlertTriangleIcon className="h-8 w-8 text-red-500" />
              <CardTitle>Erro</CardTitle>
              <CardDescription className="text-center">
                Houve um erro ao carregar a página. Por favor tente de novo.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Button className="w-full" onClick={() => reset()}>
                Recarregar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
