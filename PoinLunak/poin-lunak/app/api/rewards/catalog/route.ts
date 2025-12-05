// GET /api/rewards/catalog - Get available rewards catalog

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Reward catalog
    const catalog = [
      {
        id: 1,
        name: 'Voucher Diskon 10%',
        description: 'Dapatkan diskon 10% untuk pembelian berikutnya',
        points: 1000,
        image: '/rewards/discount-10.png',
      },
      {
        id: 2,
        name: 'Voucher Diskon 20%',
        description: 'Dapatkan diskon 20% untuk pembelian berikutnya',
        points: 2500,
        image: '/rewards/discount-20.png',
      },
      {
        id: 3,
        name: 'Voucher Gratis 1 Porsi',
        description: 'Gratis 1 porsi ayam goreng tulang lunak',
        points: 5000,
        image: '/rewards/free-1.png',
      },
      {
        id: 4,
        name: 'Voucher Gratis 2 Porsi',
        description: 'Gratis 2 porsi ayam goreng tulang lunak',
        points: 10000,
        image: '/rewards/free-2.png',
      },
    ];

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: catalog,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get catalog error:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Terjadi kesalahan server',
      },
      { status: 500 }
    );
  }
}
