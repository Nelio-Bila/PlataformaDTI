// // src/components/notifications/notification-list.tsx
// "use client";

// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";
// import { NotificationService } from "@/lib/notifications";
// import { Notification } from "@prisma/client";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { Bell, CheckCircle, Loader2 } from "lucide-react";
// import { useSession } from "next-auth/react";

// export function NotificationList() {
//   const { data: session } = useSession();
//   const { toast } = useToast();

//   const { data: notifications, isLoading, refetch } = useQuery({
//     queryKey: ["notifications", session?.user?.id],
//     queryFn: () => NotificationService.getUnreadNotifications(session!.user!.id, "User"),
//     enabled: !!session?.user?.id,
//   });

//   const markAsReadMutation = useMutation({
//     mutationFn: (notificationId: string) => NotificationService.markAsRead(notificationId),
//     onSuccess: () => {
//       refetch();
//       toast({ title: "Notificação marcadada como lida" });
//     },
//   });

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center p-4">
//         <Loader2 className="h-6 w-6 animate-spin" />
//       </div>
//     );
//   }

//   if (!notifications || notifications.length === 0) {
//     return (
//       <div className="p-4 text-center text-gray-500">
//         Sem notificações não lidas
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 p-4">
//       <h2 className="text-lg font-semibold flex items-center gap-2">
//         <Bell className="h-5 w-5" /> Notifications
//       </h2>
//       {notifications.map((notification: Notification) => (
//         <div
//           key={notification.id}
//           className="flex items-start justify-between p-3 bg-gray-100 rounded-md"
//         >
//           <div>
//             <p className="font-medium">{notification?.data?.message as string}</p>
//             <p className="text-sm text-gray-500">
//               {new Date(notification.created_at).toLocaleString()}
//             </p>
//           </div>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => markAsReadMutation.mutate(notification.id)}
//             disabled={markAsReadMutation.isPending}
//           >
//             <CheckCircle className="h-4 w-4" />
//           </Button>
//         </div>
//       ))}
//     </div>
//   );
// }



// src/components/notifications/notification-list.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Notification, NotificationService } from "@/lib/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bell, CheckCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export function NotificationList() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ["notifications", session?.user?.id],
    queryFn: () => NotificationService.getUnreadNotifications(session!.user!.id, "User"),
    enabled: !!session?.user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => NotificationService.markAsRead(notificationId),
    onSuccess: () => {
      refetch();
      toast({ title: "Notificação marcada como lida" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Sem notificações não lidas
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Bell className="h-5 w-5" /> Notifications
      </h2>
      {notifications.map((notification: Notification) => (
        <div
          key={notification.id}
          className="flex items-start justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md"
        >
          <div>
            <p className="font-medium">{notification.data.message}</p>
            <p className="text-sm text-gray-500">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAsReadMutation.mutate(notification.id)}
            disabled={markAsReadMutation.isPending}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}