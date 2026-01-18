'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading';

interface RewardItem {
  id: number;
  name: string;
  description: string | null;
  points_required: number;
  stock: number;
  validity_days: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

// Riwayat penukaran poin jadi voucher
interface VoucherExchange {
  id: number;
  users_id: number;
  userName: string;
  userEmail: string;
  rewardName: string;
  pointsRequired: number;
  code: string;
  status: string;
  exchanged_at: string;
  expires_at: string;
}

// Riwayat penggunaan voucher
interface VoucherUsage {
  id: number;
  users_id: number;
  userName: string;
  userEmail: string;
  rewardName: string;
  pointsRequired: number;
  code: string;
  redeemed_at: string;
  transaction_ref: string | null;
}

type TabType = 'catalog' | 'history';

export default function AdminRewardsClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const [rewardItems, setRewardItems] = useState<RewardItem[]>([]);
  const [voucherExchanges, setVoucherExchanges] = useState<VoucherExchange[]>([]);
  const [voucherUsages, setVoucherUsages] = useState<VoucherUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [exchangePage, setExchangePage] = useState(1);
  const [usagePage, setUsagePage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: 0,
    stock: 0,
    validity_days: 30,
    status: 'ACTIVE',
  });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchRewardItems();
    fetchHistory();
  }, []);

  const fetchRewardItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/rewards');
      const data = await response.json();

      if (data.success) {
        // Sort by ID ascending
        const sorted = data.data.sort((a: RewardItem, b: RewardItem) => a.id - b.id);
        setRewardItems(sorted);
      } else {
        toast.error(data.error || 'Gagal memuat reward items');
      }
    } catch (error) {
      console.error('Fetch reward items error:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/admin/rewards/history');
      const data = await response.json();

      if (data.success) {
        // Set exchange history (penukaran poin jadi voucher)
        setVoucherExchanges(data.data.exchanges || []);
        // Set usage history (penggunaan voucher)
        setVoucherUsages(data.data.usages || []);
      }
    } catch (error) {
      console.error('Fetch history error:', error);
    }
  };

  const handleOpenModal = (item?: RewardItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        description: item.description || '',
        points_required: item.points_required,
        stock: item.stock,
        validity_days: item.validity_days || 30,
        status: item.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        points_required: 0,
        stock: 0,
        validity_days: 30,
        status: 'ACTIVE',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      points_required: 0,
      stock: 0,
      validity_days: 30,
      status: 'ACTIVE',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.points_required === 0 || formData.stock < 0 || formData.validity_days < 1) {
      toast.error('Semua field harus diisi dengan benar');
      return;
    }

    try {
      const url = editingId
        ? `/api/admin/rewards/${editingId}`
        : '/api/admin/rewards';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || (editingId ? 'Reward berhasil diperbarui' : 'Reward berhasil ditambahkan'));
        handleCloseModal();
        await fetchRewardItems();
      } else {
        toast.error(data.error || 'Gagal menyimpan reward');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleToggleStatus = async (item: RewardItem) => {
    const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const response = await fetch(`/api/admin/rewards/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...item,
          status: newStatus 
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        await fetchRewardItems();
      } else {
        toast.error(data.error || 'Gagal mengubah status reward');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  // Filter rewards
  const filteredItems = rewardItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f9]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f9]">
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Title with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
            onClick={() => router.back()}
          >
            ← Kembali
          </Button>
          <h1 className="text-3xl font-bold text-[#6B3E1D]">Kelola Reward</h1>
        </div>

        {/* Tab Navigation and Add Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`py-3 px-6 font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'text-[#6B3E1D] border-b-2 border-[#6B3E1D]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Item Reward Tersedia
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-6 font-semibold transition-all ${
                activeTab === 'history'
                  ? 'text-[#6B3E1D] border-b-2 border-[#6B3E1D]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📜 Riwayat Penebusan
            </button>
              <div className="flex justify-between items-center">
                <Input
                  type="text"
                  placeholder="Cari reward..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="max-w-xs"
                />
              </div>
          </div>
          
          {activeTab === 'catalog' && (
            <Button
              className="bg-white border-[#6B3E1D] text-[#6B3E1D] hover:bg-[#f3e7d1]"
              onClick={() => handleOpenModal()}
            >
              Tambah Reward
            </Button>
          )}
        </div>

        {/* Tab Content - Reward Items Catalog */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            

            <Card>
              <CardHeader>
                <CardTitle>Daftar Item Reward ({filteredItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {paginatedItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      {filteredItems.length === 0 && rewardItems.length === 0 ? 'Belum ada reward' : 'Tidak ada hasil pencarian'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left">ID</th>
                          <th className="text-left">Nama Reward</th>
                          <th className="text-left">Deskripsi</th>
                          <th className="text-right">Poin</th>
                          <th className="text-center">Stok</th>
                          <th className="text-center">Masa Berlaku</th>
                          <th className="text-left">Status</th>
                          <th className="text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map((item) => (
                          <tr key={item.id}>
                            <td className="font-semibold">{item.id}</td>
                            <td className="font-medium text-[#6B3E1D]">{item.name}</td>
                            <td className="text-sm text-gray-600">{item.description || '-'}</td>
                            <td className="text-right font-semibold text-[#DDBA72]">
                              {item.points_required.toLocaleString()}
                            </td>
                            <td className="text-center">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                item.stock === 0 
                                  ? 'bg-red-100 text-red-800' 
                                  : item.stock <= 5 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-blue-100 text-blue-800'
                              }`}>
                                {item.stock}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                {item.validity_days} hari
                              </span>
                            </td>
                            <td>
                              <span
                                className={`px-3 py-1 text-sm rounded-md ${
                                  item.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="text-center flex justify-center flex-wrap gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="px-3 py-1 text-xs border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                                onClick={() => handleOpenModal(item)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`px-3 py-1 text-xs border ${item.status === 'ACTIVE' ? 'border-orange-600 text-orange-600 bg-white hover:bg-orange-50' : 'border-green-600 text-green-600 bg-white hover:bg-green-50'}`}
                                onClick={() => handleToggleStatus(item)}
                              >
                                {item.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Halaman {currentPage} dari {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                      >
                        ← Sebelumnya
                      </Button>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={
                              currentPage === page
                                ? 'bg-[#6B3E1D] text-white'
                                : 'border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]'
                            }
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                      >
                        Selanjutnya →
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Content - Redemption History */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Riwayat Penukaran Poin jadi Voucher */}
            {(() => {
              const HISTORY_PER_PAGE = 10;
              const exchangeTotalPages = Math.ceil(voucherExchanges.length / HISTORY_PER_PAGE);
              const paginatedExchanges = voucherExchanges.slice(
                (exchangePage - 1) * HISTORY_PER_PAGE,
                exchangePage * HISTORY_PER_PAGE
              );
              return (
                <Card>
                  <CardHeader>
                    <CardTitle>📥 Riwayat Penukaran Poin → Voucher ({voucherExchanges.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {voucherExchanges.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Belum ada penukaran poin</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-2">ID</th>
                                <th className="text-left py-3 px-2">Member</th>
                                <th className="text-left py-3 px-2">Voucher</th>
                                <th className="text-right py-3 px-2">Poin</th>
                                <th className="text-left py-3 px-2">Kode</th>
                                <th className="text-left py-3 px-2">Status</th>
                                <th className="text-left py-3 px-2">Tanggal Tukar</th>
                                <th className="text-left py-3 px-2">Kedaluwarsa</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedExchanges.map((exchange) => (
                                <tr key={exchange.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-2 font-semibold">#{exchange.id}</td>
                                  <td className="py-3 px-2">
                                    <div>
                                      <p className="font-medium text-[#6B3E1D]">{exchange.userName}</p>
                                      <p className="text-xs text-gray-500">{exchange.userEmail}</p>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2">{exchange.rewardName}</td>
                                  <td className="py-3 px-2 text-right font-semibold text-[#DDBA72]">
                                    {exchange.pointsRequired.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-2 text-sm font-mono bg-gray-50 rounded">{exchange.code}</td>
                                  <td className="py-3 px-2">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        exchange.status === 'REDEEMED'
                                          ? 'bg-blue-100 text-blue-800'
                                          : exchange.status === 'ACTIVE'
                                          ? 'bg-green-100 text-green-800'
                                          : exchange.status === 'EXPIRED'
                                          ? 'bg-gray-100 text-gray-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}
                                    >
                                      {exchange.status === 'REDEEMED' ? 'Sudah Digunakan' : 
                                       exchange.status === 'ACTIVE' ? 'Aktif' :
                                       exchange.status === 'EXPIRED' ? 'Kedaluwarsa' : exchange.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 text-sm">
                                    {new Date(exchange.exchanged_at).toLocaleDateString('id-ID', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </td>
                                  <td className="py-3 px-2 text-sm">
                                    {new Date(exchange.expires_at).toLocaleDateString('id-ID', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {/* Pagination for Exchange */}
                        {exchangeTotalPages > 1 && (
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                              Menampilkan {(exchangePage - 1) * HISTORY_PER_PAGE + 1} - {Math.min(exchangePage * HISTORY_PER_PAGE, voucherExchanges.length)} dari {voucherExchanges.length}
                            </p>
                            <div className="flex gap-2 items-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExchangePage((p) => Math.max(1, p - 1))}
                                disabled={exchangePage === 1}
                                className="border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                              >
                                ←
                              </Button>
                              <span className="text-sm text-gray-600">
                                {exchangePage} / {exchangeTotalPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExchangePage((p) => Math.min(exchangeTotalPages, p + 1))}
                                disabled={exchangePage === exchangeTotalPages}
                                className="border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                              >
                                →
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Riwayat Penggunaan Voucher */}
            {(() => {
              const HISTORY_PER_PAGE = 10;
              const usageTotalPages = Math.ceil(voucherUsages.length / HISTORY_PER_PAGE);
              const paginatedUsages = voucherUsages.slice(
                (usagePage - 1) * HISTORY_PER_PAGE,
                usagePage * HISTORY_PER_PAGE
              );
              return (
                <Card>
                  <CardHeader>
                    <CardTitle>📤 Riwayat Penggunaan Voucher ({voucherUsages.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {voucherUsages.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Belum ada voucher yang digunakan</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-2">ID</th>
                                <th className="text-left py-3 px-2">Member</th>
                                <th className="text-left py-3 px-2">Voucher</th>
                                <th className="text-left py-3 px-2">Kode</th>
                                <th className="text-left py-3 px-2">Tanggal Penggunaan</th>
                                <th className="text-left py-3 px-2">Ref. Transaksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedUsages.map((usage) => (
                                <tr key={usage.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-2 font-semibold">#{usage.id}</td>
                                  <td className="py-3 px-2">
                                    <div>
                                      <p className="font-medium text-[#6B3E1D]">{usage.userName}</p>
                                      <p className="text-xs text-gray-500">{usage.userEmail}</p>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2">{usage.rewardName}</td>
                                  <td className="py-3 px-2 text-sm font-mono bg-gray-50 rounded">{usage.code}</td>
                                  <td className="py-3 px-2 text-sm">
                                    {new Date(usage.redeemed_at).toLocaleDateString('id-ID', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </td>
                                  <td className="py-3 px-2 text-sm text-gray-500">{usage.transaction_ref || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {/* Pagination for Usage */}
                        {usageTotalPages > 1 && (
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                              Menampilkan {(usagePage - 1) * HISTORY_PER_PAGE + 1} - {Math.min(usagePage * HISTORY_PER_PAGE, voucherUsages.length)} dari {voucherUsages.length}
                            </p>
                            <div className="flex gap-2 items-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setUsagePage((p) => Math.max(1, p - 1))}
                                disabled={usagePage === 1}
                                className="border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                              >
                                ←
                              </Button>
                              <span className="text-sm text-gray-600">
                                {usagePage} / {usageTotalPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setUsagePage((p) => Math.min(usageTotalPages, p + 1))}
                                disabled={usagePage === usageTotalPages}
                                className="border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                              >
                                →
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Reward Item' : 'Tambah Reward Item Baru'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nama Reward"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Voucher Diskon 10%"
                  required
                />
                <Input
                  label="Deskripsi (Opsional)"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi singkat reward"
                />
                <Input
                  label="Poin Dibutuhkan"
                  type="number"
                  value={formData.points_required}
                  onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  required
                />
                <Input
                  label="Stok"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  required
                />
                <Input
                  label="Masa Berlaku (hari)"
                  type="number"
                  value={formData.validity_days}
                  onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) || 30 })}
                  placeholder="30"
                  required
                />
                <div>
                  <label className="block text-xs font-medium text-[#875600] mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#d1d5db] rounded-md focus:border-[#875600] text-sm"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Nonaktif</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-white border-[#6B3E1D] text-[#6B3E1D] hover:bg-[#f3e7d1]"
                  >
                    Simpan
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
