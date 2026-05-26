import { Router } from 'express';
import * as walletController from './wallets.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createWalletSchema } from './wallets.validation.js';

const router = Router();

router.get('/', authenticate, walletController.getWallets);
router.post('/', authenticate, validate(createWalletSchema), walletController.createWallet);
router.get('/:id', authenticate, walletController.getWalletById);

export default router;
