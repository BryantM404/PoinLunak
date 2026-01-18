// Voucher card with unique code display

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface RewardItem {
  id: number;
  name: string;
  description: string | null;
  points_required: number;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface VoucherReward {
  id: number;
  code: string | null;
  status: string | null;
  exchanged_at: string;
  expires_at: string;
  created_at: string;
  reward_item?: RewardItem | null;
  reward_item_id?: number;
  users_id?: number;
  // Legacy fields (for backward compatibility)
  reward_name?: string;
  points_required?: number;
}

interface VoucherCardProps {
  reward: VoucherReward;
  onStatusChange?: (id: number, newStatus: string) => void;
}

export function VoucherCard({ reward, onStatusChange }: VoucherCardProps) {
  const [localStatus, setLocalStatus] = useState(reward.status);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get reward name and points from reward_item or legacy fields
  const rewardName = reward.reward_item?.name || reward.reward_name || 'Unknown Reward';
  const pointsRequired = reward.reward_item?.points_required || reward.points_required || 0;

  const markVoucherAsUsed = async () => {
    try {
      const response = await fetch('/api/rewards/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_id: reward.id }),
      });

      const data = await response.json();
      
      if (data.success) {
        setLocalStatus('USED');
        if (onStatusChange) {
          onStatusChange(reward.id, 'USED');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking voucher as used:', error);
      return false;
    }
  };

  const handleShowCode = async () => {
    // If already used, don't allow clicking
    if (localStatus !== 'ACTIVE') {
      return;
    }

    setIsProcessing(true);

    // Step 1: Show warning dialog
    const warningResult = await Swal.fire({
      title: 'Peringatan',
      html: `
        <div class="text-left">
          <div class="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
            <p class="text-sm text-red-700"><strong>Perhatian:</strong> Setelah Anda menekan "Lanjutkan", kode voucher akan ditampilkan. Pastikan Anda sudah siap untuk menggunakan voucher ini di kasir.</p>
          </div>
          <div class="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
            <p class="font-bold text-lg text-amber-700">${rewardName}</p>
            <p class="text-sm text-gray-600 mt-1">${pointsRequired.toLocaleString()} poin</p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6B3E1D',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Lanjutkan',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    });

    if (!warningResult.isConfirmed) {
      setIsProcessing(false);
      return;
    }

    // Step 2: Show voucher code and wait for user to confirm usage
    const useResult = await Swal.fire({
      title: 'Kode Voucher Anda',
      html: `
        <div class="text-center">
          <div class="mb-4 p-4 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl border-2 border-amber-300 shadow-inner">
            <p class="text-xs text-gray-500 mb-2">KODE VOUCHER</p>
            <p class="font-mono font-bold text-3xl text-amber-800 tracking-widest select-all" id="voucher-code-display">${reward.code || 'N/A'}</p>
            <p class="text-xs text-gray-500 mt-3">Tunjukkan kode ini kepada kasir</p>
          </div>
          <div class="mb-4">
            <p class="font-semibold text-gray-700">${rewardName}</p>
            <p class="text-sm text-gray-500">${pointsRequired.toLocaleString()} poin</p>
          </div>
          <div class="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p class="text-sm text-yellow-700">Tekan <strong>"Sudah Dipakai"</strong> setelah kasir memverifikasi voucher</p>
          </div>
        </div>
      `,
      icon: undefined,
      showCancelButton: true,
      confirmButtonColor: '#16A34A',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Sudah Dipakai',
      cancelButtonText: 'Tutup (Belum Dipakai)',
      reverseButtons: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    setIsProcessing(false);

    // Step 3: If user confirmed "Sudah Dipakai", mark voucher as used
    if (useResult.isConfirmed) {
      const success = await markVoucherAsUsed();
      if (success) {
        await Swal.fire({
          title: 'Voucher Terpakai',
          html: `<p>Voucher <strong>${rewardName}</strong> telah ditandai sebagai sudah digunakan.</p>`,
          icon: 'success',
          confirmButtonColor: '#6B3E1D',
          confirmButtonText: 'OK',
        });
      } else {
        toast.error('Gagal menandai voucher sebagai terpakai');
      }
    }
    // If user clicked "Tutup (Belum Dipakai)" or closed the modal, voucher remains ACTIVE
  };

  // Support both uppercase (database) and lowercase (legacy) status values
  const status = localStatus?.toUpperCase();
  const isUsed = status === 'USED';
  const isExpired = status === 'EXPIRED' || (reward.expires_at && new Date(reward.expires_at) < new Date());
  const isAvailable = status === 'ACTIVE' && !isExpired;

  return (
    <Card className={`${isUsed || isExpired ? 'opacity-60 bg-gray-50' : 'border-2 border-[#DDBA72]'}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-[#6B3E1D]">{rewardName}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {pointsRequired.toLocaleString()} poin
            </p>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            isAvailable 
              ? 'bg-green-100 text-green-700' 
              : isUsed
              ? 'bg-gray-200 text-gray-600'
              : 'bg-red-100 text-red-700'
          }`}>
            {isAvailable ? 'Aktif' : isUsed ? 'Terpakai' : 'Kadaluarsa'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Ditukar pada: {new Date(reward.exchanged_at || reward.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            Berlaku sampai: {new Date(reward.expires_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
          {isAvailable && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleShowCode}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Memproses...' : 'Tampilkan Kode Voucher'}
            </Button>
          )}
          {isUsed && (
            <div>
              <Button
                variant="outline"
                size="sm"
                disabled={true}
                className="w-full mb-2 opacity-50 cursor-not-allowed"
              >
                Voucher Sudah Digunakan
              </Button>
              <p className="text-sm text-gray-500 italic text-center">
                Voucher ini sudah digunakan
              </p>
            </div>
          )}
          {isExpired && (
            <p className="text-sm text-red-500 italic text-center">
              Voucher ini sudah kadaluarsa
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
