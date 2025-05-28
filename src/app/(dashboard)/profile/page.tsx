"use client";

import type { FormEvent } from 'react';
import { useState } from 'react';

import {
  AlertCircle,
  BarChart,
  BarChart2,
  CalendarIcon,
  HardDrive,
  Mail,
  MapPin,
  Shield,
  UserIcon,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';
import { SafeUserType } from '@/types';
import { PersonIcon } from '@radix-ui/react-icons';
import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import ProfileSkeleton from './loading';

// Types for form data
type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ProfileFormData = {
  name: string;
};

// Update the interface to include detailed records
interface UserActivityStats {
  totalEquipmentRegistered: number;
  equipmentByType: Array<{type: string, count: number}>;
  equipmentByLocation: Array<{location: string, count: number}>;
  equipmentByMonth: Array<{month: string, count: number}>;
  equipmentByYear: Array<{year: string, count: number}>;
  // Add detailed records
  equipmentDetails: Array<{
    id: string;
    type: string;
    brand: string;
    model: string;
    serial_number: string;
    location: string;
    department_name: string;
    created_at: string;
  }>;
}

const ProfileOverview = ({ user }: { user: SafeUserType }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
        <CardDescription>Seus dados pessoais e de contato</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <PersonIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Nome Completo</span>
              </div>
              <p className="text-sm font-medium">{user?.name || "N/A"}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Email</span>
              </div>
              <p className="text-sm font-medium">{user?.email || "N/A"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const PasswordResetModal: React.FC<{ userId: string }> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: PasswordFormData = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    if (data.newPassword !== data.confirmPassword) {
      setError("As senhas não correspondem");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/auth/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao actualizar senha");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['profile'] });

      toast({
        title: "Senha actualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      setIsOpen(false);
    } catch (err) {
      console.log(err)
      setError("Erro ao atualizar a senha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Actualizar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Palavra-passe</DialogTitle>
          <DialogDescription>Digite sua senha actual e a nova senha para atualizar</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input id="newPassword" name="newPassword" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Actualizando..." : "Actualizar Senha"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// const ProfileUpdateModal: React.FC<{ user: SafeUserType }> = ({ user }) => {
const ProfileUpdateModal: React.FC<{ user: SafeUserType; }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: ProfileFormData = {
      name: formData.get("name") as string || user.name || "",
    };

    if (!data.name.trim()) {
      setError("Nome é obrigatório");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/auth/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, name: data.name }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao actualizar perfil");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['profile'] });

      toast({
        title: "Perfil actualizado",
        description: "Suas informações foram actualizadas com sucesso.",
      });

      setIsOpen(false);
    } catch (err) {
      console.log(err)
      setError("Erro ao atualizar o perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Editar o Perfil</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Actualizar Perfil</DialogTitle>
          <DialogDescription>Actualize suas informações de perfil</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" defaultValue={user?.name || ""} required />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Actualizando..." : "Actualizar Perfil"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const UserActivity: React.FC<{ userId: string | undefined }> = ({ userId }) => {
  // Fetch user activity statistics
  const { data, isLoading, error } = useQuery<UserActivityStats>({
    queryKey: ["user-activity", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/activity`);
      if (!response.ok) throw new Error("Failed to fetch user activity");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="animate-pulse bg-muted h-6 w-48 rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-64 animate-pulse bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>Falha ao carregar dados da sua actividade.</AlertDescription>
      </Alert>
    );
  }

  // Define colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Registados</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEquipmentRegistered}</div>
            <p className="text-xs text-muted-foreground">
              Equipamentos registados por si
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Tipos Diferentes</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.equipmentByType.length}</div>
            <p className="text-xs text-muted-foreground">
              Categorias de equipamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Localizações</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.equipmentByLocation.length}</div>
            <p className="text-xs text-muted-foreground">
              Departamentos/Sectores diferentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipment by Type Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Equipamentos por Tipo</CardTitle>
            <CardDescription>Distribuição dos diferentes tipos de equipamentos registados</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={data.equipmentByType}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="type"
                  label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.equipmentByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} equipamentos`, 'Quantidade']} />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Equipment by Location Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Equipamentos por Localização</CardTitle>
            <CardDescription>Distribuição dos equipamentos por departamento</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={data.equipmentByLocation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} equipamentos`, 'Quantidade']} />
                <Bar dataKey="count" fill="#8884d8" name="Equipamentos">
                  {data.equipmentByLocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Equipment Registration Timeline */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Histórico de Registos</CardTitle>
            <CardDescription>Quantidade de equipamentos registados por mês</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={data.equipmentByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} equipamentos`, 'Quantidade']} />
                <Bar dataKey="count" fill="#0088FE" name="Equipamentos" />
              </ReBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      

      {/* Detailed Records Section */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Equipamentos Registados - Detalhes</CardTitle>
          <CardDescription>Lista dos equipamentos registados por si</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="by-type" className="space-y-4">
            <TabsList>
              <TabsTrigger value="by-type">Por Tipo</TabsTrigger>
              <TabsTrigger value="by-location">Por Localização</TabsTrigger>
              <TabsTrigger value="by-date">Cronologia</TabsTrigger>
            </TabsList>

            <TabsContent value="by-type">
              {data.equipmentByType.length > 0 ? (
                <div className="space-y-4">
                  {data.equipmentByType.map(typeGroup => (
                    <div key={typeGroup.type} className="border rounded-lg p-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        {typeGroup.type} ({typeGroup.count})
                      </h3>
                      <Separator className="my-2" />
                      <div className="overflow-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-sm text-muted-foreground">
                              <th className="text-left p-2">Modelo</th>
                              <th className="text-left p-2">Nº Série</th>
                              <th className="text-left p-2">Departamento</th>
                              <th className="text-left p-2">Data Registo</th>
                              <th className="text-left p-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.equipmentDetails
                              .filter(item => item.type === typeGroup.type)
                              .map(item => (
                                <tr key={item.id}>
                                  <td className="p-2">{item.brand} {item.model}</td>
                                  <td className="p-2">{item.serial_number || "N/A"}</td>
                                  <td className="p-2">{item.department_name || "N/A"}</td>
                                  <td className="p-2">{new Date(item.created_at).toLocaleDateString()}</td>
                                  <td className="p-2">
                                    <Button variant="link" asChild size="sm">
                                      <Link href={`/equipments/${item.id}`}>Ver</Link>
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  Nenhum equipamento registado
                </div>
              )}
            </TabsContent>

            <TabsContent value="by-location">
              {data.equipmentByLocation.length > 0 ? (
                <div className="space-y-4">
                  {data.equipmentByLocation.map(locGroup => (
                    <div key={locGroup.location} className="border rounded-lg p-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {locGroup.location} ({locGroup.count})
                      </h3>
                      <Separator className="my-2" />
                      <div className="overflow-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-sm text-muted-foreground">
                              <th className="text-left p-2">Tipo</th>
                              <th className="text-left p-2">Modelo</th>
                              <th className="text-left p-2">Nº Série</th>
                              <th className="text-left p-2">Data Registo</th>
                              <th className="text-left p-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.equipmentDetails
                              .filter(item => item.location === locGroup.location)
                              .map(item => (
                                <tr key={item.id}>
                                  <td className="p-2">{item.type}</td>
                                  <td className="p-2">{item.brand} {item.model}</td>
                                  <td className="p-2">{item.serial_number || "N/A"}</td>
                                  <td className="p-2">{new Date(item.created_at).toLocaleDateString()}</td>
                                  <td className="p-2">
                                    <Button variant="link" asChild size="sm">
                                      <Link href={`/equipments/${item.id}`}>Ver</Link>
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  Nenhum equipamento registado
                </div>
              )}
            </TabsContent>

            <TabsContent value="by-date">
              <div className="space-y-4">
                {data.equipmentByMonth.length > 0 ? (
                  data.equipmentByMonth.map(monthGroup => {
                    // Filter equipment created in this month/year
                    const [month, year] = monthGroup.month.split(' ');
                    const equipmentInMonth = data.equipmentDetails.filter(item => {
                      const date = new Date(item.created_at);
                      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                      return monthNames[date.getMonth()] === month && date.getFullYear().toString() === year;
                    });
                    
                    return (
                      <div key={monthGroup.month} className="border rounded-lg p-4">
                        <h3 className="font-medium flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          {monthGroup.month} ({monthGroup.count})
                        </h3>
                        <Separator className="my-2" />
                        <div className="overflow-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-sm text-muted-foreground">
                                <th className="text-left p-2">Tipo</th>
                                <th className="text-left p-2">Modelo</th>
                                <th className="text-left p-2">Nº Série</th>
                                <th className="text-left p-2">Departamento</th>
                                <th className="text-left p-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {equipmentInMonth.map(item => (
                                <tr key={item.id}>
                                  <td className="p-2">{item.type}</td>
                                  <td className="p-2">{item.brand} {item.model}</td>
                                  <td className="p-2">{item.serial_number || "N/A"}</td>
                                  <td className="p-2">{item.department_name || "N/A"}</td>
                                  <td className="p-2">
                                    <Button variant="link" asChild size="sm">
                                      <Link href={`/equipments/${item.id}`}>Ver</Link>
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    Nenhum equipamento registado
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const ProfilePage = () => {
  const { data: session, status } = useSession();
  // Fetch filter options
  const { data, isLoading: isLoadingUser } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetch(`/api/auth/profile/${session?.user?.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json() as Promise<{ user: SafeUserType }>;
    },
  });


  if (status === "loading") {
    return <ProfileSkeleton />;
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="container mx-auto p-6 max-w-7xl space-y-8">
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>Você precisa estar autenticado para visualizar esta página.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoadingUser) {
    return <ProfileSkeleton />
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={"/api/placeholder/100/100"} alt={data?.user?.name || "User"} />
              <AvatarFallback>{getInitials(data?.user?.name || "User")}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{data?.user?.name || "Anonymous"}</h1>
            </div>
          </div>

          <ProfileUpdateModal user={data?.user as SafeUserType} />
        </div>
        <Separator />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Visão geral
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            A sua Actividade
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Alert>
            <AlertDescription>
              Teu perfil foi atualizado pela última vez em {new Date(data?.user?.updated_at || Date.now()).toLocaleDateString()}
            </AlertDescription>
          </Alert>
          <ProfileOverview user={data?.user as SafeUserType} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Alert>
            <CalendarIcon className="h-4 w-4" />
            <AlertDescription>
              Estatísticas baseadas em dados desde {new Date(data?.user?.created_at || Date.now()).toLocaleDateString()}
            </AlertDescription>
          </Alert>
          <UserActivity userId={data?.user?.id as string} />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Gere suas configurações de segurança</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Alterar palavra-passe</h4>
                    <p className="text-sm text-muted-foreground">Actualize sua palavra-passe regularmente</p>
                  </div>
                  <PasswordResetModal userId={data?.user?.id as string} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      
    </div>
  );
};

export default ProfilePage;