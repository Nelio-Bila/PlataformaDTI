"use client";

import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Define the type for the status data
interface StatusData {
  status: string;
  count: number;
}

export default function DashboardHomePage() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-statistics"],
    queryFn: () => fetch("/api/dashboard/statistics").then((res) => res.json()),
  });

  // Define colors for the pie chart segments
  const COLORS = ["#005DB2", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50">Painel</h1>
        <p className="text-red-500">Erro ao carregar os dados do painel: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50">Painel</h1>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Total Equipment Card */}
        <Card>
          <CardHeader>
            <CardTitle>Total Equipamentos registrados</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center align-middle">
            <p className="text-6xl text-center font-bold text-primary">
              {data?.total_equipment || 0}
            </p>
          </CardContent>
        </Card>

        {/* Status Breakdown Card (Now a Pie Chart) */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Percentagem do Estado dos equipamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data?.status_data || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {data?.status_data?.map((_: StatusData, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Equipment by Department Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Equipamentos por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.department_data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#005DB2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}