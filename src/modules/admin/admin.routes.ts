import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireAdmin } from './admin.middleware.js';

const router = Router();

router.get('/users', authenticate, requireAdmin, adminController.getUsers);
router.get('/transactions', authenticate, requireAdmin, adminController.getTransactions);
router.get('/stats', authenticate, requireAdmin, adminController.getStats);
router.post('/transactions/:id/approve', authenticate, requireAdmin, adminController.approveTransaction);
router.post('/transactions/:id/reject', authenticate, requireAdmin, adminController.rejectTransaction);
router.patch('/users/:id/kyc-status', authenticate, requireAdmin, adminController.updateUserKyc);

export default router;
