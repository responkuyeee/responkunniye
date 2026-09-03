import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding data dummy...');

  // ---------------------------------------------------------
  // 1. Buat akun Researcher
  // ---------------------------------------------------------
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const researcher = await prisma.user.upsert({
    where: { email: 'researcher@example.com' },
    update: {},
    create: {
      email: 'researcher@example.com',
      phone: '081200000001',
      passwordHash,
      name: 'Budi Santoso (Researcher)',
      ageDeclared18plus: true,
      status: 'active',
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
    },
  });

  // Profil researcher
  await prisma.userProfile.upsert({
    where: { userId: researcher.id },
    update: {},
    create: {
      userId: researcher.id,
      gender: 'male',
      domicileProvince: 'DKI Jakarta',
      domicileCity: 'Jakarta Selatan',
      dataShareConsentAt: new Date(),
    },
  });

  // Wallet researcher + top-up 200 token awal
  const researcherWallet = await prisma.tokenWallet.upsert({
    where: { userId: researcher.id },
    update: {},
    create: { userId: researcher.id },
  });

  // Seed topup 200 token ke researcher
  const existingTopup = await prisma.tokenTransaction.findFirst({
    where: { walletId: researcherWallet.id, type: 'topup' },
  });
  if (!existingTopup) {
    await prisma.tokenTransaction.create({
      data: {
        walletId: researcherWallet.id,
        type: 'topup',
        amount: 200,
        idempotencyKey: 'seed-topup-researcher-001',
      },
    });
    console.log('  ✅ Researcher wallet: +200 token');
  }

  // Quality score researcher
  await prisma.qualityScore.upsert({
    where: { userId: researcher.id },
    update: {},
    create: { userId: researcher.id, score: 100.0, consecutiveGoodAnswers: 0 },
  });

  // ---------------------------------------------------------
  // 2. Buat akun Respondent (skor normal)
  // ---------------------------------------------------------
  const respondentNormal = await prisma.user.upsert({
    where: { email: 'respondent.good@example.com' },
    update: {},
    create: {
      email: 'respondent.good@example.com',
      phone: '081200000002',
      passwordHash,
      name: 'Siti Rahma (Respondent Baik)',
      ageDeclared18plus: true,
      status: 'active',
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: respondentNormal.id },
    update: {},
    create: {
      userId: respondentNormal.id,
      gender: 'female',
      domicileProvince: 'DKI Jakarta',
      domicileCity: 'Jakarta Pusat',
      dataShareConsentAt: new Date(),
    },
  });

  await prisma.tokenWallet.upsert({
    where: { userId: respondentNormal.id },
    update: {},
    create: { userId: respondentNormal.id },
  });

  await prisma.qualityScore.upsert({
    where: { userId: respondentNormal.id },
    update: {},
    create: { userId: respondentNormal.id, score: 95.0, consecutiveGoodAnswers: 3 },
  });

  // ---------------------------------------------------------
  // 3. Buat akun Respondent (skor rendah / throttled)
  // ---------------------------------------------------------
  const respondentLowScore = await prisma.user.upsert({
    where: { email: 'respondent.low@example.com' },
    update: {},
    create: {
      email: 'respondent.low@example.com',
      phone: '081200000003',
      passwordHash,
      name: 'Andi Susanto (Respondent Skor Rendah)',
      ageDeclared18plus: true,
      status: 'active',
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: respondentLowScore.id },
    update: {},
    create: {
      userId: respondentLowScore.id,
      gender: 'male',
      domicileProvince: 'Jawa Barat',
      domicileCity: 'Bandung',
      dataShareConsentAt: new Date(),
    },
  });

  await prisma.tokenWallet.upsert({
    where: { userId: respondentLowScore.id },
    update: {},
    create: { userId: respondentLowScore.id },
  });

  await prisma.qualityScore.upsert({
    where: { userId: respondentLowScore.id },
    update: {},
    create: {
      userId: respondentLowScore.id,
      score: 30.0,
      consecutiveGoodAnswers: 0,
      throttled: true, // skor rendah → throttled = true, akses riset dibatasi
    },
  });

  console.log('  ✅ 3 akun pengguna seed berhasil dibuat');
  console.log('\nSeed data:');
  console.log('  📧 researcher@example.com | password: Password123!');
  console.log('  📧 respondent.good@example.com | password: Password123!');
  console.log('  📧 respondent.low@example.com | password: Password123! (throttled=true)');
  console.log('\n✅ Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Error seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
