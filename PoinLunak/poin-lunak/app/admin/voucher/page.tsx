'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const dummyVouchers = [
  {
    id: 1,
    title: 'Diskon 10%',
    pointsRequired: 100,
    stock: 50,
    status: 'ACTIVE',
  },
  {
    id: 2,
    title: 'Gratis Ongkir',
    pointsRequired: 75,
    stock: 0,
    status: 'INACTIVE',
  },
];

export default function VoucherListPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
            <Button
            variant="outline"
            onClick={() => router.push('/admin/dashboard')}
            className="mt-1"
            >
            ← Kembali
            </Button>
        </div>
        <Button
            className="bg-[#6B3E1D] text-white hover:bg-[#5a3317]"
            onClick={() => router.push('/admin/voucher/create')}
        >
            + Tambah Voucher
        </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
            <div>
            <h1 className="text-2xl font-semibold text-gray-900">
                Voucher & Reward
            </h1>
            <p className="text-sm text-gray-600">
                Kelola voucher yang dapat ditukar oleh member
            </p>
            </div>
        </div>
        </div>
        

        {/* Voucher Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dummyVouchers.map((voucher) => (
            <Card key={voucher.id} className="bg-white shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg text-gray-900">
                  {voucher.title}
                </CardTitle>

                <span
                  className={`text-xs font-medium px-2 py-1 rounded w-fit
                    ${
                      voucher.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {voucher.status}
                </span>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    🎯 Poin dibutuhkan:{' '}
                    <span className="font-semibold">
                      {voucher.pointsRequired}
                    </span>
                  </p>
                  <p>
                    📦 Stok:{' '}
                    <span
                      className={`font-semibold ${
                        voucher.stock === 0 ? 'text-red-600' : ''
                      }`}
                    >
                      {voucher.stock}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      router.push(`/admin/voucher/[id]/edit`)
                    }
                  >
                    Edit
                  </Button>
                  <Button variant="danger" className="w-full">
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
