import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const notificationController = {
  async list(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const notifications = await prisma.notificationUser.findMany({
        where: {
          userId,
          read: false, // Default to showing only unread, or we can make this optional
        },
        include: {
          notification: true,
        },
        orderBy: {
          notification: {
            createdAt: "desc",
          },
        },
      });

      // Flatten the response structure for the frontend
      const formatted = notifications.map((n) => ({
        id: n.notification.id, // Use the notification ID, or the relation ID? Usually the relation ID is for tracking read status.
        // Actually, let's return the NotificationUser ID so we can mark IT as read.
        notificationId: n.notification.id,
        userNotificationId: n.id,
        title: n.notification.title,
        message: n.notification.message,
        createdAt: n.notification.createdAt,
        read: n.read,
        occurrenceId: n.notification.occurrenceId,
      }));

      return res.json(formatted);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar notificações" });
    }
  },

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params; // This is the NotificationUser ID
      const userId = req.user?.id;

      await prisma.notificationUser.update({
        where: {
          id,
          userId, // Ensure ownership
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return res.json({ success: true });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao marcar notificação como lida" });
    }
  },

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      await prisma.notificationUser.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao marcar todas como lidas" });
    }
  },
};
