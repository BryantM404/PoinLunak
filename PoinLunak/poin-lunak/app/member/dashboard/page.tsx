// Member Dashboard - Server Component

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MemberDashboardClient from './dashboard-client';

export default async function MemberDashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Fetch user data with relations
  const userData = await prisma.users.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      join_date: true,
      points: true,
      membership_level: true,
      status: true,
      created_at: true,
    },
  });

  if (!userData) {
    redirect('/login');
  }

  // Fetch recent transactions
  const recentTransactions = await prisma.transactions.findMany({
    where: { users_id: currentUser.id },
    orderBy: { created_at: 'desc' },
    take: 10,
  });

  // Fetch redeemed rewards
  const redeemedRewards = await prisma.rewards.findMany({
    where: { users_id: currentUser.id },
    orderBy: { created_at: 'desc' },
  });

  // Convert Decimal types to numbers for client serialization
  const serializedTransactions = recentTransactions.map(tx => ({
    ...tx,
    total_transaction: Number(tx.total_transaction),
    points_gained: Number(tx.points_gained),
    created_at: tx.created_at.toISOString(),
  }));

  const serializedRewards = redeemedRewards.map(reward => ({
    ...reward,
    points_required: Number(reward.points_required),
    created_at: reward.created_at.toISOString(),
    redeemed_at: reward.redeemed_at ? reward.redeemed_at.toISOString() : null,
  }));

  const serializedUser = {
    ...userData,
    join_date: userData.join_date?.toISOString() || null,
    created_at: userData.created_at.toISOString(),
  };

  return (
    <MemberDashboardClient
      user={serializedUser}
      transactions={serializedTransactions}
      rewards={serializedRewards}
    />
  );
}
