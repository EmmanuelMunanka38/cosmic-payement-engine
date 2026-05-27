import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireAdmin } from './admin.middleware.js';
import { idempotency } from '../../middleware/idempotency.js';

const router = Router();

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users (admin)
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
 *         description: Paginated list of users
 */
router.get('/users', authenticate, requireAdmin, adminController.getUsers);

/**
 * @openapi
 * /api/v1/admin/transactions:
 *   get:
 *     tags: [Admin]
 *     summary: List all transactions (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of transactions
 */
router.get('/transactions', authenticate, requireAdmin, adminController.getTransactions);

/**
 * @openapi
 * /api/v1/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get transaction statistics (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Transaction stats
 */
router.get('/stats', authenticate, requireAdmin, adminController.getStats);

/**
 * @openapi
 * /api/v1/admin/transactions/{id}/approve:
 *   post:
 *     tags: [Admin]
 *     summary: Approve a transaction (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transaction approved
 */
router.post(
  '/transactions/:id/approve',
  authenticate,
  requireAdmin,
  idempotency,
  adminController.approveTransaction,
);

/**
 * @openapi
 * /api/v1/admin/transactions/{id}/reject:
 *   post:
 *     tags: [Admin]
 *     summary: Reject a transaction (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Transaction rejected
 */
router.post(
  '/transactions/:id/reject',
  authenticate,
  requireAdmin,
  idempotency,
  adminController.rejectTransaction,
);

/**
 * @openapi
 * /api/v1/admin/users/{id}/kyc-status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user KYC status (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [kycStatus]
 *             properties:
 *               kycStatus: { type: string, enum: [UNVERIFIED, PENDING, VERIFIED, REJECTED] }
 *               rejectedReason: { type: string }
 *     responses:
 *       200:
 *         description: KYC status updated
 */
router.patch('/users/:id/kyc-status', authenticate, requireAdmin, adminController.updateUserKyc);

export default router;
