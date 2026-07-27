import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/database/prisma';

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const memoryController = {
  getMemories: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const memories = await prisma.aIMemory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ data: { memories } });
  }),

  createMemory: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { content, type, title, summary, source, importance } = req.body;
    
    // Support simple content field from frontend
    const memoryTitle = title || (content ? content.substring(0, 50) : 'Memory');
    const memorySummary = summary || content || '';
    const memoryType = type || 'USER_INPUT';
    
    const memory = await prisma.aIMemory.create({
      data: {
        userId,
        type: memoryType,
        title: memoryTitle,
        summary: memorySummary,
        source: source || 'MANUAL',
        importance: importance || 'NORMAL'
      }
    });
    return res.status(201).json({ data: { memory } });
  }),

  updateMemory: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { id } = req.params;
    const { type, title, summary, source, importance } = req.body;

    const memory = await prisma.aIMemory.findFirst({ where: { id, userId } });
    if (!memory) return res.status(404).json({ error: 'Memory not found' });

    const updated = await prisma.aIMemory.update({
      where: { id },
      data: { type, title, summary, source, importance }
    });
    return res.json({ data: updated });
  }),

  deleteMemory: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { id } = req.params;

    const memory = await prisma.aIMemory.findFirst({ where: { id, userId } });
    if (!memory) return res.status(404).json({ error: 'Memory not found' });

    await prisma.aIMemory.delete({ where: { id } });
    return res.json({ success: true });
  })
};
