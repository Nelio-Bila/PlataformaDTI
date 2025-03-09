"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { SafeUserType } from "@/types";
import { AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import type { FormEvent } from "react";
import { useState } from "react";


interface ProfileUpdateModalProps {
  user: SafeUserType;
  onUserUpdate: (updatedUser: SafeUserType) => void;
}

const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({ user, onUserUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { update: updateSession } = useSession();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    if (!name.trim()) {
      setError("Nome é obrigatório");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/auth/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, name }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao actualizar perfil");
        return;
      }

      // Update session with new user data
      await updateSession({
        ...user,
        name: result.user.name,
      });

      // Update parent component state
      onUserUpdate(result.user);

      toast({
        title: "Perfil actualizado",
        description: "Suas informações foram atualizadas com sucesso.",
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
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar Perfil"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileUpdateModal;