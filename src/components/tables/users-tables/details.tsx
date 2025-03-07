"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Group, Request, User, UserGroup } from "@prisma/client";
import { Edit, Package, Users } from "lucide-react";
import Link from "next/link";

interface UserDetailsProps {
  user: User & {
    groups: (UserGroup & { group: Group })[];
    requestsMade: Request[];
    requestsApproved: Request[];
  };
}

export function UserDetails({ user }: UserDetailsProps) {
  return (
    <div className="space-y-6 min-w-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Detalhes do Usuário: {user.name || user.email}</h1>
        <Link href={`/users/edit/${user.id}`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar Usuário
          </Button>
        </Link>
      </div>

      {/* User Information */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Informações do Usuário</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Nome:</p>
            <p>{user.name || "N/D"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email:</p>
            <p>{user.email || "N/D"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Criado em:</p>
            <p>{new Date(user.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Actualizado em:</p>
            <p>{new Date(user.updated_at).toLocaleDateString("pt-BR")}</p>
          </div>

        </div>
      </div>

      {/* Groups */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Grupos Associados
        </h2>
        <div className="relative rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Grupo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data de Associação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.groups.length > 0 ? (
                  user.groups.map((userGroup) => (
                    <TableRow key={userGroup.group_id}>
                      <TableCell>{userGroup.group.name}</TableCell>
                      <TableCell>{userGroup.group.description || "N/D"}</TableCell>
                      <TableCell>{new Date(userGroup.assigned_at).toLocaleDateString("pt-BR")}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Nenhum grupo associado a este utilizador.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Requests Made */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Requisições Feitas
        </h2>
        <div className="relative rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número da Requisição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.requestsMade.length > 0 ? (
                  user.requestsMade.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Link href={`/requests/${request.id}`} className="text-blue-600 hover:underline">
                          {request.request_number}
                        </Link>
                      </TableCell>
                      <TableCell>{request.type}</TableCell>
                      <TableCell>{request.status}</TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhuma requisição feita por este usuário.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Requests Approved */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Requisições Aprovadas
        </h2>
        <div className="relative rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número da Requisição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.requestsApproved.length > 0 ? (
                  user.requestsApproved.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Link href={`/requests/${request.id}`} className="text-blue-600 hover:underline">
                          {request.request_number}
                        </Link>
                      </TableCell>
                      <TableCell>{request.type}</TableCell>
                      <TableCell>{request.status}</TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhuma requisição aprovada por este usuário.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}