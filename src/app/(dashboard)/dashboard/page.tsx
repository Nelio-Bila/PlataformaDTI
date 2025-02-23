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
  YAxis
} from "recharts";

interface DistributionItem {
  value: number;
  current_phase?: string;
  risk_level?: string;
  principal_researcher__academic_degree?: string;
  name?: string;
  // status: string;
  // count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// Component to display percentage and count in tooltips
const CustomTooltip: React.FC<{ active?: boolean; payload?: { value: number; payload: { total: number } }[]; label?: string }> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-background p-2 border rounded shadow">
        <p className="label">{`${label}`}</p>
        <p className="value">{`${payload[0].value} (${Math.round(payload[0].value / payload[0].payload.total * 100)}%)`}</p>
      </div>
    );
  }
  return null;
};

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

  // if(!session?.user){

  // }

  // Calculate totals for percentage calculations in charts
  const calculateTotal = (data: DistributionItem[]) => {
    return data.reduce((sum, item) => sum + item.value, 0);
  };

  // Add total to each distribution for percentage calculations
  const addTotalToData = (data: DistributionItem[]) => {
    const total = calculateTotal(data);
    return data.map(item => ({ ...item, total }));
  };

  return (

    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50">Painel</h1>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Total Equipment Card */}
          <Card>
            <CardHeader>
              <CardTitle>Total Equipmentos registrados</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center align-middle">
              <p className="text-6xl text-center font-bold text-primary">{data?.total_equipment || 0}</p>
            </CardContent>
          </Card>

          {/* Status Breakdown Card */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Detalhes do Estado dos equipamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.status_data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#005DB2" />
                </BarChart>
              </ResponsiveContainer>

              {/* <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[addTotalToData(data?.status_data as DistributionItem[])]}
                    dataKey="value"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }: { name?: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data?.status_data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer> */}
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
                  <Bar dataKey="count" fill="#005DB2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}