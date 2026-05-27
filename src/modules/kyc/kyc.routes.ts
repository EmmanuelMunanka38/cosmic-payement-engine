import { Router } from 'express';
import * as kycController from './kyc.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /api/v1/kyc/submit:
 *   post:
 *     tags: [KYC]
 *     summary: Submit KYC document for verification
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [documentType, documentUrl]
 *             properties:
 *               documentType: { type: string, enum: [PASSPORT, NATIONAL_ID, DRIVERS_LICENSE, UTILITY_BILL] }
 *               documentUrl: { type: string }
 *     responses:
 *       200:
 *         description: KYC submitted
 */
router.post('/submit', authenticate, kycController.submitKyc);

/**
 * @openapi
 * /api/v1/kyc/status:
 *   get:
 *     tags: [KYC]
 *     summary: Get KYC status and submitted documents
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: KYC status and documents
 */
router.get('/status', authenticate, kycController.getKycStatus);

export default router;
