// src/components/skeletons/request-form-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function RequestFormSkeleton() {
  return (
    <div className="space-y-8 border p-4 sm:p-6 rounded-lg shadow-sm w-full max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="text-center sm:text-left">
          <Skeleton className="h-6 w-64 mb-1" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="w-full sm:w-auto flex flex-col items-center sm:items-end space-y-2">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Items Table Skeleton */}
      <div className="w-full overflow-x-auto">
        <div className="border rounded-md">
          <div className="flex bg-muted p-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4 ml-2" />
            <Skeleton className="h-4 w-1/6 ml-2" />
          </div>
          <div className="p-2 space-y-2">
            {/* Simulate 2 rows */}
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Skeleton className="h-20 w-1/2" />
                <div className="flex space-x-2 w-1/4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
                <Skeleton className="h-8 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Item Button Skeleton */}
      <Skeleton className="h-8 w-32" />

      {/* Requester and Destination Details Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Requester Section */}
        <div className="border p-4 rounded-lg">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>

        {/* Destination Section */}
        <div className="border p-4 rounded-lg">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>

      {/* Submit Button Skeleton */}
      <div className="flex justify-end mt-4">
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  );
}