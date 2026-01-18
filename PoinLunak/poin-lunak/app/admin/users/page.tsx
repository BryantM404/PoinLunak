// Admin Users Page

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminUsersClient from './users-client';

export const metadata = {
  title: 'Kelola User - Poin Lunak',
};

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  return <AdminUsersClient />;
}
