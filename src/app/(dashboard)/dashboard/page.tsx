// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useState } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Clock,
  FileText,
  HardDrive,
  Package,
  Users,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import DashboardSkeleton from '@/components/skeletons/dashboard-skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  formatRequestType,
  formatStatus,
  statusColors,
} from '@/types/requests';
import { RequestStatus } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

// Define color palettes
const CHART_COLORS = [
  "#005DB2",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#0088FE",
  "#00C49F",
];
const PIE_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
];
const REQUEST_COLORS = {
  REQUISITION: "#0088FE",
  RETURN: "#FFBB28",
  SUBSTITUTION: "#00C49F",
};

interface DashboardResponse {
  user: {
    id: string;
    groups: string[];
    isAdmin: boolean;
    isTechnician: boolean;
    departments: string[];
    registered_equipment_count: number;
  };
  equipment: {
    total_equipment: number;
    status_data: Array<{ status: string; count: number }>;
    department_data: Array<{ department: string; count: number }>;
    recent_equipment: Array<{
      id: string;
      serial_number: string | null;
      type: string;
      brand: string;
      model: string;
      status: string;
      created_at: string;
      department: { name: string } | null;
    }>;
    equipment_by_type: Array<{ type: string; count: number }>;
    equipment_age: Array<{ name: string; value: number }>;
  } | null;
  requests: {
    requester_name: string;
    total_my_requests: number;
    request_by_status: Array<{ status: string; count: number }>;
    request_by_type: Array<{ type: string; count: number }>;
    recent_requests: Array<{
      id: string;
      requester_name: string;
      request_number: string;
      type: string;
      status: string;
      created_at: string;
      requester: { name: string } | null;
      requester_department: { name: string } | null;
      destination_department: { name: string } | null;
    }>;
    department_requests: Array<{ department: string; count: number }>;
    monthly_requests: Array<{
      month: string;
      requisitions: number;
      returns: number;
      substitutions: number;
    }>;
  };
}

export default function DashboardHomePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, error } = useQuery<DashboardResponse>({
    queryKey: ["dashboard-statistics"],
    queryFn: () => fetch("/api/dashboard/statistics").then((res) => res.json()),
  });

  if (isLoading || !session) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50">
          Painel
        </h1>
        <p className="text-red-500">
          Erro ao carregar os dados do painel: {(error as Error).message}
        </p>
      </div>
    );
  }

  const { user, equipment, requests } = data!;
  const { isAdmin, isTechnician } = user;
  const canViewEquipment = isAdmin || isTechnician;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-50">
          Painel
        </h1>
        <div className="flex items-center space-x-2">
          {user.groups.map((group, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="bg-primary/10 text-primary"
            >
              {group}
            </Badge>
          ))}
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          {canViewEquipment && (
            <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
          )}
          <TabsTrigger value="requests">Requisições</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
            {/* Summary Cards */}
            {canViewEquipment && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Equipamentos
                    </CardTitle>
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {equipment?.total_equipment || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {equipment?.equipment_by_type?.length || 0} diferentes
                      tipos
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Seus Registos de Equipamentos
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {user.registered_equipment_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Registados por si
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Minhas Requisições
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {requests.total_my_requests}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total de requisições feitas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Requisições Pendentes
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {requests.request_by_status.find(
                      (s) => s.status === RequestStatus.PENDING
                    )?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando aprovação
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Departamentos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {requests.department_requests.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Com requisições registradas
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity and Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Monthly Requests Overview */}
            <Card className="col-span-7 md:col-span-2 lg:col-span-4">
              <CardHeader>
                <CardTitle>Tendências Mensais de Requisições</CardTitle>
                <CardDescription>
                  Requisições registradas por mês e tipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={requests.monthly_requests}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="requisitions"
                      name="Requisições"
                      stroke={REQUEST_COLORS.REQUISITION}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="returns"
                      name="Devoluções"
                      stroke={REQUEST_COLORS.RETURN}
                    />
                    <Line
                      type="monotone"
                      dataKey="substitutions"
                      name="Substituições"
                      stroke={REQUEST_COLORS.SUBSTITUTION}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Requests */}
            <Card className="col-span-7 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Requisições Recentes</CardTitle>
                <CardDescription>
                  Últimas 5 requisições registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.recent_requests.length > 0 ? (
                    requests.recent_requests.map((request) => (
                      <div key={request.id} className="flex items-center">
                        <div className="mr-4">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {request.request_number}
                            <Badge
                              className="ml-2"
                              style={{
                                backgroundColor:
                                  statusColors[
                                    request.status as keyof typeof statusColors
                                  ],
                              }}
                            >
                              {formatStatus(request.status)}
                            </Badge>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatRequestType(request.type)} por{" "}
                            {request.requester?.name ||
                              request.requester_name ||
                              "Desconhecido"}{" "}
                            -{" "}
                            {formatDistanceToNow(new Date(request.created_at), {
                              locale: pt,
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma solicitação recente encontrada.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Equipment Tab - Only visible for Admins and Technicians */}
        {canViewEquipment && (
          <TabsContent value="equipment" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Equipment Total Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Total Equipamentos Registrados</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center">
                  <p className="text-6xl text-center font-bold text-primary">
                    {equipment?.total_equipment || 0}
                  </p>
                </CardContent>
              </Card>

              {/* Equipment Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Estado dos Equipamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={equipment?.status_data || []}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {equipment?.status_data?.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Equipment Age Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Idade dos Equipamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={equipment?.equipment_age || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {equipment?.equipment_age?.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Equipment by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Equipamentos por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={equipment?.equipment_by_type || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#005DB2">
                      {equipment?.equipment_by_type?.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Equipment by Department */}
            <Card>
              <CardHeader>
                <CardTitle>Equipamentos por Departamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={equipment?.department_data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="department"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#005DB2">
                      {equipment?.department_data?.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Equipment */}
            <Card>
              <CardHeader>
                <CardTitle>Equipamentos Recentemente Adicionados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Número de Série</th>
                        <th className="text-left p-2">Tipo</th>
                        <th className="text-left p-2">Marca/Modelo</th>
                        <th className="text-left p-2">Departamento</th>
                        <th className="text-left p-2">Estado</th>
                        <th className="text-left p-2">Adicionado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipment?.recent_equipment?.map((equip) => (
                        <tr
                          key={equip.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-2">
                            {equip.serial_number || "N/A"}
                          </td>
                          <td className="p-2">{equip.type}</td>
                          <td className="p-2">
                            {equip.brand} {equip.model}
                          </td>
                          <td className="p-2">
                            {equip.department?.name || "N/A"}
                          </td>
                          <td className="p-2">
                            <Badge
                              style={{
                                backgroundColor:
                                  statusColors[
                                    equip.status as keyof typeof statusColors
                                  ],
                              }}
                            >
                              {equip.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {formatDistanceToNow(new Date(equip.created_at), {
                              addSuffix: true,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Requests by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Requisições por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={requests.request_by_status}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" tickFormatter={formatStatus} />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name, props) => [
                        value,
                        formatStatus(props.payload.status),
                      ]}
                    />
                    <Bar dataKey="count" fill="#00C49F">
                      {requests.request_by_status.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            statusColors[
                              entry.status as keyof typeof statusColors
                            ] || "#00C49F"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Requests by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Requisições por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={requests.request_by_type}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, percent }) =>
                        `${formatRequestType(name)} ${(percent * 100).toFixed(
                          0
                        )}%`
                      }
                    >
                      {requests.request_by_type.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            REQUEST_COLORS[
                              entry.type as keyof typeof REQUEST_COLORS
                            ] || PIE_COLORS[index % PIE_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        formatRequestType(name as string),
                      ]}
                    />
                    <Legend formatter={(value) => formatRequestType(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Requests Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência Mensal de Requisições</CardTitle>
              <CardDescription>
                Distribuição de requisições ao longo do ano
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={requests.monthly_requests}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="requisitions"
                    name="Requisições"
                    stackId="a"
                    fill={REQUEST_COLORS.REQUISITION}
                  />
                  <Bar
                    dataKey="returns"
                    name="Devoluções"
                    stackId="a"
                    fill={REQUEST_COLORS.RETURN}
                  />
                  <Bar
                    dataKey="substitutions"
                    name="Substituições"
                    stackId="a"
                    fill={REQUEST_COLORS.SUBSTITUTION}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Requests by Department */}
          <Card>
            <CardHeader>
              <CardTitle>Requisições por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={requests.department_requests} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="department" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {requests.department_requests.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Requisições Recentes</CardTitle>
              <CardDescription>
                Detalhes das últimas requisições registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Número</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Solicitante</th>
                      <th className="text-left p-2">Departamento Origem</th>
                      <th className="text-left p-2">Departamento Destino</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.recent_requests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-2">{request.request_number}</td>
                        <td className="p-2">
                          {formatRequestType(request.type)}
                        </td>
                        <td className="p-2">
                          {request.requester?.name || "N/A"}
                        </td>
                        <td className="p-2">
                          {request.requester_department?.name || "N/A"}
                        </td>
                        <td className="p-2">
                          {request.destination_department?.name || "N/A"}
                        </td>
                        <td className="p-2">
                          <Badge
                            style={{
                              backgroundColor:
                                statusColors[
                                  request.status as keyof typeof statusColors
                                ],
                            }}
                          >
                            {formatStatus(request.status)}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {formatDistanceToNow(new Date(request.created_at), {
                            addSuffix: true,
                          })}
                        </td>
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
