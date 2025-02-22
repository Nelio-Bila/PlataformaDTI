import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function EquipmentPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Skeleton className="h-10 w-64" /> {/* Search */}
          <Skeleton className="h-10 w-44" /> {/* Type */}
          <Skeleton className="h-10 w-44" /> {/* Status */}
          <Skeleton className="h-10 w-44" /> {/* Direction */}
          <Skeleton className="h-10 w-44" /> {/* Department */}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" /> {/* Export */}
          <Skeleton className="h-10 w-36" /> {/* Register */}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-6 w-6" /></TableHead>
              <TableHead><Skeleton className="h-6 w-20" /></TableHead>
              <TableHead><Skeleton className="h-6 w-16" /></TableHead>
              <TableHead><Skeleton className="h-6 w-16" /></TableHead>
              <TableHead><Skeleton className="h-6 w-16" /></TableHead>
              <TableHead><Skeleton className="h-6 w-16" /></TableHead>
              <TableHead><Skeleton className="h-6 w-20" /></TableHead>
              <TableHead><Skeleton className="h-6 w-20" /></TableHead>
              <TableHead><Skeleton className="h-6 w-20" /></TableHead>
              <TableHead><Skeleton className="h-6 w-16" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" /> {/* Previous */}
          <Skeleton className="h-8 w-20" /> {/* Next */}
          <Skeleton className="h-6 w-24" /> {/* Page info */}
          <Skeleton className="h-8 w-28" /> {/* Page size */}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-32" /> {/* Selected */}
        </div>
      </div>
    </div>
  );
}