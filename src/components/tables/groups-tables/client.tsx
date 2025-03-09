// src/components/tables/groups-tables/client.tsx
"use client";

import TableSortHeader from "@/components/datatable/table-sort-header";
import GroupsClientSkeleton from "@/components/skeletons/groups-client-skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Edit, Eye, Key, MoreHorizontal, Plus, RefreshCw, Trash2 } from "lucide-react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface Group {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  permissions: { permission: { id: string; name: string } }[];
}

export function GroupsClient() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState([{ id: "name", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [managePermissionsDialogOpen, setManagePermissionsDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    select: true,
    name: true,
    description: true,
    permissions: true,
    created_at: true,
    actions: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  const { data: groupsData, isLoading: isGroupsLoading, error: groupsError, refetch } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await fetch("/api/users/groups");
      if (!response.ok) throw new Error("Failed to fetch groups");
      return response.json() as Promise<Group[]>;
    },
    enabled: isAuthenticated === true,
  });

  const { data: permissionsData, isLoading: isPermissionsLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await fetch("/api/users/groups/permissions");
      if (!response.ok) throw new Error("Failed to fetch permissions");
      return response.json();
    },
    enabled: isAuthenticated === true,
  });

  const { mutate: deleteGroup } = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch("/api/users/groups/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) throw new Error("Failed to delete groups");
      return response.json();
    },
    onSuccess: () => {
      refetch();
      setRowSelection({});
      setDeleteDialogOpen(false);
    },
  });

  const { mutate: addPermissionToGroup } = useMutation({
    mutationFn: async ({ groupId, permissionId }: { groupId: string; permissionId: string }) => {
      const response = await fetch(`/api/users/groups/${groupId}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionId }),
      });
      if (!response.ok) throw new Error("Failed to add permission to group");
      return response.json();
    },
    onSuccess: () => refetch(),
  });

  const { mutate: removePermissionFromGroup } = useMutation({
    mutationFn: async ({ groupId, permissionId }: { groupId: string; permissionId: string }) => {
      const response = await fetch(`/api/users/groups/${groupId}/permissions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionId }),
      });
      if (!response.ok) throw new Error("Failed to remove permission from group");
      return response.json();
    },
    onSuccess: () => refetch(),
  });

  const columns = useMemo<ColumnDef<Group>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecionar todos"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecionar linha"
          />
        ),
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: () => (
          <TableSortHeader
            title="Nome"
            sort={sorting[0]?.id === "name" ? (sorting[0]?.desc ? "desc" : "asc") : null}
            onClick={() => setSorting([{ id: "name", desc: sorting[0]?.id === "name" && !sorting[0]?.desc }])}
          />
        ),
        cell: ({ row }) => row.getValue("name"),
      },
      {
        accessorFn: (row) => row.description,
        id: "description",
        header: "Descrição",
        cell: ({ row }) => row.getValue("description") || "N/D",
      },
      {
        accessorFn: (row) => row.permissions.map((p) => p.permission.name).join(", "),
        id: "permissions",
        header: "Permissões",
        cell: ({ row }) => row.getValue("permissions") || "Nenhuma",
      },
      {
        accessorFn: (row) => row.created_at,
        id: "created_at",
        header: () => (
          <TableSortHeader
            title="Criado Em"
            sort={sorting[0]?.id === "created_at" ? (sorting[0]?.desc ? "desc" : "asc") : null}
            onClick={() => setSorting([{ id: "created_at", desc: sorting[0]?.id === "created_at" && !sorting[0]?.desc }])}
          />
        ),
        cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString("pt-BR"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem className="flex gap-2">
                <Eye />
                <Link href={`/groups/${row.original.id}`}>Ver Detalhes</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex gap-2">
                <Edit />
                <Link href={`/groups/edit/${row.original.id}`}>Editar</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedGroupId(row.original.id);
                  setManagePermissionsDialogOpen(true);
                }}
                className="flex gap-2"
              >
                <Key />
                <span>Gerir Permissões</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setItemToDelete(row.original.id);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600 flex gap-2"
              >
                <Trash2 />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [sorting]
  );

  const table = useReactTable({
    data: groupsData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      pagination: { pageIndex, pageSize },
      globalFilter,
      rowSelection,
      columnVisibility,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil((groupsData?.length || 0) / pageSize),
  });

  const handleDelete = useCallback((ids: string[]) => {
    deleteGroup(ids);
  }, [deleteGroup]);

  if (isAuthenticated === null || isGroupsLoading) {
    return <GroupsClientSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
        <p>Você precisa estar logado para visualizar os grupos.</p>
        <Link href="/api/auth/signin">
          <Button className="mt-4">Fazer Login</Button>
        </Link>
      </div>
    );
  }

  if (groupsError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Erro</h1>
        <p>Erro ao carregar grupos: {groupsError.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  const selectedGroup = groupsData?.find((group) => group.id === selectedGroupId);

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Grupos de Utilizadores</h1>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {Object.keys(rowSelection).length > 0 && (
            <Button onClick={() => setDeleteDialogOpen(true)} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Selecionados
            </Button>
          )}
          <Link href="/groups/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Grupo
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input
          placeholder="Pesquisar grupos..."
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
            setPageIndex(0);
            refetch();
          }}
        />
      </div>

      <div className="relative rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nenhum grupo encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((old) => Math.max(old - 1, 0))}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((old) => old + 1)}
            disabled={!table.getCanNextPage()}
          >
            Próximo
          </Button>
          <span className="flex items-center gap-1">
            <div>Página</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </strong>
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPageIndex(0);
              refetch();
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Linhas por página" />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} linhas
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Selecionados: {Object.keys(rowSelection).length} de{" "}
            {table.getFilteredRowModel().rows.length}
          </span>
          {Object.keys(rowSelection).length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>
              Limpar seleção
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete
                ? "Tem certeza de que deseja excluir este grupo?"
                : `Tem certeza de que deseja excluir ${Object.keys(rowSelection).length} grupos selecionados?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) handleDelete([itemToDelete]);
                else handleDelete(Object.keys(rowSelection));
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={managePermissionsDialogOpen} onOpenChange={setManagePermissionsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gere Permissões para {selectedGroup?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Adicione ou remova permissões para este grupo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Select
              onValueChange={(permissionId) => addPermissionToGroup({ groupId: selectedGroupId!, permissionId })}
              disabled={isPermissionsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Adicionar permissão" />
              </SelectTrigger>
              <SelectContent>
                {permissionsData?.map((permission: { id: string; name: string }) => (
                  <SelectItem key={permission.id} value={permission.id}>
                    {permission.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <h3 className="text-sm font-medium">Permissões Atuais</h3>
              {selectedGroup?.permissions.map((p) => (
                <div key={p.permission.id} className="flex justify-between items-center py-2">
                  <span>{p.permission.name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removePermissionFromGroup({ groupId: selectedGroupId!, permissionId: p.permission.id })}
                  >
                    Remover
                  </Button>
                </div>
              ))}
              {selectedGroup?.permissions.length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma permissão associada.</p>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}