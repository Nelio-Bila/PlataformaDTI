import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Columns, PackagePlus, RefreshCw, Sheet } from "lucide-react";

export default function RequestClientSkeleton() {
  return (
    <div className="space-y-6 min-w-0">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Button variant="outline" size="icon" disabled>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Input placeholder="Pesquisar requisições..." disabled />
        <Button variant="outline" disabled>
          <Columns className="h-4 w-4 mr-2" />
          Colunas
        </Button>
        <Button variant="outline" disabled className="flex flex-nowrap gap-2">
          <Sheet />
          <span>Exportar para Excel</span>
        </Button>
        <Button disabled>
          <PackagePlus />
          <span>Criar Requisição</span>
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:space-x-2 flex-wrap">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-8 w-32" />
        ))}
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="relative rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((col) => (
                <TableHead key={col}>
                  <Skeleton className="h-6 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
              <TableRow key={row}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cell) => (
                  <TableCell key={cell}>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
    </div>
  );
}