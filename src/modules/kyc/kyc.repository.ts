import { prisma } from '../../lib/prisma.js';

export async function findUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function createKycDocument(userId: string, documentType: string, documentUrl: string) {
  return prisma.kycDocument.create({
    data: { userId, documentType, documentUrl, status: 'PENDING' },
  });
}

export async function updateUserKycStatus(userId: string, status: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { kycStatus: status as any },
  });
}

export async function getDocumentsByUserId(userId: string) {
  return prisma.kycDocument.findMany({
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
}

export async function getUserKycStatus(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { kycStatus: true },
  });
}
