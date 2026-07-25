import api from '../lib/api';

export interface GroceryItem {
  id: string;
  groceryListId: string;
  name: string;
  normalizedName: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
  manuallyAdded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroceryList {
  id: string;
  userId: string;
  mealPlanId: string | null;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  items: GroceryItem[];
  totalCount: number;
  completedCount: number;
  remainingCount: number;
}

export const groceryService = {
  getCurrentList: async (): Promise<GroceryList | null> => {
    const response = await api.get('/api/v1/grocery-lists/current');
    return response.data.data;
  },
  generateList: async (mealPlanId?: string): Promise<GroceryList> => {
    const response = await api.post('/api/v1/grocery-lists/generate', { mealPlanId });
    return response.data.data;
  },
  getListById: async (groceryListId: string): Promise<GroceryList> => {
    const response = await api.get(`/api/v1/grocery-lists/${groceryListId}`);
    return response.data.data;
  },
  regenerateList: async (groceryListId: string): Promise<GroceryList> => {
    const response = await api.post(`/api/v1/grocery-lists/${groceryListId}/regenerate`);
    return response.data.data;
  },
  addCustomItem: async (groceryListId: string, data: { name: string; quantity: number; unit: string; category?: string }): Promise<GroceryList> => {
    const response = await api.post(`/api/v1/grocery-lists/${groceryListId}/items`, data);
    return response.data.data;
  },
  editItem: async (itemId: string, data: Partial<GroceryItem>): Promise<GroceryList> => {
    const response = await api.put(`/api/v1/grocery-items/${itemId}`, data);
    return response.data.data;
  },
  toggleItem: async (itemId: string): Promise<GroceryList> => {
    const response = await api.patch(`/api/v1/grocery-items/${itemId}/toggle`);
    return response.data.data;
  },
  deleteItem: async (itemId: string): Promise<GroceryList> => {
    const response = await api.delete(`/api/v1/grocery-items/${itemId}`);
    return response.data.data;
  }
};
export default groceryService;
