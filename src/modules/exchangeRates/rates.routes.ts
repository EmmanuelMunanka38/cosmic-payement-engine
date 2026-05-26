import { Router } from 'express';
import * as rateController from './rates.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/', rateController.getAllRates);
router.get('/:from/:to', rateController.getPairRate);
router.post('/quote', authenticate, rateController.getQuote);

export default router;
