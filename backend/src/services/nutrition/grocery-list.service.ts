import { prisma } from '../../core/database/prisma';

export class GroceryListService {
  async generateGroceryList(userId: string, mealPlanId: string, isRegenerate: boolean = false): Promise<any> {
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      include: {
        days: {
          include: {
            meals: {
              include: {
                ingredients: true
              }
            }
          }
        }
      }
    });

    if (!mealPlan) {
      throw new Error('Meal plan not found');
    }

    // Preserve manually added items from existing list if regenerating
    let preservedCustomItems: any[] = [];
    if (isRegenerate) {
      const existingList = await prisma.groceryList.findFirst({
        where: { userId, mealPlanId, status: 'ACTIVE' },
        include: { items: { where: { manuallyAdded: true } } }
      });
      if (existingList) {
        preservedCustomItems = existingList.items;
      }
    }

    // Extract all ingredients from the meal plan
    const ingredients: any[] = [];
    mealPlan.days.forEach(day => {
      day.meals.forEach(meal => {
        meal.ingredients.forEach(ing => {
          const scaledQty = ing.quantity * (meal.servings || 1.0);
          ingredients.push({
            name: ing.name,
            quantity: scaledQty,
            unit: ing.unit,
            category: ing.category || 'other'
          });
        });
      });
    });

    // Aggregate quantities by name & unit
    const aggregated: { [key: string]: { name: string; quantity: number; unit: string; category: string } } = {};

    ingredients.forEach(ing => {
      const normName = ing.name.toLowerCase().trim();
      const normUnit = ing.unit.toLowerCase().trim();
      const key = `${normName}_${normUnit}`;

      if (aggregated[key]) {
        aggregated[key].quantity += ing.quantity;
      } else {
        aggregated[key] = {
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          category: ing.category
        };
      }
    });

    const newList = await prisma.$transaction(async (tx) => {
      // Find existing active list
      const existing = await tx.groceryList.findFirst({
        where: { userId, mealPlanId, status: 'ACTIVE' }
      });

      if (existing) {
        // Delete items first
        await tx.groceryItem.deleteMany({
          where: { groceryListId: existing.id }
        });
        await tx.groceryList.delete({
          where: { id: existing.id }
        });
      }

      // Create new Grocery List
      const list = await tx.groceryList.create({
        data: {
          userId,
          mealPlanId,
          title: `Grocery List: ${mealPlan.title}`,
          startDate: mealPlan.startDate,
          endDate: mealPlan.endDate
        }
      });

      // Prepare items list
      const itemsData = Object.values(aggregated).map(item => ({
        groceryListId: list.id,
        name: item.name,
        normalizedName: item.name.toLowerCase().trim(),
        quantity: item.quantity,
        unit: item.unit,
        category: item.category || 'other',
        checked: false,
        manuallyAdded: false
      }));

      // Re-add preserved manual items
      preservedCustomItems.forEach(item => {
        itemsData.push({
          groceryListId: list.id,
          name: item.name,
          normalizedName: item.normalizedName,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          checked: item.checked,
          manuallyAdded: true
        });
      });

      await tx.groceryItem.createMany({
        data: itemsData
      });

      return list;
    });

    return this.fetchListDetails(newList.id, userId);
  }

  async fetchListDetails(listId: string, userId: string) {
    const list = await prisma.groceryList.findUnique({
      where: { id: listId },
      include: { items: true }
    });

    if (!list || list.userId !== userId) return null;

    const total = list.items.length;
    const completed = list.items.filter(i => i.checked).length;
    const remaining = total - completed;

    return {
      ...list,
      totalCount: total,
      completedCount: completed,
      remainingCount: remaining
    };
  }

  async getLatestGroceryList(userId: string): Promise<any> {
    const list = await prisma.groceryList.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });

    if (!list) return null;
    return this.fetchListDetails(list.id, userId);
  }

  async updateAfterMealReplacement(userId: string, mealPlanId: string): Promise<void> {
    await this.generateGroceryList(userId, mealPlanId, true);
  }
}

export const groceryListService = new GroceryListService();
