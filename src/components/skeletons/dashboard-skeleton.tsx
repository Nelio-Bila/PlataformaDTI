"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component


export default function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-48" /> {/* Skeleton for the title */}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Skeleton for Total Equipment Card */}
        <CardSkeleton>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" /> {/* Skeleton for the card title */}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-24 mx-auto" /> {/* Skeleton for the total equipment count */}
          </CardContent>
        </CardSkeleton>

        {/* Skeleton for Status Breakdown Card */}
        <CardSkeleton className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-64" /> {/* Skeleton for the card title */}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartSkeleton height={200} /> {/* Skeleton for the bar chart */}
          </CardContent>
        </CardSkeleton>

        {/* Skeleton for Equipment by Department Card */}
        <CardSkeleton className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-64" /> {/* Skeleton for the card title */}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartSkeleton height={300} /> {/* Skeleton for the bar chart */}
          </CardContent>
        </CardSkeleton>
      </div>
    </div>
  );
}


export function BarChartSkeleton({ height }: { height: number }) {
  return (
    <div className="w-full" style={{ height }}>
      {/* Skeleton for the chart container */}
      <div className="flex h-full w-full flex-col gap-2">
        {/* Skeleton for the Y-axis */}
        <div className="flex h-full">
          <div className="flex h-full w-8 flex-col justify-between pr-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>

          {/* Skeleton for the chart area */}
          <div className="flex-1">
            {/* Skeleton for the grid lines */}
            <div className="h-full w-full space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-[1px] w-full" />
              ))}
            </div>

            {/* Skeleton for the bars */}
            <div className="absolute bottom-0 left-0 right-0 top-0 flex items-end gap-2 px-8">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-1/2 w-8" />
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton for the X-axis */}
        <div className="flex h-8 items-center justify-between pl-8">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-12" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
      {/* Skeleton for the card header */}
      <div className="border-b p-4">
        <Skeleton className="h-6 w-48" /> {/* Placeholder for the title */}
      </div>

      {/* Skeleton for the card content */}
      <div className="p-4">{children}</div>
    </div>
  );
}