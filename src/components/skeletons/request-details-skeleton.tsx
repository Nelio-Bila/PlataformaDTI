import { Skeleton } from "@/components/ui/skeleton";

export function RequestDetailsSkeleton() {
  return (
    <div className="space-y-6 p-6 w-full">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-20" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Request Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Request Overview Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-5 w-60" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-5 w-60" />
            <Skeleton className="h-5 w-52" />
          </div>
        </div>
      </div>

      {/* Request Items Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="overflow-x-auto">
          <div className="w-full space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>

      {/* Comments Skeleton (optional, only if comments exist) */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}