// Admin Dashboard - Server Component

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminDashboardClient from './dashboard-client';

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  if (currentUser.role !== 'ADMIN') {
    redirect('/member/dashboard');
  }

  return <AdminDashboardClient />;
}
