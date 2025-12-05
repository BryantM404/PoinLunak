// Voucher card with QR code display

'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Reward } from '@/lib/types';

interface VoucherCardProps {
  reward: Reward;
}

export function VoucherCard({ reward }: VoucherCardProps) {
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = async () => {
    if (!reward.code) return;

    try {
      await navigator.clipboard.writeText(reward.code);
      toast.success('Kode voucher berhasil disalin!');
    } catch (error) {
      toast.error('Gagal menyalin kode voucher');
    }
  };

  const isUsed = reward.status === 'used';

  return (
    <Card className={`${isUsed ? 'opacity-60' : ''}`}>
      <CardHeader>
        <CardTitle className="text-lg">{reward.reward_name}</CardTitle>
        <p className="text-sm text-gray-600">
          {reward.points_required} poin
        </p>
      </CardHeader>
      <CardContent>
        {showQR && reward.code ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-[#DDBA72]">
              <QRCode
                value={reward.code}
                size={200}
                className="mx-auto"
                fgColor="#6B3E1D"
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Kode Voucher:</p>
              <p className="font-mono font-bold text-lg text-[#6B3E1D] mb-3">
                {reward.code}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex-1"
                >
                  📋 Salin Kode
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowQR(false)}
                  className="flex-1"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                isUsed 
                  ? 'bg-gray-200 text-gray-600' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {isUsed ? 'Sudah Digunakan' : 'Tersedia'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Ditukar pada: {new Date(reward.created_at).toLocaleDateString('id-ID')}
            </p>
            {!isUsed && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowQR(true)}
                className="w-full"
              >
                🎫 Pakai Voucher
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
