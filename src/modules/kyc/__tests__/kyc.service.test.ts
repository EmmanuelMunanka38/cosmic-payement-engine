import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as kycService from '../kyc.service.js';
import * as kycRepo from '../kyc.repository.js';
import { NotFoundError } from '../../../utils/errors.js';

const mockUpdateMany = vi.hoisted(() => vi.fn().mockResolvedValue({ count: 1 }));

vi.mock('../kyc.repository.js');

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    kycDocument: { updateMany: mockUpdateMany },
  })),
}));

/*user interface {
  id:number ,
  email:string ,
  phone:sting?,
  kycStatus:string?
  //this interface is passed on the test apis for kyc test .
}*/
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  phone: '+254700000000',
  kycStatus: 'UNVERIFIED',
};

const mockDocument = {
  id: 'doc-1',
  userId: 'user-1',
  documentType: 'PASSPORT',
  documentUrl: 'https://example.com/doc.pdf',
  status: 'PENDING',
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('KYCService — submitKyc', () => {
  const kycInput = {
    documentType: 'PASSPORT' as const,
    documentUrl: 'https://example.com/doc.pdf',
  };

  it('creates a KYC document and updates user status', async () => {
    vi.mocked(kycRepo.findUserById).mockResolvedValue(mockUser);
    vi.mocked(kycRepo.createKycDocument).mockResolvedValue(mockDocument);

    const result = await kycService.submitKyc('user-1', kycInput);

    expect(kycRepo.findUserById).toHaveBeenCalledWith('user-1');
    expect(kycRepo.createKycDocument).toHaveBeenCalledWith(
      'user-1',
      kycInput.documentType,
      kycInput.documentUrl,
    );
    expect(kycRepo.updateUserKycStatus).toHaveBeenCalledWith('user-1', 'PENDING');
    expect(result).toEqual(mockDocument);
  });
  // changing the ky test part for different countries that are able to be given service by the plform 
  it('throws NotFoundError when user does not exist', async () => {
    vi.mocked(kycRepo.findUserById).mockResolvedValue(null);

    await expect(kycService.submitKyc('user-999', kycInput)).rejects.toThrow('not found');

    expect(kycRepo.createKycDocument).not.toHaveBeenCalled();
  });
});

describe('KYCService — getKycStatus', () => {
  it('returns KYC status and documents', async () => {
    vi.mocked(kycRepo.getUserKycStatus).mockResolvedValue({ kycStatus: 'PENDING' });
    vi.mocked(kycRepo.getDocumentsByUserId).mockResolvedValue([mockDocument]);

    const result = await kycService.getKycStatus('user-1');

    expect(kycRepo.getUserKycStatus).toHaveBeenCalledWith('user-1');
    expect(kycRepo.getDocumentsByUserId).toHaveBeenCalledWith('user-1');
    expect(result.kycStatus).toBe('PENDING');
    expect(result.documents).toHaveLength(1);
  });

  it('returns empty documents when user has none', async () => {
    vi.mocked(kycRepo.getUserKycStatus).mockResolvedValue({ kycStatus: 'UNVERIFIED' });
    vi.mocked(kycRepo.getDocumentsByUserId).mockResolvedValue([]);

    const result = await kycService.getKycStatus('user-1');

    expect(result.kycStatus).toBe('UNVERIFIED');
    expect(result.documents).toHaveLength(0);
  });
});

describe('KYCService — updateKycStatus', () => {
  it('updates user KYC status to VERIFIED and approves documents', async () => {
    vi.mocked(kycRepo.findUserById).mockResolvedValue(mockUser)
    await kycService.updateKycStatus('user-1', 'VERIFIED');

    expect(kycRepo.updateUserKycStatus).toHaveBeenCalledWith('user-1', 'VERIFIED');
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', status: 'PENDING' },
      data: expect.objectContaining({ status: 'VERIFIED', verifiedAt: expect.any(Date) }),
    });
  });

  it('updates user KYC status to REJECTED with reason', async () => {
    vi.mocked(kycRepo.findUserById).mockResolvedValue(mockUser);

    await kycService.updateKycStatus('user-1', 'REJECTED', 'Invalid document');

    expect(kycRepo.updateUserKycStatus).toHaveBeenCalledWith('user-1', 'REJECTED');
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', status: 'PENDING' },
      data: expect.objectContaining({ status: 'REJECTED', rejectedReason: 'Invalid document' }),
    });
  });

  it('throws NotFoundError when user does not exist', async () => {
    vi.mocked(kycRepo.findUserById).mockResolvedValue(null);

    await expect(kycService.updateKycStatus('user-999', 'VERIFIED')).rejects.toThrow('not found');

    expect(kycRepo.updateUserKycStatus).not.toHaveBeenCalled();
  });
});
