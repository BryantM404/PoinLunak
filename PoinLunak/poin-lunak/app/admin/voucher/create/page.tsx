'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CreateVoucherPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [points, setPoints] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">
              Tambah Voucher
            </CardTitle>
            <p className="text-sm text-gray-600">
              Voucher akan muncul di halaman penukaran member
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Nama */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-800">
                Nama Voucher
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="Contoh: Diskon 10%"
              />
            </div>

            {/* Poin */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-800">
                Poin Dibutuhkan
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="100"
              />
            </div>

            {/* Stok */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-800">
                Stok
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="50"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-800">
                Status Voucher
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')
                }
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Nonaktif</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Batal
              </Button>

              <Button className="bg-[#6B3E1D] text-white hover:bg-[#5a3317]">
                Simpan Voucher
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
