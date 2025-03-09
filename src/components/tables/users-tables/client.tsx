// src/components/tables/users-tables/client.tsx
"use client";

import TableSortHeader from "@/components/datatable/table-sort-header";
import UsersClientSkeleton from "@/components/skeletons/users-client-skeleton";
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
import { Edit, Eye, Lock, MoreHorizontal, RefreshCw, Trash2, UserPlus, Users } from "lucide-react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface User {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
  groups: { group: { id: string; name: string } }[];
}

export function UsersClient() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState([{ id: "created_at", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [manageGroupsDialogOpen, setManageGroupsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    select: true,
    name: true,
    email: true,
    groups: true,
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

  const { data: usersData, isLoading: isUsersLoading, error: usersError, refetch } = useQuery({
    queryKey: ["users", pageIndex, pageSize, sorting, globalFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pageIndex.toString(),
        pageSize: pageSize.toString(),
        search: globalFilter,
      });
      const response = await fetch(`/api/users?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json() as Promise<{ data: User[]; total: number }>;
    },
    enabled: isAuthenticated === true,
  });

  const { data: groupsData, isLoading: isGroupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await fetch("/api/groups");
      if (!response.ok) throw new Error("Failed to fetch groups");
      return response.json();
    },
    enabled: isAuthenticated === true,
  });

  const { mutate: deleteUser } = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch("/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) throw new Error("Failed to delete users");
      return response.json();
    },
    onSuccess: () => {
      refetch();
      setRowSelection({});
      setDeleteDialogOpen(false);
    },
  });

  const { mutate: addUserToGroup } = useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const response = await fetch(`/api/groups/${groupId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to add user to group");
      return response.json();
    },
    onSuccess: () => refetch(),
  });

  const { mutate: removeUserFromGroup } = useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const response = await fetch(`/api/groups/${groupId}/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to remove user from group");
      return response.json();
    },
    onSuccess: () => refetch(),
  });

  const columns = useMemo<ColumnDef<User>[]>(
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
        cell: ({ row }) => row.getValue("name") || "N/D",
      },
      {
        accessorFn: (row) => row.email,
        id: "email",
        header: () => (
          <TableSortHeader
            title="Email"
            sort={sorting[0]?.id === "email" ? (sorting[0]?.desc ? "desc" : "asc") : null}
            onClick={() => setSorting([{ id: "email", desc: sorting[0]?.id === "email" && !sorting[0]?.desc }])}
          />
        ),
        cell: ({ row }) => row.getValue("email") || "N/D",
      },
      {
        accessorFn: (row) => row.groups.map((g) => g.group.name).join(", "),
        id: "groups",
        header: "Grupos",
        cell: ({ row }) => row.getValue("groups") || "Nenhum",
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
                <Link href={`/users/${row.original.id}`}>Ver Detalhes</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex gap-2">
                <Edit />
                <Link href={`/users/edit/${row.original.id}`}>Editar</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUserId(row.original.id);
                  setManageGroupsDialogOpen(true);
                }}
                className="flex gap-2"
              >
                <Users />
                <span>Gerir Grupos</span>
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
    data: usersData?.data || [],
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
    pageCount: Math.ceil((usersData?.total || 0) / pageSize),
  });

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", pageIndex.toString());
    params.set("pageSize", pageSize.toString());
    if (globalFilter) params.set("search", globalFilter);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [pageIndex, pageSize, globalFilter, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  const handleDelete = useCallback((ids: string[]) => {
    deleteUser(ids);
  }, [deleteUser]);

  if (isAuthenticated === null || isUsersLoading) {
    return <UsersClientSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
        <p>Você precisa estar logado para visualizar os Utilizador.</p>
        <Link href="/api/auth/signin">
          <Button className="mt-4">Fazer Login</Button>
        </Link>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Erro</h1>
        <p>Erro ao carregar Utilizadores: {usersError.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  const selectedUser = usersData?.data.find((user) => user.id === selectedUserId);

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Utilizadores</h1>
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
          <Link href="/users/groups">
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Grupos de Utilizadores
            </Button>
          </Link>
          <Link href="users/groups/permissions/add">
            <Button>
              <Lock className="h-4 w-4 mr-2" />
              Permissões
            </Button>
          </Link>
          <Link href="/users/add">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Utilizador
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input
          placeholder="Pesquisar utilizadores..."
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
                    Nenhum utilizador encontrado.
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
                ? "Tem certeza de que deseja excluir este utilizador?"
                : `Tem certeza de que deseja excluir ${Object.keys(rowSelection).length} utilizador selecionados?`}
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

      <AlertDialog open={manageGroupsDialogOpen} onOpenChange={setManageGroupsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gere Grupos para {selectedUser?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Adicione ou remova grupos para este utilizador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Select
              onValueChange={(groupId) => addUserToGroup({ groupId, userId: selectedUserId! })}
              disabled={isGroupsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Adicionar grupo" />
              </SelectTrigger>
              <SelectContent>
                {groupsData?.map((group: { id: string; name: string }) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <h3 className="text-sm font-medium">Grupos Atuais</h3>
              {selectedUser?.groups.map((g) => (
                <div key={g.group.id} className="flex justify-between items-center py-2">
                  <span>{g.group.name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeUserFromGroup({ groupId: g.group.id, userId: selectedUserId! })}
                  >
                    Remover
                  </Button>
                </div>
              ))}
              {selectedUser?.groups.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum grupo associado.</p>
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