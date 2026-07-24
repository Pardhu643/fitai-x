import { Router } from 'express';
import { coachController } from './coach.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

export const coachRoutes = Router();

coachRoutes.use(authenticate);
coachRoutes.post('/chat', coachController.chat);
coachRoutes.get('/status', coachController.status);
