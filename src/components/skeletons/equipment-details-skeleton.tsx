"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function EquipmentDetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-background rounded-lg border shadow-lg overflow-hidden">
      {/* Header Skeleton */}
      <div className="bg-primary p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-white/20 rounded animate-pulse mb-2" />
            <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
          </div>
          <Button asChild variant="outline" className="text-white bg-primary border-white hover:bg-white/20">
            <Link href="/equipments">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Details Section Skeleton */}
        <div>
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {/* Generate 10 skeleton items for details */}
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index}>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="mt-1 h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
          {/* Edit button skeleton */}
          <div className="mt-6 h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Images Section Skeleton */}
        <div>
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Generate 4 skeleton images */}
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
                style={{ height: '192px' }} // matches h-48 from original
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}