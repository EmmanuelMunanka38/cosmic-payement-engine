import { Router } from 'express';
import * as rateController from './rates.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { getQuoteSchema } from './rates.validation.js';

const router = Router();

router.get('/', rateController.getAllRates);
router.get('/:from/:to', rateController.getPairRate);
router.post('/quote', authenticate, validate(getQuoteSchema), rateController.getQuote);

export default router;
