// Member Dashboard Client Component

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoucherCard } from '@/components/voucher-card';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { SafeUser, Transaction, Reward } from '@/lib/types';

// Serialized types for client components (dates as strings)
type SerializedUser = Omit<SafeUser, 'join_date' | 'created_at'> & {
  join_date: string | null;
  created_at: string;
};

type SerializedTransaction = Omit<Transaction, 'created_at'> & {
  created_at: string;
};

type SerializedReward = Omit<Reward, 'created_at' | 'redeemed_at'> & {
  created_at: string;
  redeemed_at: string | null;
};

interface Props {
  user: SerializedUser;
  transactions: SerializedTransaction[];
  rewards: SerializedReward[];
}

export default function MemberDashboardClient({
  user,
  transactions,
  rewards,
}: Props) {
  const router = useRouter();
  const [showRewardCatalog, setShowRewardCatalog] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logout berhasil');
      router.push('/login');
    } catch (error) {
      toast.error('Gagal logout');
    }
  };

  const getMembershipLevelColor = (level: string | null) => {
    switch (level) {
      case 'GOLD':
        return 'bg-yellow-400 text-yellow-900';
      case 'SILVER':
        return 'bg-gray-300 text-gray-800';
      default:
        return 'bg-amber-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#6B3E1D] text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Poin Lunak Membership</h1>
            <p className="text-sm opacity-90">Selamat datang, {user.name}!</p>
          </div>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* User Info Card */}
        <Card className="bg-gradient-to-r from-[#DDBA72] to-[#c9a860]">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="text-[#6B3E1D]">
                <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
                <p className="text-lg mb-1">{user.email}</p>
                {user.phone && <p className="text-sm">📱 {user.phone}</p>}
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-4 py-2 rounded-full font-bold ${getMembershipLevelColor(
                    user.membership_level
                  )}`}
                >
                  {user.membership_level || 'BRONZE'}
                </span>
                <div className="mt-4">
                  <p className="text-sm text-[#6B3E1D]">Total Poin</p>
                  <p className="text-4xl font-bold text-[#6B3E1D]">
                    {user.points.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="primary"
            className="w-full py-6 text-lg"
            onClick={() => setShowRewardCatalog(true)}
          >
            🎁 Tukar Poin
          </Button>
          <Button
            variant="outline"
            className="w-full py-6 text-lg"
            onClick={() => router.push('/member/profile')}
          >
            👤 Edit Profil
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transaksi Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Belum ada transaksi
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-[#6B3E1D]">
                          {formatCurrency(Number(t.total_transaction))}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t.total_item} item
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(t.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#DDBA72]">
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

          {/* Vouchers */}
          <Card>
            <CardHeader>
              <CardTitle>Voucher Saya</CardTitle>
            </CardHeader>
            <CardContent>
              {rewards.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Belum ada voucher. Tukar poin untuk mendapatkan voucher!
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {rewards.map((reward) => (
                    <VoucherCard 
                      key={reward.id} 
                      reward={{
                        ...reward,
                        created_at: new Date(reward.created_at),
                        redeemed_at: reward.redeemed_at ? new Date(reward.redeemed_at) : null
                      }} 
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Reward Catalog Modal */}
      {showRewardCatalog && (
        <RewardCatalogModal
          userId={user.id}
          currentPoints={user.points}
          onClose={() => setShowRewardCatalog(false)}
        />
      )}
    </div>
  );
}

// Reward Catalog Modal
function RewardCatalogModal({
  userId,
  currentPoints,
  onClose,
}: {
  userId: number;
  currentPoints: number;
  onClose: () => void;
}) {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useState(() => {
    fetchCatalog();
  });

  const fetchCatalog = async () => {
    try {
      const response = await fetch('/api/rewards/catalog');
      const data = await response.json();
      if (data.success) {
        setCatalog(data.data);
      }
    } catch (error) {
      console.error('Fetch catalog error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId: number, requiredPoints: number) => {
    if (currentPoints < requiredPoints) {
      toast.error('Poin tidak cukup!');
      return;
    }

    try {
      const response = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users_id: userId,
          reward_id: rewardId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Voucher berhasil ditukar! 🎉');
        router.refresh();
        onClose();
      } else {
        toast.error(data.error || 'Gagal menukar voucher');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#6B3E1D]">Katalog Reward</h2>
            <Button variant="outline" onClick={onClose}>
              ✕ Tutup
            </Button>
          </div>

          <div className="mb-4 p-4 bg-[#DDBA72]/20 rounded-lg">
            <p className="text-center text-[#6B3E1D]">
              Poin Anda: <span className="font-bold text-2xl">{currentPoints}</span>
            </p>
          </div>

          {loading ? (
            <p className="text-center py-8">Memuat...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {catalog.map((reward) => {
                const canAfford = currentPoints >= reward.points;
                return (
                  <Card
                    key={reward.id}
                    className={!canAfford ? 'opacity-60' : ''}
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
                          {reward.points} Poin
                        </p>
                      </div>
                      <Button
                        variant={canAfford ? 'primary' : 'outline'}
                        className="w-full"
                        onClick={() => handleRedeem(reward.id, reward.points)}
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
        </div>
      </div>
    </div>
  );
}
