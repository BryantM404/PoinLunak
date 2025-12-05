// POST /api/transactions - Create new transaction and award points

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { transactionSchema } from '@/lib/validations';
import { calculatePoints, getMembershipLevel } from '@/lib/utils';
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

    const body = await request.json();

    // Validate input
    const validatedData = transactionSchema.parse(body);

    // Calculate points: 1 point per 1000 rupiah (floored)
    const pointsGained = calculatePoints(validatedData.total_transaction);

    // Create transaction
    const transaction = await prisma.transactions.create({
      data: {
        users_id: validatedData.users_id,
        total_item: validatedData.total_item,
        total_transaction: validatedData.total_transaction,
        items: validatedData.items || null,
        points_gained: pointsGained,
      },
    });

    // Update user points and membership level
    const updatedUser = await prisma.users.update({
      where: { id: validatedData.users_id },
      data: {
        points: {
          increment: pointsGained,
        },
      },
    });

    // Determine and update membership level
    const newLevel = getMembershipLevel(updatedUser.points);
    if (newLevel !== updatedUser.membership_level) {
      await prisma.users.update({
        where: { id: validatedData.users_id },
        data: { membership_level: newLevel },
      });

      // Log membership level change
      await prisma.membership_logs.create({
        data: {
          users_id: validatedData.users_id,
          activity: `Naik ke level ${newLevel}`,
        },
      });
    }

    // Create membership log
    await prisma.membership_logs.create({
      data: {
        users_id: validatedData.users_id,
        activity: `Transaksi ${validatedData.total_transaction} - Dapat ${pointsGained} poin`,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          transaction,
          pointsGained,
          newTotalPoints: updatedUser.points + pointsGained,
        },
        message: 'Transaksi berhasil dicatat',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Transaction error:', error);

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

// GET /api/transactions - Get transactions with optional user filter
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

    const where = userId ? { users_id: parseInt(userId) } : {};

    const transactions = await prisma.transactions.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            points: true,
            membership_level: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: transactions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get transactions error:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Terjadi kesalahan server',
      },
      { status: 500 }
    );
  }
}
