"use client";

import { AlertTriangleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect } from "react";

export default function EquipmentAddPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex mx-auto my-auto">
      <Card className="w-full max-w-md mx-auto border">
        <CardHeader className="flex flex-col items-center gap-2 p-6">
          <AlertTriangleIcon className="h-8 w-8 text-red-500" />
          <CardTitle>Erro</CardTitle>
          <CardDescription className="text-center">
            Houve um erro ao carregar o formulário de registo de equipamento. Por favor tente de
            novo.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Button className="w-full" onClick={() => reset()}>
            Recarregar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
