import { Router } from 'express';
import { groceryGeneratorController } from './grocery-generator.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

export const groceryGeneratorRoutes = Router();

// Apply auth to all endpoints
groceryGeneratorRoutes.use(authenticate);

groceryGeneratorRoutes.post('/grocery-lists/generate', groceryGeneratorController.generateList);
groceryGeneratorRoutes.get('/grocery-lists', groceryGeneratorController.getLists);
groceryGeneratorRoutes.get('/grocery-lists/current', groceryGeneratorController.getCurrentList);
groceryGeneratorRoutes.get('/grocery-lists/:groceryListId', groceryGeneratorController.getListById);
groceryGeneratorRoutes.post('/grocery-lists/:groceryListId/regenerate', groceryGeneratorController.regenerateList);
groceryGeneratorRoutes.post('/grocery-lists/:groceryListId/items', groceryGeneratorController.addCustomItem);

groceryGeneratorRoutes.put('/grocery-items/:itemId', groceryGeneratorController.editItem);
groceryGeneratorRoutes.patch('/grocery-items/:itemId/toggle', groceryGeneratorController.toggleItem);
groceryGeneratorRoutes.delete('/grocery-items/:itemId', groceryGeneratorController.deleteItem);
