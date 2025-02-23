// components/DashboardSkeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Title Skeleton */}
      <Skeleton className="h-9 w-48 " />

      {/* Grid Layout Skeleton */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Total Equipment Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 " />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-24 mx-auto " />
          </CardContent>
        </Card>

        {/* Status Breakdown Card Skeleton */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 " />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full " />
          </CardContent>
        </Card>

        {/* Equipment by Department Card Skeleton */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 " />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full " />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSkeleton;