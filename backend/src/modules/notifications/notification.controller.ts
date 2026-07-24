import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/database/prisma';

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const notificationController = {
  getNotifications: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ data: notifications });
  }),

  getUnreadCount: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const count = await prisma.notification.count({
      where: { userId, read: false }
    });
    return res.json({ count });
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { id } = req.params;
    
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true, readAt: new Date() }
    });
    
    return res.json({ success: true });
  }),

  markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() }
    });
    
    return res.json({ success: true });
  })
};
