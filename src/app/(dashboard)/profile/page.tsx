"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials } from "@/lib/utils";
import { SafeUserType } from "@/types";
import {
  Bell,
  Mail,
  Shield,
  UserIcon
} from "lucide-react";
import { useSession } from "next-auth/react";
import { MouseEventHandler } from "react";
import ProfileSkeleton from "./loading";

const ProfileHeader = ({
  user,
  onEditClick,
}: {
  user: SafeUserType;
  onEditClick: MouseEventHandler<HTMLButtonElement>;
}) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user?.image || "/api/placeholder/100/100"} alt={user.name || "User"} />
          <AvatarFallback>{getInitials(user.name || "User")}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{user.name || "Anonymous"}</h1>
        </div>
      </div>
      <Button onClick={onEditClick}>Editar o Perfil</Button>
    </div>
    <Separator />
  </div>
);

const ProfileOverview = ({ user }: { user: SafeUserType }) => (
  <Card>
    <CardHeader>
      <CardTitle>Visão Geral</CardTitle>
      <CardDescription>Tua informação básica</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{user.email || "N/A"}</span>
        </div>
        {/* Add more fields as needed */}
      </div>
    </CardContent>
  </Card>
);

const SecuritySettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Segurança</CardTitle>
      <CardDescription>Gerencie suas configurações de segurança</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-4">
        <Separator />
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">Alterar palavra-passe</h4>
            <p className="text-sm text-muted-foreground">
              Actualize sua palavra-passe regularmente
            </p>
          </div>
          <Button variant="outline">Atualizar</Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const NotificationSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Notificações</CardTitle>
      <CardDescription>Gerencie suas preferências de notificação</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[
          "Email notifications",
          "Browser notifications",
          "Mobile notifications",
        ].map((item) => (
          <div key={item} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{item}</Label>
              <div className="text-sm text-muted-foreground">
                Receive notifications about important updates
              </div>
            </div>
            <Switch />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ProfilePage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <ProfileSkeleton />;
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          Você precisa estar autenticado para visualizar esta página.
        </AlertDescription>
      </Alert>
      </div>
    );
  }

  const user = session.user as SafeUserType;

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <ProfileHeader user={user} onEditClick={() => {}} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Visão geral
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Alert>
            <AlertDescription>
              Teu perfil foi atualizado pela última vez em{" "}
              {new Date(user?.updated_at || Date.now()).toLocaleDateString()}
            </AlertDescription>
          </Alert>
          <ProfileOverview user={user} />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;