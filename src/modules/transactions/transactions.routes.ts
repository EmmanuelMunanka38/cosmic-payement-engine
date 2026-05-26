import { Router } from 'express';
import * as transactionController from './transactions.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { idempotency } from '../../middleware/idempotency.js';
import { validate } from '../../middleware/validate.js';
import { crossBorderSchema, payInSchema, payOutSchema } from './transactions.validation.js';

const router = Router();

router.post('/send', authenticate, idempotency, transactionController.sendInternal);
router.post('/cross-border', authenticate, idempotency, validate(crossBorderSchema), transactionController.crossBorderSend);
router.post('/pay-in', authenticate, idempotency, validate(payInSchema), transactionController.payIn);
router.post('/pay-out', authenticate, idempotency, validate(payOutSchema), transactionController.payOut);
router.get('/', authenticate, transactionController.listTransactions);
router.get('/:id', authenticate, transactionController.getTransaction);
router.get('/reference/:reference', authenticate, transactionController.getTransactionByReference);

export default router;
