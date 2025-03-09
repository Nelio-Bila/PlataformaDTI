"use client";

import { AlertTriangleIcon } from "@/components/icons";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";
import { useEffect } from "react";

const breadcrumbItems = [
  { title: "Página inicial", link: "/" },
  { title: "Requisição", link: "/requests/view-guest" },
];

export default function ViewGuestPageError({
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
    <div className="p-6 w-full">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="flex min-h-svh">
        <div className="flex mx-auto my-auto">
          <Card className="w-full max-w-md mx-auto border">
            <CardHeader className="flex flex-col items-center gap-2 p-6">
              <AlertTriangleIcon className="h-8 w-8 text-red-500" />
              <CardTitle>Erro</CardTitle>
              <CardDescription className="text-center">
                Houve um erro ao carregar a requisição. Por favor tente de
                novo.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Button className="w-full" onClick={() => reset()}>
                <RefreshCcw className="mr-2"/>
                Recarregar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

  );
}
