"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetch_equipment } from "@/lib/dashboard-actions";
import { Equipment } from "@/types/equipment";
import { useQuery } from "@tanstack/react-query";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import * as XLSX from "xlsx";

export default function EquipmentPage() {
    const { data: session, status } = useSession();
    const [page_index, set_page_index] = useState(0);
    const [page_size, set_page_size] = useState(10);
    const [sorting, set_sorting] = useState<{ id: string; desc: boolean }[]>([
        { id: "created_at", desc: true },
    ]);
    const [global_filter, set_global_filter] = useState("");
    const [row_selection, set_row_selection] = useState({});

    const { data, isLoading } = useQuery({
        queryKey: ["equipment", page_index, page_size, sorting, global_filter],
        queryFn: () =>
            fetch_equipment({
                page: page_index,
                page_size,
                sort_column: sorting[0]?.id || "created_at",
                sort_direction: sorting[0]?.desc ? "desc" : "asc",
                filter: global_filter,
            }),
    });

    const columns: ColumnDef<Equipment>[] = [
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
            header: "Estado",
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
    ];

    const table = useReactTable({
        data: data?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: (updater) => {
            set_sorting(updater instanceof Function ? updater(sorting) : updater);
        },
        onRowSelectionChange: set_row_selection,
        state: {
            sorting,
            pagination: { pageIndex: page_index, pageSize: page_size },
            globalFilter: global_filter,
            rowSelection: row_selection,
        },
        manualPagination: true,
        manualSorting: true,
        pageCount: Math.ceil((data?.total || 0) / page_size),
    });

    const export_to_excel = () => {
        const export_data = table.getFilteredRowModel().rows.map((row) => ({
            "Número de Série": row.original.serial_number || "N/D",
            "Tipo": row.original.type,
            "Marca": row.original.brand,
            "Modelo": row.original.model,
            "Estado": row.original.status,
            "Direção": row.original.direction?.name || "N/D",
            "Departamento": row.original.department?.name || "N/D",
            "Criado Em": new Date(row.original.created_at).toLocaleDateString("pt-BR"),
            "Data de Compra": row.original.purchase_date
                ? new Date(row.original.purchase_date).toLocaleDateString("pt-BR")
                : "N/D",
            "Fim da Garantia": row.original.warranty_end
                ? new Date(row.original.warranty_end).toLocaleDateString("pt-BR")
                : "N/D",
            "Setor": row.original.sector?.name || "N/D",
            "Serviço": row.original.service?.name || "N/D",
            "Repartição": row.original.repartition?.name || "N/D",
        }));

        const worksheet = XLSX.utils.json_to_sheet(export_data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Equipamentos");
        worksheet["!cols"] = [
            { wch: 20 },
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
        ];
        XLSX.writeFile(
            workbook,
            `exportacao_equipamentos_${new Date().toISOString().slice(0, 10)}.xlsx`
        );
    };

    if (status === "loading") {
        return <div>Carregando...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Equipamentos de TI</h1>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                        placeholder="Filtrar equipamentos..."
                        value={global_filter}
                        onChange={(e) => {
                            set_global_filter(e.target.value);
                            set_page_index(0);
                        }}
                        className="max-w-sm"
                    />
                    <Button onClick={export_to_excel} variant="outline">
                        Exportar para Excel
                    </Button>
                    <Link href="/equipments/add">
                        <Button>Registrar Equipamento</Button>
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <p>Carregando...</p>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((header_group) => (
                                    <TableRow key={header_group.id}>
                                        {header_group.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={
                                                            header.column.getCanSort()
                                                                ? "cursor-pointer select-none flex items-center gap-2"
                                                                : ""
                                                        }
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
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
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            Sem resultados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => set_page_index((old) => Math.max(old - 1, 0))}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => set_page_index((old) => old + 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                Próximo
                            </Button>
                            <span>
                                Página {table.getState().pagination.pageIndex + 1} de{" "}
                                {table.getPageCount()}
                            </span>
                        </div>
                        <div>
                            <span>
                                Selecionados: {Object.keys(row_selection).length} de{" "}
                                {table.getFilteredRowModel().rows.length}
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}