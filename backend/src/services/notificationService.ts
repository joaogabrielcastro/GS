/**
 * NotificationService — lógica de negócio de notificações separada do controller.
 */

import { prisma } from "../lib/prisma";

export const notificationService = {
  async listForUser(userId: string, onlyUnread = true) {
    const where: any = { userId };
    if (onlyUnread) where.read = false;

    const rows = await prisma.notificationUser.findMany({
      where,
      include: { notification: true },
      orderBy: { notification: { createdAt: "desc" } },
      take: 50,
    });

    return rows.map((n) => ({
      userNotificationId: n.id,
      notificationId: n.notification.id,
      title: n.notification.title,
      message: n.notification.message,
      createdAt: n.notification.createdAt,
      read: n.read,
      occurrenceId: n.notification.occurrenceId,
    }));
  },

  async markAsRead(userNotificationId: string, userId: string) {
    return prisma.notificationUser.update({
      where: { id: userNotificationId, userId },
      data: { read: true, readAt: new Date() },
    });
  },

  async markAllAsReadForUser(userId: string) {
    return prisma.notificationUser.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  },

  async countUnread(userId: string) {
    return prisma.notificationUser.count({
      where: { userId, read: false },
    });
  },

  /**
   * Cria uma notificação e a envia para os usuários pelos roles informados.
   */
  async broadcastToRoles(
    payload: { title: string; message: string; occurrenceId?: string },
    roles: string[],
  ) {
    const users = await prisma.user.findMany({
      where: { role: { in: roles as any[] }, active: true },
      select: { id: true },
    });

    if (users.length === 0) return null;

    return prisma.notification.create({
      data: {
        title: payload.title,
        message: payload.message,
        occurrenceId: payload.occurrenceId,
        users: {
          create: users.map((u) => ({ userId: u.id })),
        },
      },
      include: { users: true },
    });
  },
};
