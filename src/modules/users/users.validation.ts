import { z } from 'zod';
import { KycStatus } from '@prisma/client';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().min(8).optional(),
  kycStatus: z.nativeEnum(KycStatus).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
