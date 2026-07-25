import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);
notificationRoutes.get('/', notificationController.getNotifications);
notificationRoutes.get('/unread-count', notificationController.getUnreadCount);
notificationRoutes.post('/', notificationController.createNotification);
notificationRoutes.put('/read-all', notificationController.markAllAsRead);
notificationRoutes.put('/:id/read', notificationController.markAsRead);
