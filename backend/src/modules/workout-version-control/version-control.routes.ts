import { Router } from 'express';
import { versionControlController } from './version-control.controller';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();

router.get('/:id/versions', authenticate, versionControlController.getVersions);
router.get('/:id/versions/:version', authenticate, versionControlController.getVersionSnapshot);
router.post('/:id/rollback', authenticate, versionControlController.rollback);

export { router as versionControlRoutes };
