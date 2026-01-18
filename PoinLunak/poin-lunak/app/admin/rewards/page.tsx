// Admin Rewards Page (Server Component)

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminRewardsClient from './rewards-client';

export default async function AdminRewardsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  return <AdminRewardsClient />;
}
