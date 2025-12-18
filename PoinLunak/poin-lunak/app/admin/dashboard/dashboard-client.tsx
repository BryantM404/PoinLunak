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

  useEffect(() => {
    fetchStats();
  }, []);

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logout berhasil');
      router.push('/login');
    } catch (error) {
      toast.error('Gagal logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Gagal memuat data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#6B3E1D] text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard Admin - Poin Lunak</h1>
          <div className="flex gap-3">
            <Button
              className="bg-[#8B5A2B] hover:bg-[#A66A3F] text-white border-none"
              onClick={() => router.push('/admin/users')}
            >
              Kelola User
            </Button>

            <Button
              className="bg-[#8B5A2B] hover:bg-[#A66A3F] text-white border-none"
              onClick={() => router.push('/admin/transactions')}
            >
              Transaksi
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
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
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Rasio Poin</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Rasio poin per transaksi
              </p>
              <p className="text-2xl font-bold text-[#6B3E1D]">
                {/* {stats.pointRatio} */}
              </p>
            </div>

            <Button
              className="bg-[#8B5A2B] hover:bg-[#A66A3F] text-white"
              onClick={() => router.push('/admin/point-ratio')}
            >
              Ubah Rasio
            </Button>
          </CardContent>
        </Card>
      </main>
      {showAdjustModal && (
        <PointAdjustmentModal onClose={() => setShowAdjustModal(false)} />
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
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
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
