// Admin Transactions Page

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminTransactionsClient from './transactions-client';

export const metadata = {
  title: 'Daftar Transaksi - Poin Lunak',
};

export default async function AdminTransactionsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  return <AdminTransactionsClient />;
}
