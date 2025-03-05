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
    <>
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Skeleton className="h-10 w-full" /> {/* Search */}
        <Skeleton className="h-10 w-full" /> {/* Columns Dropdown */}
        <Skeleton className="h-10 w-full" /> {/* Export to Excel */}
        <Skeleton className="h-10 w-full" /> {/* Register Equipment */}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 md:grid-cols-5 gap-2">
        <Skeleton className="h-10 w-full" /> {/* Type Filter */}
        <Skeleton className="h-10 w-full" /> {/* Status Filter */}
        <Skeleton className="h-10 w-full" /> {/* Direction Filter */}
        <Skeleton className="h-10 w-full" /> {/* Department Filter */}
        <Skeleton className="h-10 w-full" /> {/* Clear Filters */}
      </div>

      {/* Table */}
      <div className="relative rounded-md border overflow-x-auto">
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
    </>
  );
}