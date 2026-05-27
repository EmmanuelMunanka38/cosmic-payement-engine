import { Router } from 'express';
import * as transactionController from './transactions.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { idempotency } from '../../middleware/idempotency.js';
import { validate } from '../../middleware/validate.js';
import {
  sendSchema,
  crossBorderSchema,
  payInSchema,
  payOutSchema,
} from './transactions.validation.js';

const router = Router();

/**
 * @openapi
 * /api/v1/transactions/send:
 *   post:
 *     tags: [Transactions]
 *     summary: Send money to another internal user
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, currency]
 *             properties:
 *               recipientEmail: { type: string, example: user@cosmic-payment.dev }
 *               recipientPhone: { type: string }
 *               amount: { type: number, example: 100 }
 *               currency: { type: string, example: KES }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Transfer successful
 *       400:
 *         description: Insufficient balance or validation error
 */
router.post(
  '/send',
  authenticate,
  idempotency,
  validate(sendSchema),
  transactionController.sendInternal,
);

/**
 * @openapi
 * /api/v1/transactions/cross-border:
 *   post:
 *     tags: [Transactions]
 *     summary: Send money across currencies
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientPhone, recipientProvider, sourceCurrency, destinationCurrency, sourceAmount]
 *             properties:
 *               recipientPhone: { type: string, example: "+254712345678" }
 *               recipientProvider: { type: string, example: MPESA }
 *               recipientName: { type: string }
 *               sourceCurrency: { type: string, example: USD }
 *               destinationCurrency: { type: string, example: KES }
 *               sourceAmount: { type: number, example: 50 }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Cross-border transfer initiated
 */
router.post(
  '/cross-border',
  authenticate,
  idempotency,
  validate(crossBorderSchema),
  transactionController.crossBorderSend,
);

/**
 * @openapi
 * /api/v1/transactions/pay-in:
 *   post:
 *     tags: [Transactions]
 *     summary: Top up wallet (pay in)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, currency]
 *             properties:
 *               amount: { type: number, example: 100 }
 *               currency: { type: string, example: USD }
 *     responses:
 *       200:
 *         description: Pay-in initiated
 */
router.post(
  '/pay-in',
  authenticate,
  idempotency,
  validate(payInSchema),
  transactionController.payIn,
);

/**
 * @openapi
 * /api/v1/transactions/pay-out:
 *   post:
 *     tags: [Transactions]
 *     summary: Withdraw money from wallet (pay out)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, currency, recipientPhone, recipientProvider]
 *             properties:
 *               amount: { type: number, example: 50 }
 *               currency: { type: string, example: KES }
 *               recipientPhone: { type: string, example: "+254712345678" }
 *               recipientProvider: { type: string, example: MPESA }
 *               recipientName: { type: string }
 *     responses:
 *       200:
 *         description: Pay-out initiated
 */
router.post(
  '/pay-out',
  authenticate,
  idempotency,
  validate(payOutSchema),
  transactionController.payOut,
);

/**
 * @openapi
 * /api/v1/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: List user transactions
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of transactions
 */
router.get('/', authenticate, transactionController.listTransactions);

/**
 * @openapi
 * /api/v1/transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get transaction by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transaction details
 */
router.get('/:id', authenticate, transactionController.getTransaction);

/**
 * @openapi
 * /api/v1/transactions/reference/{reference}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get transaction by reference
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transaction details
 */
router.get('/reference/:reference', authenticate, transactionController.getTransactionByReference);

router.post(
  '/send',
  authenticate,
  idempotency,
  validate(sendSchema),
  transactionController.sendInternal,
);
router.post(
  '/cross-border',
  authenticate,
  idempotency,
  validate(crossBorderSchema),
  transactionController.crossBorderSend,
);
router.post(
  '/pay-in',
  authenticate,
  idempotency,
  validate(payInSchema),
  transactionController.payIn,
);
router.post(
  '/pay-out',
  authenticate,
  idempotency,
  validate(payOutSchema),
  transactionController.payOut,
);
router.get('/', authenticate, transactionController.listTransactions);
router.get('/:id', authenticate, transactionController.getTransaction);
router.get('/reference/:reference', authenticate, transactionController.getTransactionByReference);

export default router;
