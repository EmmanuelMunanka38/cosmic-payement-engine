import { Router } from 'express';
import * as rateController from './rates.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { getQuoteSchema } from './rates.validation.js';

const router = Router();

/**
 * @openapi
 * /api/v1/rates:
 *   get:
 *     tags: [Exchange Rates]
 *     summary: List all exchange rates
 *     responses:
 *       200:
 *         description: List of rates
 */
router.get('/', rateController.getAllRates);

/**
 * @openapi
 * /api/v1/rates/{from}/{to}:
 *   get:
 *     tags: [Exchange Rates]
 *     summary: Get rate for a currency pair
 *     parameters:
 *       - in: path
 *         name: from
 *         required: true
 *         schema: { type: string, example: USD }
 *       - in: path
 *         name: to
 *         required: true
 *         schema: { type: string, example: KES }
 *     responses:
 *       200:
 *         description: Exchange rate
 */
router.get('/:from/:to', rateController.getPairRate);

/**
 * @openapi
 * /api/v1/rates/quote:
 *   post:
 *     tags: [Exchange Rates]
 *     summary: Get a time-bounded FX quote
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [from, to, amount]
 *             properties:
 *               from: { type: string, example: USD }
 *               to: { type: string, example: KES }
 *               amount: { type: number, example: 100 }
 *     responses:
 *       200:
 *         description: Quote with rate, fee, and destination amount
 */
router.post('/quote', authenticate, validate(getQuoteSchema), rateController.getQuote);

export default router;
