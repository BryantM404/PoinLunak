// GET /api/admin/rewards/history - Get exchange and usage history

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }

    // Get all voucher exchanges (rewards table - when user exchanges points for voucher)
    const voucherExchanges = await prisma.rewards.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reward_item: {
          select: {
            id: true,
            name: true,
            points_required: true,
          },
        },
      },
      orderBy: {
        exchanged_at: 'desc',
      },
    });

    // Get all voucher usages (redemption_history table - when user uses the voucher)
    const voucherUsages = await prisma.redemption_history.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reward: {
          include: {
            reward_item: {
              select: {
                id: true,
                name: true,
                points_required: true,
              },
            },
          },
        },
      },
      orderBy: {
        redeemed_at: 'desc',
      },
    });

    // Format exchange history (penukaran poin jadi voucher)
    const formattedExchanges = voucherExchanges.map((exchange) => ({
      id: exchange.id,
      users_id: exchange.users_id,
      userName: exchange.user?.name || 'Unknown',
      userEmail: exchange.user?.email || 'Unknown',
      rewardName: exchange.reward_item?.name || 'Unknown',
      pointsRequired: exchange.reward_item?.points_required || 0,
      code: exchange.code,
      status: exchange.status,
      exchanged_at: exchange.exchanged_at,
      expires_at: exchange.expires_at,
    }));

    // Format usage history (penggunaan voucher)
    const formattedUsages = voucherUsages.map((usage) => ({
      id: usage.id,
      users_id: usage.users_id,
      userName: usage.user?.name || 'Unknown',
      userEmail: usage.user?.email || 'Unknown',
      rewardName: usage.reward?.reward_item?.name || 'Unknown',
      pointsRequired: usage.reward?.reward_item?.points_required || 0,
      code: usage.reward?.code || 'Unknown',
      redeemed_at: usage.redeemed_at,
      transaction_ref: usage.transaction_ref,
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          exchanges: formattedExchanges,
          usages: formattedUsages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get redemption history error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
