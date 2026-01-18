// Seed script to populate database with demo data
// Run: npx prisma db seed

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const memberPassword = await bcrypt.hash('member123', 10);

  // ========== USERS (20+) ==========
  console.log('\n📝 Seeding Users...');
  
  // Create 2 Admin Users
  const admin1 = await prisma.users.upsert({
    where: { email: 'admin1@poinlunak.com' },
    update: {},
    create: {
      name: 'Admin Poin Lunak',
      email: 'admin1@poinlunak.com',
      password: adminPassword,
      role: 'ADMIN',
      join_date: new Date('2025-01-01'),
      points: 0,
      status: 'ACTIVE',
    },
  });

  const admin2 = await prisma.users.upsert({
    where: { email: 'admin2@poinlunak.com' },
    update: {},
    create: {
      name: 'Admin Manager',
      email: 'admin2@poinlunak.com',
      password: adminPassword,
      role: 'ADMIN',
      join_date: new Date('2025-01-02'),
      points: 0,
      status: 'ACTIVE',
    },
  });

  // Create 20+ Member Users
  const memberEmails = [
    'budi@example.com', 'siti@example.com', 'ahmad@example.com', 'dewi@example.com', 'rinto@example.com',
    'rina@example.com', 'tono@example.com', 'maya@example.com', 'irwan@example.com', 'linda@example.com',
    'bambang@example.com', 'sinta@example.com', 'hendra@example.com', 'fitri@example.com', 'dadang@example.com',
    'putri@example.com', 'yusuf@example.com', 'sania@example.com', 'ridho@example.com', 'nurul@example.com',
    'wicak@example.com', 'ikhlas@example.com', 'bella@example.com', 'citra@example.com',
  ];

  const members = [];
  for (let i = 0; i < memberEmails.length; i++) {
    const member = await prisma.users.upsert({
      where: { email: memberEmails[i] },
      update: {},
      create: {
        name: memberEmails[i].split('@')[0].charAt(0).toUpperCase() + memberEmails[i].split('@')[0].slice(1),
        email: memberEmails[i],
        password: memberPassword,
        role: 'MEMBER',
        join_date: new Date(2024, Math.floor(i / 4), (i % 28) + 1),
        points: Math.floor(Math.random() * 500) + 100,
        status: i % 10 === 0 ? 'INACTIVE' : 'ACTIVE',
      },
    });
    members.push(member);
  }
  console.log(`✅ Created ${2} admin users and ${members.length} member users`);

  // ========== REWARD ITEMS (20+) ==========
  console.log('\n🎁 Seeding Reward Items...');
  
  const rewardItemsData = [
    { name: 'Voucher Diskon 10%', description: 'Diskon 10% untuk pembelian berikutnya', points_required: 100 },
    { name: 'Voucher Diskon 20%', description: 'Diskon 20% untuk pembelian berikutnya', points_required: 200 },
    { name: 'Gratis 1 Porsi Ayam', description: 'Gratis 1 porsi ayam goreng tulang lunak', points_required: 150 },
    { name: 'Gratis 2 Porsi Ayam', description: 'Gratis 2 porsi ayam goreng tulang lunak', points_required: 300 },
    { name: 'Gratis 1 Minuman', description: 'Gratis 1 minuman (Es Teh/Es Jeruk/Kopi)', points_required: 75 },
    { name: 'Gratis Paket Hemat', description: 'Gratis 1 paket hemat (Ayam + Nasi + Minum)', points_required: 250 },
    { name: 'Voucher Rp 50.000', description: 'Voucher belanja senilai Rp 50.000', points_required: 500 },
    { name: 'Voucher Rp 100.000', description: 'Voucher belanja senilai Rp 100.000', points_required: 1000 },
    { name: 'Gratis Sambal Extra (3x)', description: 'Gratis 3 sambal extra untuk pembelian Ayam', points_required: 90 },
    { name: 'Gratis Nasi Putih (2x)', description: 'Gratis 2 porsi nasi putih', points_required: 80 },
    { name: 'Upgrade ke Paket Premium', description: 'Upgrade gratis ke paket premium untuk 1x transaksi', points_required: 350 },
    { name: 'Gratis Ongkir', description: 'Gratis ongkos kirim untuk 1x pemesanan', points_required: 200 },
    { name: 'Double Points Next Purchase', description: 'Dapatkan 2x poin untuk pembelian berikutnya', points_required: 400 },
    { name: 'Voucher Diskon 15%', description: 'Diskon 15% untuk pembelian berikutnya', points_required: 150 },
    { name: 'Gratis Dessert', description: 'Gratis 1 dessert pilihan', points_required: 120 },
    { name: 'Member Priority Card', description: 'Kartu member prioritas untuk antrian lebih cepat', points_required: 500 },
    { name: 'Voucher Rp 25.000', description: 'Voucher belanja senilai Rp 25.000', points_required: 250 },
    { name: 'Bundle Hemat 5x Ayam', description: 'Bundle 5 porsi ayam goreng dengan harga spesial', points_required: 600 },
    { name: 'Gratis Minuman Premium', description: 'Gratis 1 minuman premium (Kopi Spesial/Jus)', points_required: 180 },
    { name: 'Birthday Special Voucher', description: 'Voucher khusus ulang tahun senilai Rp 75.000', points_required: 300 },
    { name: 'Gratis Pesan Catering', description: 'Gratis pesan catering untuk acara Anda (min 10 porsi)', points_required: 1500 },
  ];

  const rewardItems = [];
  for (const data of rewardItemsData) {
    const item = await prisma.reward_items.create({
      data: {
        ...data,
        status: 'ACTIVE',
      },
    });
    rewardItems.push(item);
  }
  console.log(`✅ Created ${rewardItems.length} reward items`);

  // ========== TRANSACTIONS (30+) ==========
  console.log('\n📊 Seeding Transactions...');
  
  const transactionsData = [];
  let transactionId = 0;
  
  for (let i = 0; i < 30; i++) {
    const member = members[i % members.length];
    const amount = Math.floor(Math.random() * 150000) + 50000;
    const points = Math.floor(amount / 1000);
    
    transactionsData.push({
      users_id: member.id,
      total_item: Math.floor(Math.random() * 5) + 1,
      total_transaction: amount,
      items: `Ayam Goreng Tulang Lunak x${Math.floor(Math.random() * 3) + 1}`,
      points_gained: points,
    });
  }

  for (const txData of transactionsData) {
    await prisma.transactions.create({ data: txData });
    transactionId++;
  }
  console.log(`✅ Created ${transactionId} transactions`);

  // ========== REWARDS (Voucher yang Sudah Ditukar) ==========
  console.log('\n🎫 Seeding Vouchers (Rewards yang Sudah Ditukar Poin)...');
  
  const vouchersData = [];
  
  // Create vouchers untuk beberapa members
  for (let i = 0; i < 20; i++) {
    const member = members[i % members.length];
    const reward = rewardItems[i % rewardItems.length];
    const daysAgo = Math.floor(Math.random() * 14); // Created within last 14 days
    
    // Determine expiry date (10-30 days from creation)
    const expiryDays = Math.floor(Math.random() * 21) + 10; // 10-30 days
    const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const expiryDate = new Date(createdDate.getTime() + expiryDays * 24 * 60 * 60 * 1000);
    
    // Determine status based on expiry
    let status = 'ACTIVE';
    if (expiryDate < new Date()) {
      status = 'EXPIRED';
    } else if (i % 3 === 0) {
      status = 'USED'; // Some vouchers are already used
    }
    
    const voucher = await prisma.rewards.create({
      data: {
        reward_item_id: reward.id,
        users_id: member.id,
        code: `VOUCHER-${String(Date.now() + i).slice(-8)}`,
        status: status,
        exchanged_at: createdDate,
        expires_at: expiryDate,
      },
    });
    
    vouchersData.push(voucher);
  }
  console.log(`✅ Created ${vouchersData.length} vouchers (exchanged rewards)`);

  // ========== REDEMPTION HISTORY (Penggunaan Voucher) ==========
  console.log('\n📜 Seeding Redemption History (Penggunaan Voucher)...');
  
  const redemptionData = [];
  
  // Only redeem USED vouchers
  const usedVouchers = vouchersData.filter(v => v.status === 'USED');
  
  for (let i = 0; i < Math.min(12, usedVouchers.length); i++) {
    const voucher = usedVouchers[i];
    
    const redemption = await prisma.redemption_history.create({
      data: {
        rewards_id: voucher.id,
        users_id: voucher.users_id,
        redeemed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last 7 days
        transaction_ref: `TXN-${String(Date.now() + i).slice(-6)}`,
      },
    });
    
    redemptionData.push(redemption);
  }
  console.log(`✅ Created ${redemptionData.length} redemption history records`);

  // ========== MEMBERSHIP LOGS (20+) ==========
  console.log('\n📋 Seeding Membership Logs...');
  
  const logActivities = [
    'Registrasi akun baru',
    'Melakukan transaksi pembelian',
    'Menukar poin dengan reward',
    'Update profil pengguna',
    'Login ke aplikasi',
    'Lihat riwayat transaksi',
    'Mengajukan keluhan/feedback',
    'Verifikasi email',
    'Ubah password akun',
    'Aktivasi member premium',
  ];

  let logCount = 0;
  for (let i = 0; i < 30; i++) {
    const member = members[i % members.length];
    const activity = logActivities[Math.floor(Math.random() * logActivities.length)];
    
    await prisma.membership_logs.create({
      data: {
        users_id: member.id,
        activity: activity,
        activity_time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    logCount++;
  }
  console.log(`✅ Created ${logCount} membership log records`);

  // ========== SUMMARY ==========
  console.log('\n\n🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   ✓ Users: 2 Admin + ${members.length} Members = ${2 + members.length} total`);
  console.log(`   ✓ Transactions: ${transactionId}`);
  console.log(`   ✓ Reward Items (Catalog): ${rewardItems.length}`);
  console.log(`   ✓ Vouchers (Exchanged Rewards): ${vouchersData.length}`);
  console.log(`   ✓ Redemption History (Used Vouchers): ${redemptionData.length}`);
  console.log(`   ✓ Membership Logs: ${logCount}`);
  
  console.log('\n🔐 Demo Credentials:');
  console.log('   Admin 1: admin1@poinlunak.com / admin123');
  console.log('   Admin 2: admin2@poinlunak.com / admin123');
  console.log('   Member: budi@example.com / member123 (atau email member lainnya)');
  console.log('\n');
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
