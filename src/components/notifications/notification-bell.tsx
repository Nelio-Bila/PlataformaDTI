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
import { NotificationService } from "@/lib/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bell, CheckCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export function NotificationBell() {
  const { data: session } = useSession();
  const { toast } = useToast();

  // Fetch unread notifications
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ["notifications", session?.user?.id],
    queryFn: () =>
      NotificationService.getUnreadNotifications(session!.user!.id, "User"),
    enabled: !!session?.user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds (optional)
  });

  // Mutation to mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      NotificationService.markAsRead(notificationId),
    onSuccess: () => {
      refetch();
      toast({ title: "Notification marked as read" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  // Mutation to mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      NotificationService.markAllAsRead(session!.user!.id, "User"),
    onSuccess: () => {
      refetch();
      toast({ title: "All notifications marked as read" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    },
  });

  const unreadCount = notifications?.length || 0;
  const latestNotification = notifications?.[0]; // Most recent notification

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {isLoading ? (
            <Loader2 className="absolute top-0 right-0 h-3 w-3 animate-spin text-muted-foreground" />
          ) : unreadCount > 0 ? (
            <Badge
              variant="destructive"
              className="absolute top-0 right-0 h-4 w-4 flex items-center justify-center text-xs p-2"
            >
              {unreadCount}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
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
                "Mark all as read"
              )}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <DropdownMenuItem className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </DropdownMenuItem>
        ) : unreadCount === 0 ? (
          <DropdownMenuItem className="text-center text-gray-500">
            No unread notifications
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem className="flex flex-col gap-1">
              <span className="font-medium">
                {latestNotification?.data?.message}
              </span>
              <span className="text-xs text-gray-500">
                {latestNotification &&
                  new Date(latestNotification.created_at).toLocaleString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex justify-start gap-2"
                onClick={() =>
                  markAsReadMutation.mutate(latestNotification!.id)
                }
                disabled={markAsReadMutation.isPending}
              >
                <CheckCircle className="h-4 w-4" />
                Mark as read
              </Button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="w-full text-center">
                View All Notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}