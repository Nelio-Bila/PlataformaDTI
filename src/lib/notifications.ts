// src/lib/notifications.ts
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class NotificationService {
  // Create a notification
  static async createNotification({
    type,
    notifiableId,
    notifiableType,
    data,
  }: {
    type: string;
    notifiableId: string;
    notifiableType: string;
    data: Record<string, any>;
  }) {
    return await db.notification.create({
      data: {
        type,
        notifiable_id: notifiableId,
        notifiable_type: notifiableType,
        data: Prisma.JsonValue.parse(JSON.stringify(data)),
      },
    });
  }

  // Get unread notifications for a specific notifiable (user or group)
  static async getUnreadNotifications(notifiableId: string, notifiableType: string) {
    return await db.notification.findMany({
      where: {
        notifiable_id: notifiableId,
        notifiable_type: notifiableType,
        read_at: null,
      },
      orderBy: { created_at: "desc" },
    });
  }

  // Get all notifications for a specific notifiable
  static async getAllNotifications(notifiableId: string, notifiableType: string) {
    return await db.notification.findMany({
      where: {
        notifiable_id: notifiableId,
        notifiable_type: notifiableType,
      },
      orderBy: { created_at: "desc" },
    });
  }

  // Mark a notification as read
  static async markAsRead(notificationId: string) {
    return await db.notification.update({
      where: { id: notificationId },
      data: { read_at: new Date() },
    });
  }

  // Mark all notifications as read for a notifiable
  static async markAllAsRead(notifiableId: string, notifiableType: string) {
    return await db.notification.updateMany({
      where: {
        notifiable_id: notifiableId,
        notifiable_type: notifiableType,
        read_at: null,
      },
      data: { read_at: new Date() },
    });
  }
}