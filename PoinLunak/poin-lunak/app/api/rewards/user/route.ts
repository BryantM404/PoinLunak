// GET /api/rewards/user - Get current user's rewards/vouchers

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

    // Fetch user's rewards/vouchers
    const rewards = await prisma.rewards.findMany({
      where: { users_id: currentUser.id },
      include: {
        reward_item: {
          select: {
            id: true,
            name: true,
            description: true,
            points_required: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Format response
    const formattedRewards = rewards.map((reward) => ({
      id: reward.id,
      reward_item_id: reward.reward_item_id,
      users_id: reward.users_id,
      code: reward.code,
      status: reward.status,
      exchanged_at: reward.exchanged_at.toISOString(),
      expires_at: reward.expires_at.toISOString(),
      created_at: reward.created_at.toISOString(),
      reward_item: reward.reward_item,
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: formattedRewards,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user rewards error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
