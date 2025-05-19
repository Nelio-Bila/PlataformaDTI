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
import { Download, Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
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
      } catch (error) {
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
        throw new Error(error.message || "Failed to create backup");
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
        title: "Backup Created",
        description: "Your database backup was created successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error("Backup error:", error);
      toast({
        title: "Backup Failed",
        description: error instanceof Error ? error.message : "Failed to create database backup",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!backupFile) {
      toast({
        title: "No File Selected",
        description: "Please select a backup file to restore.",
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
        throw new Error(error.message || "Failed to restore database");
      }

      toast({
        title: "Database Restored",
        description: "Your database has been successfully restored.",
        variant: "success",
      });
      
      // Reset the file input
      setBackupFile(null);
      
      // Reload the page after a short delay to reflect the changes
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Restore error:", error);
      toast({
        title: "Restore Failed",
        description: error instanceof Error ? error.message : "Failed to restore database",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Database Management</CardTitle>
        <CardDescription>
          Create backups of your database or restore from existing backups.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {pgDumpAvailable === false && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>PostgreSQL Tools Not Found</AlertTitle>
            <AlertDescription>
              <p>To enable full database backup and restore functionality, you need to install PostgreSQL command-line tools.</p>
              <h4 className="font-semibold mt-2">Installation Instructions:</h4>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Download and install PostgreSQL from <a href="https://www.postgresql.org/download/" target="_blank" rel="noopener noreferrer" className="underline">postgresql.org</a></li>
                <li>Make sure to select "Command Line Tools" during installation</li>
                <li>After installation, restart your application</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Database Backup</h3>
          <p className="text-sm text-muted-foreground">
            Create a backup file of your current database state.
          </p>
          <Button 
            onClick={handleBackup}
            disabled={isBackingUp}
            className="w-full sm:w-auto"
          >
            {isBackingUp ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Backup...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Backup
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Database Restore</h3>
          <p className="text-sm text-muted-foreground">
            Restore your database from a backup file. This will overwrite current data.
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
                      Restoring...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Restore Database
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will overwrite your current database with the backup file.
                    All current data not included in the backup will be lost.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRestore} className="bg-destructive text-destructive-foreground">
                    Yes, Restore Database
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
          <span>Regular backups are recommended to prevent data loss.</span>
        </div>
      </CardFooter>
    </Card>
  );
}