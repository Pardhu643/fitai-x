import { Router } from 'express';
import { calendarController } from './calendar.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

export const calendarRoutes = Router();

calendarRoutes.use(authenticate);
calendarRoutes.get('/', calendarController.getEvents);
calendarRoutes.post('/', calendarController.createEvent);
calendarRoutes.put('/:id', calendarController.updateEvent);
calendarRoutes.delete('/:id', calendarController.deleteEvent);
