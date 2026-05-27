import { CurrencyCode, PaymentProvider } from '@prisma/client';
import { prisma } from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';
import { refreshRates } from '../src/modules/exchangeRates/rates.cron.js';

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cosmic-payment.dev' },
    update: {},
    create: {
      email: 'admin@cosmic-payment.dev',
      phone: '+254700000000',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      kycStatus: 'VERIFIED',
      country: 'KE',
    },
  });

  console.log(`Admin user created: ${admin.email}`);

  const userPassword = await bcrypt.hash('user123', 12);

  const testUser = await prisma.user.upsert({
    where: { email: 'user@cosmic-payment.dev' },
    update: {},
    create: {
      email: 'user@cosmic-payment.dev',
      phone: '+254712345678',
      passwordHash: userPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      kycStatus: 'VERIFIED',
      country: 'KE',
    },
  });

  console.log(`Test user created: ${testUser.email}`);

  const currencies = [
    CurrencyCode.USD,
    CurrencyCode.KES,
    CurrencyCode.UGX,
    CurrencyCode.GHS,
    CurrencyCode.NGN,
  ];

  for (const currency of currencies) {
    await prisma.wallet.upsert({
      where: { userId_currency: { userId: testUser.id, currency } },
      update: {},
      create: {
        userId: testUser.id,
        currency,
        balance: 10000,
        ledgerBalance: 10000,
        availableBalance: 10000,
      },
    });
  }

  console.log('Wallets created for test user');

  await refreshRates();

  console.log('Exchange rates seeded');

  console.log('\n--- Test Credentials ---');
  console.log('Admin: admin@cosmic-payment.dev / admin123');
  console.log('User:  user@cosmic-payment.dev  / user123');
  console.log('-----------------------\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
