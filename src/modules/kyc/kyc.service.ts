import { prisma } from '../../lib/prisma.js';
import { SubmitKycInput } from './kyc.validation.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import * as kycRepo from './kyc.repository.js';

export async function submitKyc(userId: string, input: SubmitKycInput) {
  const user = await kycRepo.findUserById(userId);
  if (!user) throw new NotFoundError('User', userId);

  const doc = await kycRepo.createKycDocument(userId, input.documentType, input.documentUrl);
  await kycRepo.updateUserKycStatus(userId, 'PENDING');

  return doc;
}

export async function getKycStatus(userId: string) {
  const user = await kycRepo.getUserKycStatus(userId);
  const documents = await kycRepo.getDocumentsByUserId(userId);

  return { kycStatus: user?.kycStatus, documents };
}

export async function updateKycStatus(userId: string, status: string, rejectedReason?: string) {
  const user = await kycRepo.findUserById(userId);
  if (!user) throw new NotFoundError('User', userId);

  await kycRepo.updateUserKycStatus(userId, status);

  if (status === 'VERIFIED' || status === 'REJECTED') {
    await prisma.kycDocument.updateMany({
      where: { userId, status: 'PENDING' },
      data: {
        status: status as any,
        verifiedAt: status === 'VERIFIED' ? new Date() : undefined,
        rejectedReason,
      },
    });
  }
}
