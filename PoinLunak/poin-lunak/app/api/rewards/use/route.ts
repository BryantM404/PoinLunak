// POST /api/rewards/use - Mark a voucher as used when code is revealed

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reward_id } = body;

    if (!reward_id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ID voucher diperlukan' },
        { status: 400 }
      );
    }

    // Find the reward and verify ownership
    const reward = await prisma.rewards.findUnique({
      where: { id: reward_id },
    });

    if (!reward) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Voucher tidak ditemukan' },
        { status: 404 }
      );
    }

    if (reward.users_id !== currentUser.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Anda tidak memiliki voucher ini' },
        { status: 403 }
      );
    }

    if (reward.status === 'USED') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Voucher sudah digunakan' },
        { status: 400 }
      );
    }

    if (reward.status === 'EXPIRED' || new Date(reward.expires_at) < new Date()) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Voucher sudah kadaluarsa' },
        { status: 400 }
      );
    }

    // Update reward status to USED
    const updatedReward = await prisma.rewards.update({
      where: { id: reward_id },
      data: { status: 'USED' },
      include: {
        reward_item: true,
      },
    });

    // Create redemption history record
    await prisma.redemption_history.create({
      data: {
        rewards_id: reward_id,
        users_id: currentUser.id,
        redeemed_at: new Date(),
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Voucher berhasil digunakan',
        data: {
          id: updatedReward.id,
          code: updatedReward.code,
          status: updatedReward.status,
          exchanged_at: updatedReward.exchanged_at.toISOString(),
          expires_at: updatedReward.expires_at.toISOString(),
          reward_item: updatedReward.reward_item,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Use voucher error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
