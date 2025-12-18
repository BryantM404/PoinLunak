'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

export default function PointRatioPage() {
  const [ratio, setRatio] = useState('');
  const router = useRouter();

  const numericRatio = Number(ratio);

  const handleSave = async () => {
    if (isNaN(numericRatio) || numericRatio <= 0) {
      toast.error('Rasio harus berupa angka lebih dari 0');
      return;
    }

    const res = await fetch('/api/admin/point-ratio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ratio: numericRatio }),
    });

    if (!res.ok) {
      toast.error('Gagal menyimpan rasio');
      return;
    }

    toast.success('Rasio poin berhasil diperbarui');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Pengaturan Rasio Poin
          </h1>
          <p className="text-sm text-gray-600">
            Tentukan konversi transaksi menjadi poin member
          </p>
        </div>

        <Card className="bg-white text-gray-900 shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">
              Rasio Poin
            </CardTitle>
            <p className="text-sm text-gray-600">
              Contoh: <span className="font-mono">0.01</span> → Rp100 menghasilkan 1 poin
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">
                Nilai Rasio
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                placeholder="contoh: 0.01"
                className="
                  w-full rounded-md border border-gray-300
                  px-3 py-2 text-sm text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-[#6B3E1D]
                  bg-white
                "
              />

              {!isNaN(numericRatio) && numericRatio > 0 && (
                <p className="text-xs text-gray-600">
                  Preview: Rp100.000 →{' '}
                  <span className="font-semibold text-gray-800">
                    {(100_000 * numericRatio).toFixed(0)} poin
                  </span>
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700"
                onClick={() => router.back()}
              >
                Kembali
              </Button>

              <Button className="bg-[#6B3E1D] hover:bg-[#5a3317] text-white" onClick={handleSave}>
                Simpan Perubahan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
