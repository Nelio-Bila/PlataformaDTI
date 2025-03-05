// src/components/tables/request-tables/client.tsx
"use client";

import TableFilter from "@/components/datatable/table-filter";
import TableSortHeader from "@/components/datatable/table-sort-header";
import RequestClientSkeleton from "@/components/skeletons/request-client-skeleton";
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
  DropdownMenuCheckboxItem,
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
import { FilterOptions, FiltersState, Request } from "@/types/requests";
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
import { ArrowLeft, BadgeAlertIcon, BadgeCheckIcon, Ban, CheckCircle, Clock, Columns, Eye, FilterX, Hospital, Loader2, MoreHorizontal, Package, PackagePlus, RefreshCw, Sheet, Trash, Trash2 } from "lucide-react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface FilterOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className: string }>;
}

export function RequestClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  const initialState = useMemo(
    () => ({
      pageIndex: Number(searchParams.get("page")) || 0,
      pageSize: Number(searchParams.get("pageSize")) || 10,
      sorting: [
        {
          id: searchParams.get("sortColumn") || "created_at",
          desc: searchParams.get("sortDirection") !== "asc",
        },
      ],
      globalFilter: searchParams.get("search") || "",
      filters: {
        type: searchParams.get("type")?.split(",") || [],
        status: searchParams.get("status")?.split(",") || [],
        requester_direction_id: searchParams.get("requester_direction")?.split(",") || [],
        requester_department_id: searchParams.get("requester_department")?.split(",") || [],
      },
    }),
    [searchParams]
  );

  const [pageIndex, setPageIndex] = useState(initialState.pageIndex);
  const [pageSize, setPageSize] = useState(initialState.pageSize);
  const [sorting, setSorting] = useState(initialState.sorting);
  const [globalFilter, setGlobalFilter] = useState(initialState.globalFilter);
  const [filters, setFilters] = useState<FiltersState>(initialState.filters);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    select: true,
    request_number: true,
    type: true,
    status: true,
    requester: true,
    requester_direction: true,
    requester_department: true,
    destination_direction: true,
    destination_department: true,
    created_at: true,
    actions: true,
  });

  // Fetch request data
  const { data: requestData, isLoading: isRequestLoading, error: requestError, refetch } = useQuery({
    queryKey: ["requests", pageIndex, pageSize, sorting, globalFilter, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pageIndex.toString(),
        page_size: pageSize.toString(),
        sort_column: sorting[0]?.id || "created_at",
        sort_direction: sorting[0]?.desc ? "desc" : "asc",
        filter: globalFilter,
        ...(filters.type.length > 0 && { type: filters.type.join(",") }),
        ...(filters.status.length > 0 && { status: filters.status.join(",") }),
        ...(filters.requester_direction_id.length > 0 && {
          requester_direction_id: filters.requester_direction_id.join(","),
        }),
        ...(filters.requester_department_id.length > 0 && {
          requester_department_id: filters.requester_department_id.join(","),
        }),
      });
      const response = await fetch(`/api/requests?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch requests");
      return response.json() as Promise<{ data: Request[]; total: number }>;
    },
    enabled: isAuthenticated === true, // Only fetch if authenticated
  });

  // Fetch filter options
  const { data: filterOptions, isLoading: isFilterLoading, error: filterError } = useQuery({
    queryKey: ["requestFilterOptions"],
    queryFn: async () => {
      const response = await fetch("/api/request-filter-options");
      if (!response.ok) throw new Error("Failed to fetch request filter options");
      return response.json() as Promise<FilterOptions>;
    },
    enabled: isAuthenticated === true,
  });

  // Delete mutation
  const { mutate: deleteRequest } = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch("/api/requests/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) throw new Error("Failed to delete requests");
      return response.json();
    },
    onSuccess: () => {
      refetch();
      setRowSelection({});
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao excluir requisição:", error);
    },
  });

  // Define Portuguese mappings
  const requestTypeLabels: Record<string, string> = {
    REQUISITION: "Requisição",
    RETURN: "Devolução",
    SUBSTITUTION: "Substituição",
  };

  const requestStatusLabels: Record<string, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    REJECTED: "Rejeitado",
    IN_PROGRESS: "Em Progresso",
    COMPLETED: "Concluído",
    CANCELLED: "Cancelado",
  };

  const columns = useMemo<ColumnDef<Request>[]>(
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
        accessorFn: (row) => row.request_number,
        id: "request_number",
        header: () => (
          <TableSortHeader
            title="Número da Requisição"
            sort={sorting[0]?.id === "request_number" ? (sorting[0]?.desc ? "desc" : "asc") : null}
            onClick={() => {
              setSorting([
                {
                  id: "request_number",
                  desc: sorting[0]?.id === "request_number" && !sorting[0]?.desc ? true : false,
                },
              ]);
              refetch();
            }}
          />
        ),
        cell: ({ row }) => row.getValue("request_number") || "N/D",
      },
      {
        accessorFn: (row) => row.type,
        id: "type",
        header: () => (
          <TableSortHeader
            title="Tipo"
            sort={sorting[0]?.id === "type" ? (sorting[0]?.desc ? "desc" : "asc") : null}
            onClick={() => {
              setSorting([
                {
                  id: "type",
                  desc: sorting[0]?.id === "type" && !sorting[0]?.desc ? true : false,
                },
              ]);
              refetch();
            }}
          />
        ),
        cell: ({ row }) => requestTypeLabels[row.getValue("type") as string] || row.getValue("type"),
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: () => (
          <TableSortHeader
            title="Status"
            sort={sorting[0]?.id === "status" ? (sorting[0]?.desc ? "desc" : "asc") : null}
            onClick={() => {
              setSorting([
                {
                  id: "status",
                  desc: sorting[0]?.id === "status" && !sorting[0]?.desc ? true : false,
                },
              ]);
              refetch();
            }}
          />
        ),
        cell: ({ row }) => requestStatusLabels[row.getValue("status") as string] || row.getValue("status"),
      },
      {
        accessorFn: (row) => row.requester_name || row.requester?.name,
        id: "requester",
        header: () => (
          <TableSortHeader
            title="Solicitante"
            sort={sorting[0]?.id === "requester" ? (sorting[0]?.desc ? "desc" : "asc") : null}
            onClick={() => {
              setSorting([
                {
                  id: "requester",
                  desc: sorting[0]?.id === "requester" && !sorting[0]?.desc ? true : false,
                },
              ]);
              refetch();
            }}
          />
        ),
        cell: ({ row }) => row.getValue("requester") || "N/D",
      },
      {
        accessorFn: (row) => row.requester_direction?.name,
        id: "requester_direction",
        header: () => (
          <TableSortHeader
            title="Direção (Solicitante)"
            sort={sorting[0]?.id === "requester_direction" ? (sorting[0]?.desc ? "desc" : "asc") : null}
            onClick={() => {
              setSorting([
                {
                  id: "requester_direction",
                  desc: sorting[0]?.id === "requester_direction" && !sorting[0]?.desc ? true : false,
                },
              ]);
              refetch();
            }}
          />
        ),
        cell: ({ row }) => row.getValue("requester_direction") || "N/D",
      },
      {
        accessorFn: (row) => row.requester_department?.name,
        id: "requester_department",
        header: () => (
          <TableSortHeader
            title="Departamento (Solicitante)"
            sort={sorting[0]?.id === "requester_department" ? (sorting[0]?.desc ? "desc" : "asc") : null}
            onClick={() => {
              setSorting([
                {
                  id: "requester_department",
                  desc: sorting[0]?.id === "requester_department" && !sorting[0]?.desc ? true : false,
                },
              ]);
              refetch();
            }}
          />
        ),
        cell: ({ row }) => row.getValue("requester_department") || "N/D",
      },
      {
        accessorFn: (row) => row.destination_direction?.name,
        id: "destination_direction",
        header: () => (
          <TableSortHeader
            title="Direção (Destino)"
            sort={sorting[0]?.id === "destination_direction" ? (sorting[0]?.desc ? "desc" : "asc") : null}
            onClick={() => {
              setSorting([
                {
                  id: "destination_direction",
                  desc: sorting[0]?.id === "destination_direction" && !sorting[0]?.desc ? true : false,
                },
              ]);
              refetch();
            }}
          />
        ),
        cell: ({ row }) => row.getValue("destination_direction") || "N/D",
      },
      {
        accessorFn: (row) => row.destination_department?.name,
        id: "destination_department",
        header: () => (
          <TableSortHeader
            title="Departamento (Destino)"
            sort={sorting[0]?.id === "destination_department" ? (sorting[0]?.desc ? "desc" : "asc") : null}
            onClick={() => {
              setSorting([
                {
                  id: "destination_department",
                  desc: sorting[0]?.id === "destination_department" && !sorting[0]?.desc ? true : false,
                },
              ]);
              refetch();
            }}
          />
        ),
        cell: ({ row }) => row.getValue("destination_department") || "N/D",
      },
      {
        accessorFn: (row) => row.created_at,
        id: "created_at",
        header: () => (
          <TableSortHeader
            title="Criado Em"
            sort={sorting[0]?.id === "created_at" ? (sorting[0]?.desc ? "desc" : "asc") : null}
            onClick={() => {
              setSorting([
                {
                  id: "created_at",
                  desc: sorting[0]?.id === "created_at" && !sorting[0]?.desc ? true : false,
                },
              ]);
              refetch();
            }}
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
              <DropdownMenuItem className="flex flex-nowrap gap-2">
                <Eye />
                <Link href={`/requests/${row.original.id}`}>Ver Detalhes</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setItemToDelete(row.original.id);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600 flex flex-nowrap gap-2"
              >
                <Trash />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  // Define request type options
  const requestTypeOptions: FilterOption[] = [
    { value: "REQUISITION", label: "Requisição", icon: ({ className }) => <Package className={className} /> },
    { value: "RETURN", label: "Devolução", icon: ({ className }) => <ArrowLeft className={className} /> },
    { value: "SUBSTITUTION", label: "Substituição", icon: ({ className }) => <RefreshCw className={className} /> },
  ];

  // Define request status options
  const requestStatusOptions: FilterOption[] = [
    { value: "PENDING", label: "Pendente", icon: ({ className }) => <Clock className={className} /> },
    { value: "APPROVED", label: "Aprovado", icon: ({ className }) => <BadgeCheckIcon className={className} /> },
    { value: "REJECTED", label: "Rejeitado", icon: ({ className }) => <BadgeAlertIcon className={className} /> },
    { value: "IN_PROGRESS", label: "Em Progresso", icon: ({ className }) => <Loader2 className={className} /> },
    { value: "COMPLETED", label: "Concluído", icon: ({ className }) => <CheckCircle className={className} /> },
    { value: "CANCELLED", label: "Cancelado", icon: ({ className }) => <Ban className={className} /> },
  ];

  // Define direction options
  const directionOptions: FilterOption[] = filterOptions?.directions.map((direction) => ({
    value: direction.id,
    label: direction.name,
    icon: ({ className }) => <Hospital className={className} />,
  })) || [];

  // Define department options (filtered by selected directions)
  const departmentOptions: FilterOption[] = (filterOptions?.departments || [])
    .filter(
      (department) =>
        filters.requester_direction_id.length === 0 ||
        filters.requester_direction_id.includes(department.direction_id)
    )
    .map((department) => ({
      value: department.id,
      label: department.name,
      icon: ({ className }) => <Hospital className={className} />,
    }));

  const table = useReactTable({
    data: requestData?.data || [],
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
    pageCount: Math.ceil((requestData?.total || 0) / pageSize),
  });

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", pageIndex.toString());
    params.set("pageSize", pageSize.toString());
    params.set("sortColumn", sorting[0]?.id || "created_at");
    params.set("sortDirection", sorting[0]?.desc ? "desc" : "asc");
    if (globalFilter) params.set("search", globalFilter);
    if (filters.type.length > 0) params.set("type", filters.type.join(","));
    if (filters.status.length > 0) params.set("status", filters.status.join(","));
    if (filters.requester_direction_id.length > 0)
      params.set("requester_direction", filters.requester_direction_id.join(","));
    if (filters.requester_department_id.length > 0)
      params.set("requester_department", filters.requester_department_id.join(","));

    router.push(`?${params.toString()}`, { scroll: false });
  }, [pageIndex, pageSize, sorting, globalFilter, filters, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  const handleDelete = useCallback(
    (ids: string[]) => {
      deleteRequest(ids);
    },
    [deleteRequest]
  );

  const resetFilters = useCallback(() => {
    setGlobalFilter("");
    setFilters({
      type: [],
      status: [],
      requester_direction_id: [],
      requester_department_id: [],
    });
    setPageIndex(0);
    refetch();
  }, [refetch]);

  const exportToExcel = useCallback(() => {
    const exportData = table.getFilteredRowModel().rows.map((row) => {
      const rowData: { [key: string]: any } = {};
      if (columnVisibility["request_number"]) rowData["Número da Requisição"] = row.original.request_number || "N/D";
      if (columnVisibility["type"]) rowData["Tipo"] = row.original.type;
      if (columnVisibility["status"]) rowData["Status"] = row.original.status;
      if (columnVisibility["requester"]) rowData["Solicitante"] = row.original.requester_name || row.original.requester?.name || "N/D";
      if (columnVisibility["requester_direction"]) rowData["Direção (Solicitante)"] = row.original.requester_direction?.name || "N/D";
      if (columnVisibility["requester_department"]) rowData["Departamento (Solicitante)"] = row.original.requester_department?.name || "N/D";
      if (columnVisibility["destination_direction"]) rowData["Direção (Destino)"] = row.original.destination_direction?.name || "N/D";
      if (columnVisibility["destination_department"]) rowData["Departamento (Destino)"] = row.original.destination_department?.name || "N/D";
      if (columnVisibility["created_at"])
        rowData["Criado Em"] = new Date(row.original.created_at).toLocaleDateString("pt-BR");
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Requisições");
    XLSX.writeFile(workbook, `exportacao_requisicoes_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [table, columnVisibility]);

  if (isAuthenticated === null) {
    return ( <RequestClientSkeleton />);
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
        <p>Você precisa estar logado para visualizar as requisições.</p>
        <Link href="/api/auth/signin">
          <Button className="mt-4">Fazer Login</Button>
        </Link>
      </div>
    );
  }

  if (isRequestLoading || isFilterLoading) {
    return ( <RequestClientSkeleton />);
  }

  if (requestError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Erro</h1>
        <p>Erro ao carregar requisições: {requestError.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (filterError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Erro</h1>
        <p>Erro ao carregar opções de filtro: {filterError.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Requisições</h1>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {Object.keys(rowSelection).length > 0 && (
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Selecionados
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Input
          placeholder="Pesquisar requisições..."
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
            setPageIndex(0);
            refetch();
          }}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Columns className="h-4 w-4 mr-2" />
              Colunas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Selecionar Colunas</DropdownMenuLabel>
            {table.getAllColumns().map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.columnDef.header as string}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={exportToExcel} variant="outline" className="flex flex-nowrap gap-2">
          <Sheet />
          <span>Exportar para Excel</span>
        </Button>
        <Link href="/requests/add" className="flex justify-end">
          <Button>
            <PackagePlus />
            <span>Criar Requisição</span>
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:space-x-2 flex-wrap">
        <TableFilter
          title="Tipo"
          filter="type"
          options={requestTypeOptions}
          params={{
            filters: Object.entries(filters).flatMap(([key, values]) =>
              values.map((value: string) => `${key}:${value}`)
            ),
          }}
          setParams={(newParams: { filters: string[] }) => {
            const typeFilters = newParams.filters
              .filter((f) => f.startsWith("type:"))
              .map((f) => f.split(":")[1]);
            setFilters((prev) => ({ ...prev, type: typeFilters }));
            setPageIndex(0);
            refetch();
          }}
          setTimeDebounce={() => { }}
        />
        <TableFilter
          title="Status"
          filter="status"
          options={requestStatusOptions}
          params={{
            filters: Object.entries(filters).flatMap(([key, values]) =>
              values.map((value: string) => `${key}:${value}`)
            ),
          }}
          setParams={(newParams: { filters: string[] }) => {
            const statusFilters = newParams.filters
              .filter((f) => f.startsWith("status:"))
              .map((f) => f.split(":")[1]);
            setFilters((prev) => ({ ...prev, status: statusFilters }));
            setPageIndex(0);
            refetch();
          }}
          setTimeDebounce={() => { }}
        />
        <TableFilter
          title="Direção (Solicitante)"
          filter="requester_direction_id"
          options={directionOptions}
          params={{
            filters: Object.entries(filters).flatMap(([key, values]) =>
              values.map((value: string) => `${key}:${value}`)
            ),
          }}
          setParams={(newParams: { filters: string[] }) => {
            const directionFilters = newParams.filters
              .filter((f) => f.startsWith("requester_direction_id:"))
              .map((f) => f.split(":")[1]);
            setFilters((prev) => ({
              ...prev,
              requester_direction_id: directionFilters,
              requester_department_id: directionFilters.length === 0 ? [] : prev.requester_department_id,
            }));
            setPageIndex(0);
            refetch();
          }}
          setTimeDebounce={() => { }}
        />
        <TableFilter
          title="Departamento (Solicitante)"
          filter="requester_department_id"
          options={departmentOptions}
          params={{
            filters: Object.entries(filters).flatMap(([key, values]) =>
              values.map((value: string) => `${key}:${value}`)
            ),
          }}
          setParams={(newParams: { filters: string[] }) => {
            const departmentFilters = newParams.filters
              .filter((f) => f.startsWith("requester_department_id:"))
              .map((f) => f.split(":")[1]);
            setFilters((prev) => ({ ...prev, requester_department_id: departmentFilters }));
            setPageIndex(0);
            refetch();
          }}
          setTimeDebounce={() => { }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="w-full md:w-auto h-8 border-dashed border-gray-400 text-xs hover:bg-gray-200/50 dark:text-white flex gap-2"
        >
          <FilterX />
          <span>Limpar Filtros</span>
        </Button>
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
                    Nenhuma requisição encontrada.
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
            onClick={() => {
              setPageIndex((old) => Math.max(old - 1, 0));
              refetch();
            }}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPageIndex((old) => old + 1);
              refetch();
            }}
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
              <span>Limpar seleção</span>
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
                ? "Tem certeza de que deseja excluir esta requisição? Esta ação não pode ser desfeita."
                : `Tem certeza de que desea excluir ${Object.keys(rowSelection).length} itens selecionados? Esta ação não pode ser desfeita.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  handleDelete([itemToDelete]);
                } else {
                  handleDelete(Object.keys(rowSelection));
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}