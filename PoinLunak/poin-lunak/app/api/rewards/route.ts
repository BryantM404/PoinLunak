import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get all rewards (exchanged vouchers) with user and reward_item information
    const rewards = await prisma.rewards.findMany({
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
        redemptions: true,
      },
      orderBy: {
        exchanged_at: 'desc',
      },
    });

    // Map to response format
    const mappedRewards = rewards.map((reward) => ({
      id: reward.id,
      reward_name: reward.reward_item?.name,
      points_required: reward.reward_item?.points_required,
      status: reward.status,
      code: reward.code,
      exchanged_at: reward.exchanged_at,
      expires_at: reward.expires_at,
      users_id: reward.users_id,
      userName: reward.user?.name,
      userEmail: reward.user?.email,
      created_at: reward.created_at,
      redemptions: reward.redemptions,
    }));

    return NextResponse.json({
      success: true,
      data: mappedRewards,
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
