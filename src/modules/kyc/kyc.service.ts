import { PrismaClient } from '@prisma/client';
import { SubmitKycInput } from './kyc.validation.js';
import { NotFoundError } from '../../utils/errors.js';

const prisma = new PrismaClient();

export async function submitKyc(userId: string, input: SubmitKycInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User', userId);

  const doc = await prisma.kycDocument.create({
    data: {
      userId,
      documentType: input.documentType,
      documentUrl: input.documentUrl,
      status: 'PENDING',
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: 'PENDING' },
  });

  return doc;
}

export async function getKycStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycStatus: true },
  });

  const documents = await prisma.kycDocument.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      documentType: true,
      status: true,
      verifiedAt: true,
      rejectedReason: true,
      createdAt: true,
    },
  });

  return { kycStatus: user?.kycStatus, documents };
}

export async function updateKycStatus(userId: string, status: string, rejectedReason?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User', userId);

  await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: status as any },
  });

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
