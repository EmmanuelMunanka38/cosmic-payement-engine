import { z } from 'zod';
import { KycStatus } from '../../types/enums.js';

export const submitKycSchema = z.object({
  documentType: z.enum(['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'UTILITY_BILL']),
  documentUrl: z.string().url('Document URL must be a valid URL'),
});

export const updateKycStatusSchema = z.object({
  userId: z.string().uuid(),
  status: z.nativeEnum(KycStatus),
  rejectedReason: z.string().max(500).optional(),
});

export type SubmitKycInput = z.infer<typeof submitKycSchema>;
export type UpdateKycStatusInput = z.infer<typeof updateKycStatusSchema>;
