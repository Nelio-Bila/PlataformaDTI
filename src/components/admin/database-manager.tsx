"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function DatabaseManager() {
  const { toast } = useToast();
  const [isRestoring, setIsRestoring] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [pgDumpAvailable, setPgDumpAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkForPgDump = async () => {
      try {
        const response = await fetch("/api/database/check-pg-tools");
        const data = await response.json();
        setPgDumpAvailable(data.available);
      } catch (/* eslint-disable-next-line @typescript-eslint/no-unused-vars */e) {
        setPgDumpAvailable(false);
      }
    };
    
    checkForPgDump();
  }, []);

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      const response = await fetch("/api/database/backup", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao criar backup");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Get current date for filename
      const date = new Date().toISOString().split("T")[0];
      a.download = `it-tracker-backup-${date}.dump`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Backup Criado",
        description: "O backup da sua base de dados foi criado com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Backup error:", error);
      toast({
        title: "Falha no Backup",
        description: error instanceof Error ? error.message : "Falha ao criar backup da base de dados",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!backupFile) {
      toast({
        title: "Nenhum Ficheiro Seleccionado",
        description: "Por favor, seleccione um ficheiro de backup para restaurar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRestoring(true);
      const formData = new FormData();
      formData.append("backup", backupFile);

      const response = await fetch("/api/database/restore", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao restaurar a base de dados");
      }

      toast({
        title: "Base de Dados Restaurada",
        description: "A sua base de dados foi restaurada com sucesso.",
        variant: "success",
      });
      
      // Reset the file input
      setBackupFile(null);
      
      // Reload the page after a short delay to reflect the changes
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Restore error:", error);
      toast({
        title: "Falha na Restauração",
        description: error instanceof Error ? error.message : "Falha ao restaurar a base de dados",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestão de Base de Dados</CardTitle>
        <CardDescription>
          Crie cópias de segurança da base de dados ou restaure a partir de backups existentes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {pgDumpAvailable === false && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ferramentas PostgreSQL Não Encontradas</AlertTitle>
            <AlertDescription>
              <p>Para activar a funcionalidade completa de backup e restauro da base de dados, precisa instalar as ferramentas de linha de comando PostgreSQL.</p>
              <h4 className="font-semibold mt-2">Instruções de Instalação:</h4>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Descarregue e instale o PostgreSQL a partir de <a href="https://www.postgresql.org/download/" target="_blank" rel="noopener noreferrer" className="underline">postgresql.org</a></li>
                <li>Certifique-se de seleccionar "Ferramentas de Linha de Comando" durante a instalação</li>
                <li>Após a instalação, reinicie a aplicação</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Cópia de Segurança</h3>
          <p className="text-sm text-muted-foreground">
            Crie um ficheiro de backup do estado actual da base de dados.
          </p>
          <Button 
            onClick={handleBackup}
            disabled={isBackingUp}
            className="w-full sm:w-auto"
          >
            {isBackingUp ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A criar backup...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descarregar Backup
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Restaurar Base de Dados</h3>
          <p className="text-sm text-muted-foreground">
            Restaure a base de dados a partir de um ficheiro de backup. Isto irá substituir os dados actuais.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="file"
              accept=".dump,.backup,.sql"
              onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
              className="flex-1"
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto"
                  disabled={!backupFile || isRestoring}
                >
                  {isRestoring ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A restaurar...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Restaurar Base de Dados
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <p>
                      Tem certeza que deseja restaurar a base de dados a partir do backup &quot;{backupFile?.name}&quot;? 
                      Esta ação não pode ser desfeita.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRestore} className="bg-destructive text-destructive-foreground">
                    Sim, Restaurar Base de Dados
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 text-sm text-muted-foreground">
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>Backups regulares são recomendados para prevenir a perda de dados.</span>
        </div>
      </CardFooter>
    </Card>
  );
}