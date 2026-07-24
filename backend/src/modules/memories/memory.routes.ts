import { Router } from 'express';
import { memoryController } from './memory.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

export const memoryRoutes = Router();

memoryRoutes.use(authenticate);
memoryRoutes.get('/', memoryController.getMemories);
memoryRoutes.post('/', memoryController.createMemory);
memoryRoutes.put('/:id', memoryController.updateMemory);
memoryRoutes.delete('/:id', memoryController.deleteMemory);
