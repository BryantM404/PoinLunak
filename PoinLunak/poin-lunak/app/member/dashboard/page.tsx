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

  return (
    <MemberDashboardClient
      user={userData}
      transactions={recentTransactions}
      rewards={redeemedRewards}
    />
  );
}
