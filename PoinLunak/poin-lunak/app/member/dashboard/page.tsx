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
      join_date: true,
      points: true,
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

  // Fetch redeemed rewards with reward_item relation
  const redeemedRewards = await prisma.rewards.findMany({
    where: { users_id: currentUser.id },
    orderBy: { created_at: 'desc' },
    include: {
      reward_item: true,
    },
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
    points_required: reward.reward_item?.points_required || 0,
    created_at: reward.created_at.toISOString(),
    exchanged_at: reward.exchanged_at.toISOString(),
    expires_at: reward.expires_at.toISOString(),
    reward_item: reward.reward_item ? {
      ...reward.reward_item,
      points_required: reward.reward_item.points_required,
      created_at: reward.reward_item.created_at.toISOString(),
      updated_at: reward.reward_item.updated_at.toISOString(),
    } : null,
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
