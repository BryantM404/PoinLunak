'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoucherCard } from '@/components/voucher-card';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { SafeUser, Transaction, Reward } from '@/lib/types';

type SerializedUser = Omit<SafeUser, 'join_date' | 'created_at'> & {
  join_date: string | null;
  created_at: string;
};

type SerializedTransaction = Omit<Transaction, 'created_at'> & {
  created_at: string;
};

type SerializedRewardItem = {
  id: number;
  name: string;
  description: string | null;
  points_required: number;
  status: string | null;
  created_at: string;
  updated_at: string;
};

type SerializedReward = {
  id: number;
  points_required: number;
  status: string | null;
  code: string | null;
  created_at: string;
  exchanged_at: string;
  expires_at: string;
  users_id: number;
  reward_item_id: number;
  reward_item: SerializedRewardItem | null;
};

interface Props {
  user: SerializedUser;
  transactions: SerializedTransaction[];
  rewards: SerializedReward[];
}

type TabType = 'available' | 'myVouchers' | 'history';

export default function MemberDashboardClient({
  user,
  transactions,
  rewards,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('available');
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userRewards, setUserRewards] = useState(rewards);
  const [userPoints, setUserPoints] = useState(user.points);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCatalog = async () => {
    if (catalog.length > 0) return; // Already loaded
    setLoadingCatalog(true);
    try {
      const response = await fetch('/api/rewards/catalog');
      const data = await response.json();
      if (data.success) {
        setCatalog(data.data);
      }
    } catch (error) {
      console.error('Fetch catalog error:', error);
      toast.error('Gagal memuat katalog voucher');
    } finally {
      setLoadingCatalog(false);
    }
  };

  const fetchUserRewards = async () => {
    try {
      const response = await fetch('/api/rewards/user');
      const data = await response.json();
      if (data.success) {
        setUserRewards(data.data);
      }
    } catch (error) {
      console.error('Fetch user rewards error:', error);
    }
  };

  // Load catalog on component mount
  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleRedeem = async (rewardId: number, requiredPoints: number, rewardName: string) => {
    if (userPoints < requiredPoints) {
      toast.error('Poin tidak cukup!');
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Konfirmasi Penukaran',
      html: `
        <div class="text-left">
          <p class="mb-2">Apakah Anda yakin ingin menukar poin untuk:</p>
          <p class="font-bold text-lg text-amber-700">${rewardName}</p>
          <div class="mt-4 p-3 bg-amber-50 rounded-lg">
            <p class="text-sm text-gray-600">Poin yang akan digunakan:</p>
            <p class="text-2xl font-bold text-amber-600">${requiredPoints.toLocaleString()} Poin</p>
          </div>
          <p class="mt-3 text-sm text-gray-500">Sisa poin setelah penukaran: <strong>${(userPoints - requiredPoints).toLocaleString()}</strong></p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6B3E1D',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Ya, Tukar Sekarang',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users_id: user.id,
          reward_id: rewardId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          title: 'Berhasil!',
          html: `<p>Voucher <strong>${rewardName}</strong> berhasil ditukar!</p><p class="mt-2 text-sm text-gray-600">Cek voucher Anda di tab "Voucher Saya"</p>`,
          icon: 'success',
          confirmButtonColor: '#6B3E1D',
          confirmButtonText: 'Lihat Voucher Saya',
        });
        // Deduct points locally
        setUserPoints(prev => prev - requiredPoints);
        // Refetch user rewards
        await fetchUserRewards();
        setActiveTab('myVouchers');
      } else {
        toast.error(data.error || 'Gagal menukar voucher');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'available') {
      fetchCatalog();
    }
  };

  // Handle voucher status change
  const handleVoucherStatusChange = (id: number, newStatus: string) => {
    setUserRewards(prev => 
      prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
    );
  };

  // Filter vouchers
  const activeVouchers = userRewards.filter(r => r.status === 'ACTIVE');
  const usedVouchers = userRewards.filter(r => r.status === 'USED');
  const expiredVouchers = userRewards.filter(r => r.status === 'EXPIRED');

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* User Info Card */}
        <Card className="bg-gradient-to-r from-[#DDBA72] to-[#c9a860]">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-[#6B3E1D]">
                <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
                <p className="text-lg mb-1">{user.email}</p>
                <p className="text-sm opacity-80">Member sejak {mounted ? new Date(user.join_date || user.created_at).toLocaleDateString('id-ID') : 'loading...'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#6B3E1D] mb-1">Total Poin</p>
                <p className="text-5xl font-bold text-[#6B3E1D]">
                  {mounted ? userPoints.toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-2 flex gap-2">
          <button
            onClick={() => handleTabChange('available')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'available'
                ? 'bg-[#6B3E1D] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Voucher Tersedia
          </button>
          <button
            onClick={() => handleTabChange('myVouchers')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'myVouchers'
                ? 'bg-[#6B3E1D] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Voucher Saya
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-[#6B3E1D] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Riwayat Transaksi
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'available' && (
          <Card>
            <CardHeader>
              <CardTitle>Voucher Tersedia untuk Ditukar</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Poin Anda saat ini: <span className="font-bold text-[#6B3E1D]">{userPoints.toLocaleString()}</span>
              </p>
            </CardHeader>
            <CardContent>
              {loadingCatalog ? (
                <p className="text-center py-8">Memuat katalog voucher...</p>
              ) : catalog.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Belum ada voucher tersedia
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catalog.map((reward) => {
                    const canAfford = userPoints >= reward.points;
                    return (
                      <Card
                        key={reward.id}
                        className={!canAfford ? 'opacity-60 border-2' : 'border-2 border-[#DDBA72]'}
                      >
                        <CardContent className="pt-6">
                          <div className="text-center mb-4">
                            <div className="text-6xl mb-3">🎁</div>
                            <h3 className="font-bold text-lg text-[#6B3E1D] mb-2">
                              {reward.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {reward.description}
                            </p>
                            <p className="text-2xl font-bold text-[#DDBA72]">
                              {reward.points.toLocaleString()} Poin
                            </p>
                            <div className="flex justify-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                reward.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                Stok: {reward.stock}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                                Berlaku {reward.validity_days} hari
                              </span>
                            </div>
                          </div>
                          <Button
                            variant={canAfford ? 'primary' : 'outline'}
                            className={canAfford ? 'w-full bg-white border-[#6B3E1D] text-[#6B3E1D] hover:bg-[#f3e7d1] hover:border-[#DDBA72]' : 'w-full bg-white border-[#6B3E1D] text-[#6B3E1D] opacity-60'}
                            onClick={() => handleRedeem(reward.id, reward.points, reward.name)}
                            disabled={!canAfford}
                          >
                            {canAfford ? 'Tukar Sekarang' : 'Poin Tidak Cukup'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'myVouchers' && (
          <div className="space-y-6">
            {/* Active Vouchers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">Voucher Aktif</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Voucher yang dapat digunakan</p>
              </CardHeader>
              <CardContent>
                {activeVouchers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Belum ada voucher aktif. Tukar poin untuk mendapatkan voucher!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeVouchers.map((reward) => (
                      <VoucherCard 
                        key={reward.id} 
                        reward={reward}
                        onStatusChange={handleVoucherStatusChange}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Used Vouchers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-600">Voucher Terpakai</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Voucher yang sudah digunakan</p>
              </CardHeader>
              <CardContent>
                {usedVouchers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Belum ada voucher yang digunakan
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {usedVouchers.map((reward) => (
                      <VoucherCard 
                        key={reward.id} 
                        reward={reward}
                        onStatusChange={handleVoucherStatusChange}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expired Vouchers */}
            {expiredVouchers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Voucher Kadaluarsa</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Voucher yang sudah tidak berlaku</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {expiredVouchers.map((reward) => (
                      <VoucherCard 
                        key={reward.id} 
                        reward={reward}
                        onStatusChange={handleVoucherStatusChange}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transaksi</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Lihat bagaimana Anda mendapatkan poin</p>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Belum ada transaksi
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="font-semibold text-[#6B3E1D] text-lg">
                          {formatCurrency(Number(t.total_transaction))}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t.total_item} item
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(t.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#DDBA72]">
                          +{t.points_gained}
                        </p>
                        <p className="text-xs text-gray-600">poin</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
