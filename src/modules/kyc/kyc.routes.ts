import { Router } from 'express';
import * as kycController from './kyc.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/submit', authenticate, kycController.submitKyc);
router.get('/status', authenticate, kycController.getKycStatus);

export default router;
