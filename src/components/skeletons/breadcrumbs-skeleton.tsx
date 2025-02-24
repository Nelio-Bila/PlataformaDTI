// src/components/skeletons/breadcrumbs-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function BreadcrumbsSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}