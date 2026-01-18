// Admin Dashboard Client Component with Charts

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import type { AdminStats } from '@/lib/types';

export default function AdminDashboardClient() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [pointsRatio, setPointsRatio] = useState<{ amount: number; points: number; description: string } | null>(null);
  const [showRatioModal, setShowRatioModal] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchPointsRatio();
  }, []);

  const fetchPointsRatio = async () => {
    try {
      // Try to get ratio from localStorage first
      const stored = localStorage.getItem('pointsRatio');
      if (stored) {
        setPointsRatio(JSON.parse(stored));
      } else {
        // Initialize with default ratio if not exists
        const defaultRatio = { amount: 1000, points: 1, description: 'Rp 1.000 = 1 Poin' };
        setPointsRatio(defaultRatio);
        localStorage.setItem('pointsRatio', JSON.stringify(defaultRatio));
      }
    } catch (error) {
      console.error('Error loading points ratio:', error);
      setPointsRatio({ amount: 1000, points: 1, description: 'Rp 1.000 = 1 Poin' });
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        toast.error(data.error || 'Gagal memuat statistik');
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p>Gagal memuat data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Title with Back Button */}
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-[#6B3E1D]">Dashboard Admin</h1>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total User</p>
                <p className="text-3xl font-bold text-[#6B3E1D]">
                  {stats.totalUsers}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Transaksi</p>
                <p className="text-3xl font-bold text-[#6B3E1D]">
                  {stats.totalTransactions}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Poin Diterbitkan</p>
                <p className="text-3xl font-bold text-[#DDBA72]">
                  {stats.totalPointsIssued.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Poin Ditukar</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.totalPointsRedeemed.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transactions Per Day Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Transaksi Per Hari (30 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.transactionsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#DDBA72" name="Jumlah Transaksi" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Points Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Poin (30 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.pointsActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="issued"
                    stroke="#DDBA72"
                    name="Poin Diterbitkan"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="redeemed"
                    stroke="#EF4444"
                    name="Poin Ditukar"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Points Ratio Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#6B3E1D] mb-4">📈 Kelola Rasio Poin</h2>
          <PointsRatioSection pointsRatio={pointsRatio} onEditClick={() => setShowRatioModal(true)} onSave={fetchPointsRatio} />
        </div>

        {/* Menu Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#6B3E1D] mb-4">Menu Manajemen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              className="w-full bg-[#6B3E1D] text-white hover:bg-[#4e2710] py-6 text-lg"
              onClick={() => router.push('/admin/users')}
            >
              Kelola User
            </Button>
            <Button 
              className="w-full bg-[#6B3E1D] text-white hover:bg-[#4e2710] py-6 text-lg"
              onClick={() => router.push('/admin/transactions')}
            >
              Transaksi
            </Button>
            <Button 
              className="w-full bg-[#6B3E1D] text-white hover:bg-[#4e2710] py-6 text-lg"
              onClick={() => router.push('/admin/rewards')}
            >
              Reward
            </Button>
          </div>
        </div>
      </main>
      {showAdjustModal && (
        <PointAdjustmentModal onClose={() => setShowAdjustModal(false)} />
      )}
      {showRatioModal && (
        <PointsRatioModal 
          currentRatio={pointsRatio} 
          onClose={() => setShowRatioModal(false)} 
          onSave={fetchPointsRatio}
        />
      )}
    </div>
  );
}

function PointAdjustmentModal({ onClose }: { onClose: () => void }) {
  const [userId, setUserId] = useState('');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/points/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users_id: parseInt(userId),
          points: parseInt(points),
          reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        onClose();
      } else {
        toast.error(data.error || 'Gagal menyesuaikan poin');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sesuaikan Poin Manual</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Jumlah Poin (+ atau -)
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="contoh: 100 atau -50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alasan</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                className="flex-1 bg-[#DDBA72] border-[#DDBA72] text-[#6B3E1D] hover:bg-[#c9a860] hover:border-[#c9a860]"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function PointsRatioSection({ 
  pointsRatio, 
  onEditClick,
  onSave 
}: { 
  pointsRatio: { amount: number; points: number; description: string } | null;
  onEditClick: () => void;
  onSave: () => void;
}) {
  if (!pointsRatio) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-[#f3e7d1] rounded-lg">
            <div className="text-sm text-[#875600] font-medium mb-2">
              Jumlah Rupiah
            </div>
            <div className="text-3xl font-bold text-[#6B3E1D]">
              Rp {pointsRatio.amount.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="p-4 bg-[#f3e7d1] rounded-lg">
            <div className="text-sm text-[#875600] font-medium mb-2">
              Jumlah Poin
            </div>
            <div className="text-3xl font-bold text-[#6B3E1D]">
              {pointsRatio.points} Poin
            </div>
          </div>
        </div>

        {pointsRatio.description && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-1">
              Keterangan
            </div>
            <div className="text-blue-800">{pointsRatio.description}</div>
          </div>
        )}

        <div className="mt-6">
          <Button
            className="w-full bg-white border-[#6B3E1D] text-[#6B3E1D] hover:bg-[#f3e7d1]"
            onClick={onEditClick}
          >
            ✎ Edit Rasio Poin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PointsRatioModal({ 
  currentRatio, 
  onClose,
  onSave
}: { 
  currentRatio: { amount: number; points: number; description: string } | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [amount, setAmount] = useState(currentRatio?.amount.toString() || '');
  const [points, setPoints] = useState(currentRatio?.points.toString() || '');
  const [description, setDescription] = useState(currentRatio?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !points) {
      toast.error('Semua field harus diisi');
      return;
    }

    setLoading(true);

    try {
      const newRatio = {
        amount: parseFloat(amount),
        points: parseInt(points),
        description: description
      };

      localStorage.setItem('pointsRatio', JSON.stringify(newRatio));
      toast.success('Rasio poin berhasil diperbarui');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating ratio:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Rasio Poin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6B3E1D] mb-1">
                Jumlah Rupiah
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-md focus:border-[#6B3E1D] text-sm"
                placeholder="Contoh: 1000"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B3E1D] mb-1">
                Jumlah Poin
              </label>
              <input
                type="number"
                step="1"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-md focus:border-[#6B3E1D] text-sm"
                placeholder="Contoh: 1"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B3E1D] mb-1">
                Keterangan (Opsional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-md focus:border-[#6B3E1D] text-sm"
                placeholder="Contoh: Rp 1.000 = 1 poin"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-white border-[#6B3E1D] text-[#6B3E1D] hover:bg-[#f3e7d1]"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
