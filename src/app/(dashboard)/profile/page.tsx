

"use client"
import { update_password, update_profile } from "@/actions/auth-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { getInitials } from '@/lib/utils';
import { SafeUserType } from '@/types';
import { PersonIcon } from "@radix-ui/react-icons";
import { AlertCircle, Mail, Shield, UserIcon } from "lucide-react";
import { useSession } from 'next-auth/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import ProfileSkeleton from './loading';


// Types for form data and server action responses
type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ProfileFormData = {
  name: string;
};

type ServerActionResponse = {
  success: boolean;
  error?: string;
};

interface PasswordResetModalProps {
  userId: string;
}

interface ProfileUpdateModalProps {
  user: SafeUserType;
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
              <p className="text-sm font-medium">{user.name || "N/A"}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Email</span>
              </div>
              <p className="text-sm font-medium">{user.email || "N/A"}</p>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  </div>
);



const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      const result = await update_password(userId, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (!result.success) {
        setError(result.error || "Erro ao atualizar senha");
        return;
      }

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      setIsOpen(false);
    } catch (err) {
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
          <DialogDescription>
            Digite sua senha actual e a nova senha para atualizar
          </DialogDescription>
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
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Actualizando..." : "Actualizar Senha"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    // Clean form data by converting empty strings to null
    const data: ProfileFormData = {
      name: formData.get("name") as string || user.name || "", // Fallback to current name or empty string
    };

    // Validate required name field
    if (!data.name.trim()) {
      setError("Nome é obrigatório");
      setIsLoading(false);
      return;
    }

    try {
      const result = await update_profile(user.email as string, data);

      if (!result.success) {
        setError(result.error || "Erro ao atualizar perfil");
        return;
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      setIsOpen(false);
    } catch (err) {
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
          <DialogDescription>
            Actualize suas informações de perfil
          </DialogDescription>
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
            <Input
              id="name"
              name="name"
              defaultValue={user?.name || ""}
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Actualizando..." : "Actualizar Perfil"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={"/api/placeholder/100/100"} alt={user.name || "User"} />
              <AvatarFallback>{getInitials(user.name || "User")}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{user.name || "Anonymous"}</h1>
            </div>
          </div>
          <ProfileUpdateModal user={user} />
        </div>
        <Separator />
      </div>

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
                  <PasswordResetModal userId={user.id} />
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