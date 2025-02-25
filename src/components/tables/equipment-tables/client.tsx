// src/components/tables/equipment-tables/client.tsx

"use client";

import EquipmentPageSkeleton from "@/components/skeletons/equipment-page-skeleton";
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
import { Equipment, FilterOptions } from "@/types/equipment"; // Import updated types
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
import { Columns, Edit, Eye, FilterX, MoreHorizontal, PackagePlus, RefreshCw, Sheet, Trash, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRouter as useTopLoaderRouter } from "nextjs-toploader/app";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function EquipmentClient() {
  const router = useRouter();
  const topLoadeRouter = useTopLoaderRouter();
  const searchParams = useSearchParams();

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
        type: searchParams.get("type") || "",
        status: searchParams.get("status") || "",
        direction_id: searchParams.get("direction") || "",
        department_id: searchParams.get("department") || "",
      },
    }),
    [searchParams]
  );

  const [pageIndex, setPageIndex] = useState(initialState.pageIndex);
  const [pageSize, setPageSize] = useState(initialState.pageSize);
  const [sorting, setSorting] = useState(initialState.sorting);
  const [globalFilter, setGlobalFilter] = useState(initialState.globalFilter);
  const [filters, setFilters] = useState(initialState.filters);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    select: true,
    serial_number: true,
    type: true,
    brand: true,
    model: true,
    status: true,
    direction: true,
    department: true,
    created_at: true,
    actions: true,
  });

  // Fetch equipment data
  const { data: equipmentData, isLoading: isEquipmentLoading, error: equipmentError, refetch } = useQuery({
    queryKey: ["equipment", pageIndex, pageSize, sorting, globalFilter, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pageIndex.toString(),
        page_size: pageSize.toString(),
        sort_column: sorting[0]?.id || "created_at",
        sort_direction: sorting[0]?.desc ? "desc" : "asc",
        filter: globalFilter,
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.direction_id && { direction_id: filters.direction_id }),
        ...(filters.department_id && { department_id: filters.department_id }),
      });
      const response = await fetch(`/api/equipment?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch equipment");
      return response.json() as Promise<{ data: Equipment[]; total: number }>;
    },
  });

  // Fetch filter options
  const { data: filterOptions, isLoading: isFilterLoading, error: filterError } = useQuery({
    queryKey: ["filterOptions"],
    queryFn: async () => {
      const response = await fetch("/api/filter-options");
      if (!response.ok) throw new Error("Failed to fetch filter options");
      return response.json() as Promise<FilterOptions>;
    },
  });

  // Delete mutation
  const { mutate: deleteEquipment } = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch("/api/equipment/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) throw new Error("Failed to delete equipment");
      return response.json();
    },
    onSuccess: () => {
      refetch();
      setRowSelection({});
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao excluir equipamento:", error);
    },
  });

  const columns = useMemo<ColumnDef<Equipment>[]>(
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
        accessorFn: (row) => row.serial_number,
        id: "serial_number",
        header: "Número de Série",
        cell: ({ row }) => row.getValue("serial_number") || "N/D",
      },
      {
        accessorFn: (row) => row.type,
        id: "type",
        header: "Tipo",
        cell: ({ row }) => row.getValue("type"),
      },
      {
        accessorFn: (row) => row.brand,
        id: "brand",
        header: "Marca",
        cell: ({ row }) => row.getValue("brand"),
      },
      {
        accessorFn: (row) => row.model,
        id: "model",
        header: "Modelo",
        cell: ({ row }) => row.getValue("model"),
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: "Status",
        cell: ({ row }) => row.getValue("status"),
      },
      {
        accessorFn: (row) => row.direction?.name,
        id: "direction",
        header: "Direção",
        cell: ({ row }) => row.getValue("direction") || "N/D",
      },
      {
        accessorFn: (row) => row.department?.name,
        id: "department",
        header: "Departamento",
        cell: ({ row }) => row.getValue("department") || "N/D",
      },
      {
        accessorFn: (row) => row.created_at,
        id: "created_at",
        header: "Criado Em",
        cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString("pt-BR"),
      },
      {
        id: "actions",
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
                <Link href={`/equipments/${row.original.id}`}>Ver Detalhes</Link>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Link href={`/equipments/update/${row.original.id}`} className="flex flex-nowrap gap-2">
                  <Edit />
                  <span>Editar</span>
                </Link>
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

  const table = useReactTable({
    data: equipmentData?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => {
      setSorting(updater);
      refetch();
    },
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
    pageCount: Math.ceil((equipmentData?.total || 0) / pageSize),
  });

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", pageIndex.toString());
    params.set("pageSize", pageSize.toString());
    params.set("sortColumn", sorting[0]?.id || "created_at");
    params.set("sortDirection", sorting[0]?.desc ? "desc" : "asc");
    if (globalFilter) params.set("search", globalFilter);
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);
    if (filters.direction_id) params.set("direction", filters.direction_id);
    if (filters.department_id) params.set("department", filters.department_id);

    router.push(`?${params.toString()}`, { scroll: false });
  }, [pageIndex, pageSize, sorting, globalFilter, filters, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  const handleDelete = useCallback(
    (ids: string[]) => {
      deleteEquipment(ids);
    },
    [deleteEquipment]
  );

  const resetFilters = useCallback(() => {
    setGlobalFilter("");
    setFilters({
      type: "",
      status: "",
      direction_id: "",
      department_id: "",
    });
    setPageIndex(0);
    refetch();
  }, [refetch]);

  const exportToExcel = useCallback(() => {
    const exportData = table.getFilteredRowModel().rows.map((row) => {
      const rowData: { [key: string]: any } = {};
      if (columnVisibility["serial_number"]) rowData["Número de Série"] = row.original.serial_number || "N/D";
      if (columnVisibility["type"]) rowData["Tipo"] = row.original.type;
      if (columnVisibility["brand"]) rowData["Marca"] = row.original.brand;
      if (columnVisibility["model"]) rowData["Modelo"] = row.original.model;
      if (columnVisibility["status"]) rowData["Status"] = row.original.status;
      if (columnVisibility["direction"]) rowData["Direção"] = row.original.direction?.name || "N/D";
      if (columnVisibility["department"]) rowData["Departamento"] = row.original.department?.name || "N/D";
      if (columnVisibility["created_at"])
        rowData["Criado Em"] = new Date(row.original.created_at).toLocaleDateString("pt-BR");
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Equipamentos");
    XLSX.writeFile(workbook, `exportacao_equipamentos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [table, columnVisibility]);

  if (isEquipmentLoading || isFilterLoading) {
    return <EquipmentPageSkeleton />;
  }

  if (equipmentError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Erro</h1>
        <p>Erro ao carregar equipamentos: {equipmentError.message}</p>
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
        <h1 className="text-2xl font-bold">Equipamentos de TI</h1>
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

      {/* <div className="flex flex-col sm:flex-row justify-between gap-4"> */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Input
          placeholder="Pesquisar equipamentos..."
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
            setPageIndex(0);
            refetch();
          }}
          // className="max-w-xs"
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
        <Link href="/equipments/add" className="flex justify-end">
          <Button>
            <PackagePlus />
            <span>Registrar Equipamento</span>
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 md:grid-cols-5 gap-2">
        <Select
          value={filters.type || "all"}
          onValueChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              type: value === "all" ? "" : value,
            }));
            setPageIndex(0);
            refetch();
          }}
        >
          <SelectTrigger className="">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            {filterOptions?.types.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status || "all"}
          onValueChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              status: value === "all" ? "" : value,
            }));
            setPageIndex(0);
            refetch();
          }}
        >
          <SelectTrigger className="">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {filterOptions?.statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.direction_id || "all"}
          onValueChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              direction_id: value === "all" ? "" : value,
              department_id: value === "all" ? "" : prev.department_id,
            }));
            setPageIndex(0);
            refetch();
          }}
        >
          <SelectTrigger className="">
            <SelectValue placeholder="Filtrar por direção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Direções</SelectItem>
            {filterOptions?.directions.map((direction) => (
              <SelectItem key={direction.id} value={direction.id}>
                {direction.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.department_id || "all"}
          onValueChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              department_id: value === "all" ? "" : value,
            }));
            setPageIndex(0);
            refetch();
          }}
          disabled={!filters.direction_id || filters.direction_id === "all"}
        >
          <SelectTrigger className="">
            <SelectValue placeholder="Filtrar por departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Departamentos</SelectItem>
            {filterOptions?.departments
              .filter((dept) => dept.direction_id === filters.direction_id)
              .map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={resetFilters} className="flex ga-2">
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
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-2"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="cursor:pointer">
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
                  Nenhum resultado encontrado.
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
                ? "Tem certeza de que deseja excluir este equipamento? Esta ação não pode ser desfeita."
                : `Tem certeza de que deseja excluir ${Object.keys(rowSelection).length} itens selecionados? Esta ação não pode ser desfeita.`}
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