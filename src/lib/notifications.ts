// src/lib/notifications.ts
import { db } from "@/lib/db";

// Define the notification type to match what the client expects
export interface Notification {
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

export class NotificationService {
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
  }): Promise<Notification> {
    const notification = await db.notification.create({
      data: {
        type,
        notifiable_id: notifiableId,
        notifiable_type: notifiableType,
        data,
      },
    });

    // Transform the Prisma response to match the Notification interface
    return {
      id: notification.id,
      type: notification.type,
      notifiableId: notification.notifiable_id,
      notifiableType: notification.notifiable_type,
      data: notification.data as Notification["data"],
      readAt: notification.read_at ? notification.read_at.toISOString() : null,
      createdAt: notification.created_at.toISOString(),
      updatedAt: notification.updated_at.toISOString(),
    };
  }

  static async getUnreadNotifications(notifiableId: string, notifiableType: string): Promise<Notification[]> {

    const notifications = await db.notification.findMany({
      where: {
        notifiable_id: notifiableId,
        notifiable_type: notifiableType,
        read_at: null,
      },
      orderBy: { created_at: "desc" },
    });

    // Transform the Prisma response to match the Notification interface
    return notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      notifiableId: notification.notifiable_id,
      notifiableType: notification.notifiable_type,
      data: notification.data as Notification["data"],
      readAt: notification.read_at ? notification.read_at.toISOString() : null,
      createdAt: notification.created_at.toISOString(),
      updatedAt: notification.updated_at.toISOString(),
    }));
  }

  static async getAllNotifications(notifiableId: string, notifiableType: string): Promise<Notification[]> {
    const notifications = await db.notification.findMany({
      where: {
        notifiable_id: notifiableId,
        notifiable_type: notifiableType,
      },
      orderBy: { created_at: "desc" },
    });

    return notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      notifiableId: notification.notifiable_id,
      notifiableType: notification.notifiable_type,
      data: notification.data as Notification["data"],
      readAt: notification.read_at ? notification.read_at.toISOString() : null,
      createdAt: notification.created_at.toISOString(),
      updatedAt: notification.updated_at.toISOString(),
    }));
  }

  static async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await db.notification.update({
      where: { id: notificationId },
      data: { read_at: new Date() },
    });

    return {
      id: notification.id,
      type: notification.type,
      notifiableId: notification.notifiable_id,
      notifiableType: notification.notifiable_type,
      data: notification.data as Notification["data"],
      readAt: notification.read_at ? notification.read_at.toISOString() : null,
      createdAt: notification.created_at.toISOString(),
      updatedAt: notification.updated_at.toISOString(),
    };
  }

  static async markAllAsRead(notifiableId: string, notifiableType: string): Promise<{ count: number }> {
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