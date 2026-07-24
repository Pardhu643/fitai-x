import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();

router.get('/', authenticate, dashboardController.getDashboard);

export { router as dashboardRoutes };
