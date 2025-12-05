// POST /api/rewards/redeem - Redeem reward with voucher generation (Rate Limited)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redeemRewardSchema } from '@/lib/validations';
import { generateVoucherCode } from '@/lib/utils';
import { rateLimit } from '@/lib/rate-limit';
import type { ApiResponse } from '@/lib/types';

export async function POST(request: Request) {
  try {
    // Verify authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 5 redemptions per minute per user
    const rateLimitResult = await rateLimit(`redeem:${currentUser.id}`, {
      limit: 5,
      windowMs: 60000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Terlalu banyak permintaan. Coba lagi nanti.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = redeemRewardSchema.parse(body);

    // Get user current points
    const user = await prisma.users.findUnique({
      where: { id: validatedData.users_id },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get reward details (assuming rewards are predefined in a catalog)
    // For this implementation, we'll use a simple map
    const rewardCatalog = [
      { id: 1, name: 'Voucher Diskon 10%', points: 1000 },
      { id: 2, name: 'Voucher Diskon 20%', points: 2500 },
      { id: 3, name: 'Voucher Gratis 1 Porsi', points: 5000 },
      { id: 4, name: 'Voucher Gratis 2 Porsi', points: 10000 },
    ];

    const rewardInfo = rewardCatalog.find(r => r.id === validatedData.reward_id);

    if (!rewardInfo) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Reward tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if user has enough points
    if (user.points < rewardInfo.points) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Poin tidak cukup. Anda memiliki ${user.points} poin, diperlukan ${rewardInfo.points} poin.`,
        },
        { status: 400 }
      );
    }

    // Generate unique voucher code
    let voucherCode: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      voucherCode = generateVoucherCode();
      const existing = await prisma.rewards.findFirst({
        where: { code: voucherCode },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Gagal generate kode voucher. Coba lagi.' },
        { status: 500 }
      );
    }

    // Create reward record
    const reward = await prisma.rewards.create({
      data: {
        users_id: validatedData.users_id,
        reward_name: rewardInfo.name,
        points_required: rewardInfo.points,
        code: voucherCode!,
        status: 'available',
      },
    });

    // Deduct points from user
    await prisma.users.update({
      where: { id: validatedData.users_id },
      data: {
        points: {
          decrement: rewardInfo.points,
        },
      },
    });

    // Create membership log
    await prisma.membership_logs.create({
      data: {
        users_id: validatedData.users_id,
        activity: `Tukar ${rewardInfo.points} poin untuk ${rewardInfo.name}`,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: reward,
        message: 'Reward berhasil ditukar',
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Redeem reward error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.errors[0]?.message || 'Validasi gagal',
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Terjadi kesalahan server',
      },
      { status: 500 }
    );
  }
}

// GET /api/rewards/redeem - Get user's redeemed rewards
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    const rewards = await prisma.rewards.findMany({
      where: { users_id: parseInt(userId) },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: rewards,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get rewards error:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Terjadi kesalahan server',
      },
      { status: 500 }
    );
  }
}
