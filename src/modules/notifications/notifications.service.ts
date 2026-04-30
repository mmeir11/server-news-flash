import { Injectable } from '@nestjs/common';
import { presentNotification } from '../../common/presenters/newsflash-presenters';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(user: AuthenticatedUser, unreadOnly?: boolean) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId: user.id, isRead: unreadOnly ? false : undefined },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = await this.prisma.notification.count({ where: { userId: user.id, isRead: false } });

    return { notifications: notifications.map(presentNotification), total: notifications.length, unread_count: unreadCount };
  }

  async markRead(user: AuthenticatedUser, id: string) {
    await this.prisma.notification.updateMany({ where: { id, userId: user.id }, data: { isRead: true } });
    const notification = await this.prisma.notification.findUniqueOrThrow({ where: { id } });

    return presentNotification(notification);
  }

  async markAllRead(user: AuthenticatedUser) {
    const result = await this.prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    return { updated_count: result.count };
  }
}