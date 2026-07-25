import { Router } from 'express';
import { recommendationsController } from './recommendations.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();

// All recommendation routes require authentication
router.use(authenticate);

router.post('/progressive-overload', recommendationsController.generateProgressiveOverload);
router.post('/deload', recommendationsController.generateDeload);
router.get('/pending', recommendationsController.getPendingRecommendations);
router.get('/history', recommendationsController.getAllRecommendations);
router.get('/:id', recommendationsController.getRecommendationById);
router.post('/:id/apply', recommendationsController.applyRecommendation);
router.post('/:id/dismiss', recommendationsController.dismissRecommendation);

export const recommendationsRoutes = router;
