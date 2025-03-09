// src/components/notifications/notification-bell.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bell, CheckCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// Define the notification type based on your schema and database data
interface Notification {
  id: string;
  type: string;
  notifiableId: string;
  notifiableType: string;
  data: {
    requestId: string;
    requestNumber: string;
    requesterName: string;
    message: string;
  };
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function NotificationBell() {
  const { data: session, status } = useSession();
  const { toast } = useToast();



  // Fetch unread notifications via API
  const { data: notifications = [], isLoading, error, refetch } = useQuery<Notification[]>({
    queryKey: ["notifications", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.warn("No user ID available, skipping notification fetch");
        return [];
      }

      const response = await fetch("/api/notifications/unread", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch notifications");
      }

      const result = await response.json();

      if (!result || result.length === 0) {
        console.warn("No notifications found for user:", session.user.id);
      }
      return result;
    },
    enabled: status === "authenticated" && !!session?.user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutation to mark a notification as read (via API)
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/mark-read/${notificationId}`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Notificação marcada como lida" });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao marcar notificação como lida",
        variant: "destructive",
      });
    },
  });

  // Mutation to mark all notifications as read (via API)
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to mark all notifications as read");
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Todas as notificações marcadas como lidas" });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao marcar todas as notificações como lidas",
        variant: "destructive",
      });
    },
  });

  const unreadCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {isLoading ? (
            <Loader2 className="absolute top-1 right-1 h-3 w-3 animate-spin text-muted-foreground" />
          ) : unreadCount > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs p-2"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Marcar todas como lidas"
              )}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <DropdownMenuItem className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </DropdownMenuItem>
        ) : error ? (
          <DropdownMenuItem className="text-center text-red-500">
            Erro ao carregar notificações: {error.message}
          </DropdownMenuItem>
        ) : unreadCount === 0 ? (
          <DropdownMenuItem className="text-center text-gray-500">
            Nenhuma notificação não lida
          </DropdownMenuItem>
        ) : (
          <>
            {notifications.slice(0, 3).map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col gap-1">
                <Link
                  href={`/requests/${notification.data.requestId}`}
                  className="font-medium hover:underline"
                >
                  {notification.data.message}
                </Link>
                <span className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString("pt-BR")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full flex justify-start gap-2"
                  onClick={() => markAsReadMutation.mutate(notification.id)}
                  disabled={markAsReadMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4" />
                  Marcar como lida
                </Button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="w-full text-center">
                Ver Todas as Notificações
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}