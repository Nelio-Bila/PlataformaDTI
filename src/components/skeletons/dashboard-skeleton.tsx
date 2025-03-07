// components/DashboardSkeleton.tsx

// src/components/skeletons/dashboard-skeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50">Painel</h1>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" disabled>Visão Geral</TabsTrigger>
          <TabsTrigger value="equipment" disabled>Equipamentos</TabsTrigger>
          <TabsTrigger value="requests" disabled>Requisições</TabsTrigger>
        </TabsList>

        {/* Overview Tab Skeleton */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Summary Cards */}
            {Array(4).fill(0).map((_, index) => (
              <Card key={`summary-card-${index}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-5 w-[120px]" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-7 md:col-span-2 lg:col-span-4">
              <CardHeader>
                <Skeleton className="h-6 w-60 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[350px] w-full rounded-md" />
              </CardContent>
            </Card>

            <Card className="col-span-7 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-36" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, index) => (
                    <div key={`recent-item-${index}`} className="flex items-center">
                      <Skeleton className="h-8 w-8 mr-4" />
                      <div className="space-y-2 w-full">
                        <Skeleton className="h-5 w-full max-w-[250px]" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Equipment Tab Skeleton */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array(3).fill(0).map((_, index) => (
              <Card key={`equip-summary-${index}`}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[200px] w-full rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Equipment Charts */}
          {Array(3).fill(0).map((_, index) => (
            <Card key={`equip-chart-${index}`}>
              <CardHeader>
                <Skeleton className="h-6 w-56" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-md" />
              </CardContent>
            </Card>
          ))}

          {/* Recent Equipment Table */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {Array(6).fill(0).map((_, index) => (
                        <th key={`table-head-${index}`} className="text-left p-2">
                          <Skeleton className="h-4 w-20" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array(5).fill(0).map((_, rowIndex) => (
                      <tr key={`table-row-${rowIndex}`} className="border-b">
                        {Array(6).fill(0).map((_, colIndex) => (
                          <td key={`table-cell-${rowIndex}-${colIndex}`} className="p-2">
                            <Skeleton className="h-4 w-full max-w-[80px]" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab Skeleton */}
        <TabsContent value="requests" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Array(2).fill(0).map((_, index) => (
              <Card key={`req-chart-${index}`}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-56 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full rounded-md" />
            </CardContent>
          </Card>

          {/* Department Requests */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-md" />
            </CardContent>
          </Card>

          {/* Recent Requests Table */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {Array(7).fill(0).map((_, index) => (
                        <th key={`req-table-head-${index}`} className="text-left p-2">
                          <Skeleton className="h-4 w-20" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array(5).fill(0).map((_, rowIndex) => (
                      <tr key={`req-table-row-${rowIndex}`} className="border-b">
                        {Array(7).fill(0).map((_, colIndex) => (
                          <td key={`req-table-cell-${rowIndex}-${colIndex}`} className="p-2">
                            <Skeleton className="h-4 w-full max-w-[80px]" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}