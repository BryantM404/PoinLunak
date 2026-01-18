// Admin Transactions Client Component

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading';

interface Transaction {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  totalItem: number;
  totalTransaction: number;
  pointsGained: number;
  items: string | null;
  createdAt: Date;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function AdminTransactionsClient() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    users_id: 0,
    totalItem: 0,
    totalTransaction: 0,
    items: '',
  });

  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    fetchTransactions();
    fetchUsers();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/transactions');
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data);
      } else {
        toast.error(data.error || 'Gagal memuat transaksi');
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.items?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesUser = tx.userName.toLowerCase().includes(filterUser.toLowerCase()) ||
      tx.userEmail.toLowerCase().includes(filterUser.toLowerCase());
    
    return matchesSearch && matchesUser;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleOpenModal = () => {
    setFormData({
      users_id: 0,
      totalItem: 0,
      totalTransaction: 0,
      items: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      users_id: 0,
      totalItem: 0,
      totalTransaction: 0,
      items: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.items || !formData.totalTransaction || formData.users_id === 0) {
      toast.error('Semua field harus diisi');
      return;
    }

    try {
      const response = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users_id: formData.users_id,
          items: formData.items,
          total_item: formData.totalItem,
          total_transaction: formData.totalTransaction,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Transaksi berhasil ditambahkan (poin otomatis dihitung)');
        handleCloseModal();
        await fetchTransactions();
      } else {
        toast.error(data.error || 'Gagal menambahkan transaksi');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Title with Back Button */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            className="border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
            onClick={() => router.back()}
          >
            ← Kembali
          </Button>
          <h1 className="text-3xl font-bold text-[#6B3E1D]">Daftar Transaksi</h1>
          <Button
            className="bg-[#6B3E1D] text-white hover:bg-[#4e2710]"
            onClick={() => handleOpenModal()}
          >
            + Tambah Transaksi
          </Button>
        </div>

        {/* Add Button */}
        <div className="flex justify-end">
          
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Cari items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                label=""
              />
              <Input
                type="text"
                placeholder="Cari user (nama atau email)..."
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                label=""
              />
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">ID</th>
                    <th className="text-left">User</th>
                    <th className="text-left">Items</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Poin</th>
                    <th className="text-left">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        Tidak ada transaksi
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="font-semibold">#{tx.id}</td>
                        <td>
                          <div>
                            <p className="font-medium text-[#6B3E1D]">{tx.userName}</p>
                            <p className="text-xs text-gray-500">{tx.userEmail}</p>
                          </div>
                        </td>
                        <td className="text-sm max-w-xs truncate">
                          {tx.items || '-'}
                        </td>
                        <td className="text-right">{tx.totalItem}</td>
                        <td className="text-right font-semibold">
                          Rp {(typeof tx.totalTransaction === 'string' ? parseInt(tx.totalTransaction) : tx.totalTransaction).toLocaleString('id-ID')}
                        </td>
                        <td className="text-right">
                          <span className="px-2 py-1 text-sm rounded-md bg-[#f3e7d1] text-[#6B3E1D]">
                            +{tx.pointsGained}
                          </span>
                        </td>
                        <td className="text-sm">
                          {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  className="border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  ← Sebelumnya
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-[#6B3E1D] text-white'
                          : 'bg-white border border-[#d1d5db] text-[#6B3E1D] hover:bg-[#f3e7d1]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Tambah Transaksi Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#6B3E1D] mb-1">
                    Pilih User
                  </label>
                  <select
                    value={formData.users_id}
                    onChange={(e) =>
                      setFormData({ ...formData, users_id: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 border border-[#d1d5db] rounded-md focus:border-[#6B3E1D] text-sm"
                    required
                  >
                    <option value={0}>-- Pilih User --</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B3E1D] mb-1">
                    Items
                  </label>
                  <input
                    type="text"
                    value={formData.items}
                    onChange={(e) =>
                      setFormData({ ...formData, items: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-[#d1d5db] rounded-md focus:border-[#6B3E1D] text-sm"
                    placeholder="Nama items"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B3E1D] mb-1">
                    Jumlah Item
                  </label>
                  <input
                    type="number"
                    value={formData.totalItem}
                    onChange={(e) =>
                      setFormData({ ...formData, totalItem: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 border border-[#d1d5db] rounded-md focus:border-[#6B3E1D] text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B3E1D] mb-1">
                    Total Transaksi (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.totalTransaction}
                    onChange={(e) =>
                      setFormData({ ...formData, totalTransaction: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 border border-[#d1d5db] rounded-md focus:border-[#6B3E1D] text-sm"
                    placeholder="0"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Poin akan dihitung otomatis berdasarkan rasio poin yang aktif
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-white border-[#6B3E1D] text-[#6B3E1D] hover:bg-[#f3e7d1]"
                  >
                    Tambahkan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1 border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
