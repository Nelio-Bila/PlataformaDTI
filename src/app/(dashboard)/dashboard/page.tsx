"use client";

import { fetch_statistics } from "@/actions/dashboard";
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
// import { useSession } from "next-auth/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardHomePage() {
  // const { data: session, status } = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ["statistics"],
    queryFn: fetch_statistics,
    // enabled: !!session?.user?.groups?.some((g) => g.permissions.includes("dashboard:read")),
  });


//   if (!session?.user?.groups?.some((g) => g.permissions.includes("dashboard:read"))) {
//     return (
//         <div className="p-6">
//           <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
//           <p>You do not have permission to view the dashboard.</p>
//         </div>
//     );
//   }

  return (

      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50">Painel</h1>

        {isLoading ? (
          <DashboardSkeleton/>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {/* Total Equipment Card */}
            <Card>
              <CardHeader>
                <CardTitle>Total Equipmentos registrados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-6xl text-center font-bold text-blue-600">{data?.total_equipment || 0}</p>
              </CardContent>
            </Card>

            {/* Status Breakdown Card */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Detalhamento do Estado dos equipamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data?.status_data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Equipment by Department Card */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle>Equipmentos por Departmento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.department_data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
  );
}