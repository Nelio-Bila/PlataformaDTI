// src/app/(dashboard)/requests/add/skeleton.tsx
import { RequestFormSkeleton } from "@/components/skeletons/request-form-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function RequestAddPageLoading() {
  return (
    <div className="p-6 w-full">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center space-x-2 mb-4">
        <Skeleton className="h-4 w-16" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-20" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Title Skeleton */}
      <Skeleton className="h-8 w-48 mx-auto mb-3" />

      {/* RequestForm Skeleton */}
      <RequestFormSkeleton />
    </div>
  );
}