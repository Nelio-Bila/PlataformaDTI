import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbsSkeleton } from "@/components/skeletons/breadcrumbs-skeleton"; // You might need to create this or reuse an existing skeleton for Breadcrumbs

export default function EquipmentAddPageSkeleton() {
  return (
    <div className="p-6 w-full space-y-6">
      {/* Breadcrumbs Skeleton */}
      <BreadcrumbsSkeleton />

      {/* Page Title Skeleton */}
      <Skeleton className="h-8 w-64 mx-auto" />

      {/* Form Skeleton (Mirroring EquipmentForm structure) */}
      <div className="space-y-8">
        {/* Grid of form fields (4 columns for first row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-6 w-32" /> {/* Label Skeleton */}
              <Skeleton className="h-10 w-full" /> {/* Input Skeleton */}
              <Skeleton className="h-4 w-48" /> {/* Description Skeleton */}
            </div>
          ))}
        </div>

        {/* Grid of form fields (3 columns for second row) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-6 w-32" /> {/* Label Skeleton */}
              <Skeleton className="h-10 w-full" /> {/* Input Skeleton */}
              <Skeleton className="h-4 w-48" /> {/* Description Skeleton */}
            </div>
          ))}
        </div>

        {/* Image Upload Section Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" /> {/* Heading Skeleton */}
          <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700">
            <Skeleton className="h-8 w-8 mb-2" /> {/* Upload Icon Skeleton */}
            <Skeleton className="h-4 w-64 mb-4" /> {/* Text Skeleton */}
            <div className="flex flex-col-reverse md:flex-row gap-2">
              <Skeleton className="h-10 w-32" /> {/* Select Files Button Skeleton */}
              <Skeleton className="h-10 w-32" /> {/* Take Photo Button Skeleton */}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="relative bg-white dark:bg-gray-950 p-2 rounded-lg shadow">
                <Skeleton className="w-full h-32 rounded" /> {/* Image Placeholder Skeleton */}
                <Skeleton className="h-4 w-32 mt-1" /> {/* Filename Skeleton */}
              </div>
            ))}
          </div>
        </div>

        {/* Grid of form fields (2 columns for third row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-6 w-32" /> {/* Label Skeleton */}
              <Skeleton className="h-10 w-full" /> {/* Input Skeleton */}
              <Skeleton className="h-4 w-48" /> {/* Description Skeleton */}
            </div>
          ))}
        </div>

        {/* Grid of form fields (3 columns for fourth row) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-6 w-32" /> {/* Label Skeleton */}
              <Skeleton className="h-10 w-full" /> {/* Input Skeleton */}
              <Skeleton className="h-4 w-48" /> {/* Description Skeleton */}
            </div>
          ))}
        </div>

        {/* Error Message Skeleton (optional) */}
        <Skeleton className="h-4 w-full" />

        {/* Submit Button Skeleton */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-48" /> {/* Button Skeleton */}
        </div>
      </div>
    </div>
  );
}