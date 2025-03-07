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
import { Group, GroupPermission, Permission, User, UserGroup } from "@prisma/client";
import { Edit, Key, Users } from "lucide-react";
import Link from "next/link";

interface GroupDetailsProps {
  group: Group & {
    users: (UserGroup & { user: User })[];
    permissions: (GroupPermission & { permission: Permission })[];
  };
}

export function GroupDetails({ group }: GroupDetailsProps) {
  return (
    <div className="space-y-6 min-w-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Detalhes do Grupo: {group.name}</h1>
        <Link href={`/users/groups/edit/${group.id}`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar Grupo
          </Button>
        </Link>
      </div>

      {/* Group Information */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Informações do Grupo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Nome:</p>
            <p>{group.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Descrição:</p>
            <p>{group.description || "N/D"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Criado em:</p>
            <p>{new Date(group.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Actualizado em:</p>
            <p>{new Date(group.updated_at).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </div>

      {/* Users */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Utilizadores Associados
        </h2>
        <div className="relative rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Associação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.users.length > 0 ? (
                  group.users.map((userGroup) => (
                    <TableRow key={userGroup.user_id}>
                      <TableCell>{userGroup.user.name || "N/D"}</TableCell>
                      <TableCell>{userGroup.user.email || "N/D"}</TableCell>
                      <TableCell>{new Date(userGroup.assigned_at).toLocaleDateString("pt-BR")}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Nenhum utilizador associado a este grupo.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Key className="h-5 w-5" />
          Permissões Associadas
        </h2>
        <div className="relative rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data de Associação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.permissions.length > 0 ? (
                  group.permissions.map((groupPermission) => (
                    <TableRow key={groupPermission.permission_id}>
                      <TableCell>{groupPermission.permission?.name}</TableCell>
                      <TableCell>{groupPermission.permission?.description || "N/D"}</TableCell>
                      <TableCell>{new Date(groupPermission.assigned_at).toLocaleDateString("pt-BR")}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Nenhuma permissão associada a este grupo.
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