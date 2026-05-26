import { Router } from 'express';
import * as payoutController from './payouts.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { idempotency } from '../../middleware/idempotency.js';

const router = Router();

router.post('/', authenticate, idempotency, payoutController.createPayout);
router.get('/', authenticate, payoutController.getPayouts);

export default router;
