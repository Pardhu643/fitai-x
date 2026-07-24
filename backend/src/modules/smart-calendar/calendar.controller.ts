import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/database/prisma';

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const calendarController = {
  getEvents: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { start, end } = req.query;
    
    let dateFilter = {};
    if (start && end) {
      dateFilter = {
        startTime: { gte: new Date(start as string) },
        endTime: { lte: new Date(end as string) }
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where: { userId, ...dateFilter },
      orderBy: { startTime: 'asc' }
    });
    return res.json({ data: events });
  }),

  createEvent: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { title, description, type, startTime, endTime, allDay, status, workoutPlanId, workoutDayId, reminderMinutes } = req.body;

    const event = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        description,
        type,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        allDay: allDay || false,
        status: status || 'SCHEDULED',
        workoutPlanId,
        workoutDayId,
        reminderMinutes
      }
    });
    return res.status(201).json({ data: event });
  }),

  updateEvent: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { id } = req.params;
    const { title, description, type, startTime, endTime, allDay, status, workoutPlanId, workoutDayId, reminderMinutes } = req.body;

    const event = await prisma.calendarEvent.findFirst({ where: { id, userId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const updated = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title,
        description,
        type,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        allDay,
        status,
        workoutPlanId,
        workoutDayId,
        reminderMinutes
      }
    });
    return res.json({ data: updated });
  }),

  deleteEvent: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { id } = req.params;

    const event = await prisma.calendarEvent.findFirst({ where: { id, userId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    await prisma.calendarEvent.delete({ where: { id } });
    return res.json({ success: true });
  })
};
