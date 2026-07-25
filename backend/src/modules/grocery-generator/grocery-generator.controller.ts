import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/database/prisma';
import { groceryListService } from '../../services/nutrition/grocery-list.service';
import { z } from 'zod';

const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const customItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().min(0.01),
  unit: z.string().min(1),
  category: z.enum([
    'vegetables', 'fruits', 'grains', 'pulses and legumes', 'dairy',
    'meat and seafood', 'spices and condiments', 'oils', 'beverages',
    'bakery', 'frozen', 'other'
  ]).optional().default('other')
});

const editItemSchema = z.object({
  name: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
  checked: z.boolean().optional()
});

export const groceryGeneratorController = {
  generateList: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const { mealPlanId } = req.body;

    let targetPlanId = mealPlanId;
    if (!targetPlanId) {
      const activePlan = await prisma.mealPlan.findFirst({
        where: { userId, status: 'ACTIVE' }
      });
      if (!activePlan) {
        return res.status(404).json({ success: false, error: 'No active meal plan found to generate groceries' });
      }
      targetPlanId = activePlan.id;
    }

    const list = await groceryListService.generateGroceryList(userId, targetPlanId, false);
    return res.json({ success: true, data: list });
  }),

  getLists: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const lists = await prisma.groceryList.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: lists });
  }),

  getCurrentList: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const list = await groceryListService.getLatestGroceryList(userId);
    return res.json({ success: true, data: list });
  }),

  getListById: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const { groceryListId } = req.params;

    const list = await groceryListService.fetchListDetails(groceryListId, userId);
    if (!list) {
      return res.status(404).json({ success: false, error: 'Grocery list not found' });
    }

    return res.json({ success: true, data: list });
  }),

  regenerateList: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const { groceryListId } = req.params;

    const list = await prisma.groceryList.findUnique({
      where: { id: groceryListId }
    });

    if (!list || list.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Grocery list not found or unauthorized' });
    }

    if (!list.mealPlanId) {
      return res.status(400).json({ success: false, error: 'Cannot regenerate a list not linked to a meal plan' });
    }

    const updated = await groceryListService.generateGroceryList(userId, list.mealPlanId, true);
    return res.json({ success: true, data: updated });
  }),

  addCustomItem: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const { groceryListId } = req.params;
    
    const validated = customItemSchema.parse(req.body);

    const list = await prisma.groceryList.findUnique({
      where: { id: groceryListId }
    });

    if (!list || list.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Grocery list not found or unauthorized' });
    }

    await prisma.groceryItem.create({
      data: {
        groceryListId,
        name: validated.name,
        normalizedName: validated.name.toLowerCase().trim(),
        quantity: validated.quantity,
        unit: validated.unit,
        category: validated.category,
        manuallyAdded: true
      }
    });

    const updatedDetails = await groceryListService.fetchListDetails(groceryListId, userId);
    return res.json({ success: true, data: updatedDetails });
  }),

  editItem: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const { itemId } = req.params;
    
    const validated = editItemSchema.parse(req.body);

    const item = await prisma.groceryItem.findUnique({
      where: { id: itemId },
      include: { groceryList: true }
    });

    if (!item || item.groceryList.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Grocery item not found or unauthorized' });
    }

    await prisma.groceryItem.update({
      where: { id: itemId },
      data: {
        name: validated.name,
        normalizedName: validated.name ? validated.name.toLowerCase().trim() : undefined,
        quantity: validated.quantity,
        unit: validated.unit,
        category: validated.category,
        checked: validated.checked
      }
    });

    const updatedDetails = await groceryListService.fetchListDetails(item.groceryListId, userId);
    return res.json({ success: true, data: updatedDetails });
  }),

  toggleItem: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const { itemId } = req.params;

    const item = await prisma.groceryItem.findUnique({
      where: { id: itemId },
      include: { groceryList: true }
    });

    if (!item || item.groceryList.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Grocery item not found or unauthorized' });
    }

    await prisma.groceryItem.update({
      where: { id: itemId },
      data: { checked: !item.checked }
    });

    const updatedDetails = await groceryListService.fetchListDetails(item.groceryListId, userId);
    return res.json({ success: true, data: updatedDetails });
  }),

  deleteItem: asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const userId = (req as any).user.userId;
    const { itemId } = req.params;

    const item = await prisma.groceryItem.findUnique({
      where: { id: itemId },
      include: { groceryList: true }
    });

    if (!item || item.groceryList.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Grocery item not found or unauthorized' });
    }

    await prisma.groceryItem.delete({
      where: { id: itemId }
    });

    const updatedDetails = await groceryListService.fetchListDetails(item.groceryListId, userId);
    return res.json({ success: true, data: updatedDetails });
  })
};
