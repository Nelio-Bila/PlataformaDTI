"use client"


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PackagePlus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";



export function RequestOptionsForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [referenceNumber, setReferenceNumber] = useState("");

    const handleCreateRequest = () => {
        startTransition(() => {
            // Redirect to a guest request creation page (to be implemented)
            router.push("/requests/add-guest");
            toast({
                title: "Criar Requisição",
                description: "Redirecionando para o formulário de criação de requisição...",
            });
        });
    };

    const handleViewRequest = () => {
        if (!referenceNumber.trim()) {
            toast({
                title: "Erro",
                description: "Por favor, insira um número de referência válido.",
                variant: "destructive",
            });
            return;
        }
        startTransition(() => {
            // Redirect to a guest request view page with the reference number
            router.push(`/requests/view-guest?ref=${referenceNumber}`);
            toast({
                title: "Visualizar Requisição",
                description: "Buscando a requisição solicitada...",
            });
        });
    };

    return (
        <>
            <h1 className="text-center font-bold text-2xl">Requisições</h1>
        <div className="mt-8">
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                Não tem conta? Use as opções abaixo como convidado:
            </p>
            <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                    <TabsTrigger
                        value="create"
                        className="rounded-md py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
                    >
                        Criar Requisição
                    </TabsTrigger>
                    <TabsTrigger
                        value="view"
                        className="rounded-md py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
                    >
                        Ver Requisição
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="mt-4">
                    <div className="flex flex-col items-center space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                        <PackagePlus className="h-8 w-8 text-primary" />
                        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                            Crie uma nova requisição para solicitar produtos ou serviços sem precisar iniciar a sessão.
                        </p>
                        <div className="flex justify-end">
                            <Button
                                onClick={handleCreateRequest}
                                disabled={isPending}>
                                {isPending ? "Processando..." : "Requisitar Agora"}
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="view" className="mt-4">
                    <div className="flex flex-col items-center space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                        <Search className="h-8 w-8 text-primary" />
                        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                            Veja o estado de uma requisição existente inserindo seu número de referência.
                        </p>
                        <Input
                            placeholder="Número de Referência (ex: REQ-123)"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            className="w-full"
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={handleViewRequest}
                                disabled={isPending}
                            >
                                {isPending ? "Procurando..." : "Visualizar"}
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
        </>
    );
}