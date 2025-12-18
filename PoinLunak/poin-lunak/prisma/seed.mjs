// Seed script to populate database with demo data
// Run: node prisma/seed.mjs

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const memberPassword = await bcrypt.hash('member123', 10);

  // Create Admin User
  const admin = await prisma.users.upsert({
    where: { email: 'admin@poinlunak.com' },
    update: {},
    create: {
      name: 'Admin Poin Lunak',
      email: 'admin@poinlunak.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '081234567890',
      address: 'Jl. Surya Sumantri No. 65, Bandung',
      join_date: new Date(),
      points: 0,
      membership_level: 'GOLD',
      status: 'active',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Demo Member Users
  const member1 = await prisma.users.upsert({
    where: { email: 'member@poinlunak.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'member@poinlunak.com',
      password: memberPassword,
      role: 'MEMBER',
      phone: '081298765432',
      address: 'Jl. Gatot Subroto No. 123, Bandung',
      join_date: new Date(),
      points: 550, // Will have 550 points from transactions
      membership_level: 'BRONZE', // Will be updated based on points
      status: 'active',
    },
  });
  console.log('✅ Member user created:', member1.email);

  const member2 = await prisma.users.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: memberPassword,
      role: 'MEMBER',
      phone: '082187654321',
      address: 'Jl. Dago No. 45, Bandung',
      join_date: new Date(),
      points: 280, // Will have 280 points from transactions
      membership_level: 'BRONZE',
      status: 'active',
    },
  });
  console.log('✅ Member user created:', member2.email);

  // Create Sample Transactions for member1 (more realistic data)
  const transactions = [
    {
      users_id: member1.id,
      total_item: 2,
      total_transaction: 85000,
      items: '2x Ayam Goreng Tulang Lunak Original, 1x Es Teh Manis',
      points_gained: 85, // 85000 / 1000 = 85 points
    },
    {
      users_id: member1.id,
      total_item: 3,
      total_transaction: 125000,
      items: '3x Ayam Goreng Tulang Lunak Pedas, 2x Nasi Putih',
      points_gained: 125, // 125000 / 1000 = 125 points
    },
    {
      users_id: member1.id,
      total_item: 1,
      total_transaction: 65000,
      items: '1x Paket Hemat (Ayam + Nasi + Minum)',
      points_gained: 65, // 65000 / 1000 = 65 points
    },
    {
      users_id: member1.id,
      total_item: 4,
      total_transaction: 180000,
      items: '4x Ayam Goreng Tulang Lunak Original, 2x Sambal Extra',
      points_gained: 180, // 180000 / 1000 = 180 points
    },
    {
      users_id: member1.id,
      total_item: 2,
      total_transaction: 95000,
      items: '2x Ayam Goreng Tulang Lunak Bumbu Kecap, 2x Es Jeruk',
      points_gained: 95, // 95000 / 1000 = 95 points
    },
  ];

  for (const txData of transactions) {
    await prisma.transactions.create({ data: txData });
  }
  console.log(`✅ Created ${transactions.length} sample transactions for member1`);
  console.log(`   Total points for member1: ${transactions.reduce((sum, t) => sum + t.points_gained, 0)} points`);

  // Create Sample Transactions for member2
  const transactions2 = [
    {
      users_id: member2.id,
      total_item: 1,
      total_transaction: 45000,
      items: '1x Ayam Goreng Tulang Lunak Original',
      points_gained: 45, // 45000 / 1000 = 45 points
    },
    {
      users_id: member2.id,
      total_item: 2,
      total_transaction: 85000,
      items: '2x Paket Ayam + Nasi',
      points_gained: 85, // 85000 / 1000 = 85 points
    },
    {
      users_id: member2.id,
      total_item: 3,
      total_transaction: 150000,
      items: '3x Ayam Goreng Tulang Lunak Pedas, 3x Es Teh',
      points_gained: 150, // 150000 / 1000 = 150 points
    },
  ];

  for (const txData of transactions2) {
    await prisma.transactions.create({ data: txData });
  }
  console.log(`✅ Created ${transactions2.length} sample transactions for member2`);
  console.log(`   Total points for member2: ${transactions2.reduce((sum, t) => sum + t.points_gained, 0)} points`);

  // Create Sample Rewards (redeemed by member1)
  const reward1 = await prisma.rewards.create({
    data: {
      users_id: member1.id,
      reward_name: 'Voucher Diskon 10%',
      points_required: 100,
      code: 'POIN-DEMO1234',
      status: 'available',
    },
  });
  console.log('✅ Sample reward created:', reward1.code);

  const reward2 = await prisma.rewards.create({
    data: {
      users_id: member1.id,
      reward_name: 'Gratis 1 Es Teh Manis',
      points_required: 50,
      code: 'POIN-FREE5678',
      status: 'used',
    },
  });
  console.log('✅ Sample reward created:', reward2.code);

  // Create Membership Logs
  await prisma.membership_logs.create({
    data: {
      users_id: member1.id,
      activity: 'Registrasi akun baru',
    },
  });

  await prisma.membership_logs.create({
    data: {
      users_id: member1.id,
      activity: 'Naik ke level SILVER',
    },
  });

  console.log('✅ Membership logs created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Demo Credentials:');
  console.log('   Admin: admin@poinlunak.com / admin123');
  console.log('   Member: member@poinlunak.com / member123');
  console.log('   Member 2: jane@example.com / member123\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
