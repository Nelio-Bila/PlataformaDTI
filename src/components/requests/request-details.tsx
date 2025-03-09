
// src/components/requests/request-details.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatRequestType, formatStatus, RequestType, statusColors, StatusKey } from "@/types/requests";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  MapPin,
  Package,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";



interface RequestDetailsData {
  id: string;
  request_number: string;
  type: RequestType;
  status: StatusKey;
  created_at: string;
  updated_at: string;
  requester: { name: string | null } | null;
  requester_department: { name: string | null } | null;
  destination_department: { name: string | null } | null;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string | null;
  }>;
  comments: string | null;
  approved_by: string | null;
  approver: { name: string | null } | null;
  requester_id?: string | null;
  requester_name?: string | null;
  requester_direction?: { name: string | null } | null;
  destination_direction?: { name: string | null } | null;
}





const updateRequestStatus = async ({
  id,
  status,
}: {
  id: string;
  status: string;
}) => {
  const response = await fetch(`/api/requests/${id}/update-status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Falha ao actualizar o estado.");
  }

  return response.json();
};

export function RequestDetails({ requestData }: { requestData: RequestDetailsData }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StatusKey>(requestData.status);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession()

  useEffect(() => {
    if (requestData) {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [requestData]);

  const updateStatusMutation = useMutation({
    mutationFn: updateRequestStatus,
    onSuccess: () => {
      toast({
        title: "Estado Actualizado",
        description: "O estado da requisição foi actualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["requests", requestData.id] });
      setIsModalOpen(false);
      location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao actualizar o estado.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = () => {
    if (selectedStatus === requestData.status) {
      toast({
        title: "Sem Alterações",
        description: "O estado seleccionado é o mesmo que o actual.",
      });
      return;
    }

    updateStatusMutation.mutate({
      id: requestData.id,
      status: selectedStatus,
    });
  };

  // Handle status change with validation
  const handleStatusChange = (value: string) => {
    const validStatuses: StatusKey[] = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];
    if (validStatuses.includes(value as StatusKey)) {
      setSelectedStatus(value as StatusKey);
    } else {
      console.warn(`Invalid status value: ${value}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Skeleton className="h-10 w-full" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full mt-2" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            Requisição #{requestData.request_number}
          </h2>
          <Badge
            style={{
              backgroundColor: statusColors[requestData.status as StatusKey],
            }}
            className="mt-1"
          >
            {formatStatus(requestData.status)}
          </Badge>
        </div>
        {session.status === "authenticated"?(
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Actualizar Estado</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Actualizar Estado da Requisição</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Estado
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={handleStatusChange} // Updated handler
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="APPROVED">Aprovado</SelectItem>
                    <SelectItem value="REJECTED">Rejeitado</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                    <SelectItem value="COMPLETED">Concluído</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={updateStatusMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? "A Actualizar..." : "Salvar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>):null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>Tipo: {formatRequestType(requestData.type)}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Solicitante: {requestData.requester?.name || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>De: {requestData.requester_department?.name || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Para: {requestData.destination_department?.name || "N/A"}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Datas e Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                Criado em: {format(new Date(requestData.created_at), "dd/MM/yyyy HH:mm", { locale: pt })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                Actualizado em: {format(new Date(requestData.updated_at), "dd/MM/yyyy HH:mm", { locale: pt })}
              </span>
            </div>
            {requestData.approved_by && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Aprovado por: {requestData.approver?.name || "N/A"}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Itens da Requisição
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requestData.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Descrição</th>
                    <th className="text-left p-2">Quantidade</th>
                    <th className="text-left p-2">Unidade</th>
                  </tr>
                </thead>
                <tbody>
                  {requestData.items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{item.description}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">{item.unit || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Nenhum item encontrado para esta requisição.
            </p>
          )}
        </CardContent>
      </Card>
      {requestData.comments && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Comentários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              {requestData.comments}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}