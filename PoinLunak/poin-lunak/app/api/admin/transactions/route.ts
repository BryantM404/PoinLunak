// GET /api/admin/transactions - Get all transactions with user info
// POST /api/admin/transactions - Create new transaction with automatic poin calculation

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';
import { z } from 'zod';

const createTransactionSchema = z.object({
  users_id: z.number(),
  items: z.string().optional(),
  total_item: z.number(),
  total_transaction: z.number(),
});

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

    // Get all transactions with user info, ordered by id descending
    const transactions = await prisma.transactions.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    // Transform data
    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      userId: tx.users_id,
      userName: tx.user?.name || 'Unknown',
      userEmail: tx.user?.email || 'Unknown',
      totalItem: tx.total_item,
      totalTransaction: tx.total_transaction,
      pointsGained: tx.points_gained,
      items: tx.items,
      createdAt: tx.created_at,
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: formattedTransactions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();
    const validatedData = createTransactionSchema.parse(body);

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: validatedData.users_id },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get active points ratio for poin calculation
    // Note: Points ratio is now managed via localStorage in frontend
    // Using default: Rp 1.000 = 1 Poin
    const defaultRatioAmount = 1000;
    const defaultRatioPoints = 1;

    let pointsGained = 0;
    // Calculate points using default ratio: 1 point per Rp 1,000
    pointsGained = Math.floor(validatedData.total_transaction / defaultRatioAmount) * defaultRatioPoints;

    // Create transaction and update user points
    const transaction = await prisma.transactions.create({
      data: {
        users_id: validatedData.users_id,
        items: validatedData.items || null,
        total_item: validatedData.total_item,
        total_transaction: validatedData.total_transaction,
        points_gained: pointsGained,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update user points
    await prisma.users.update({
      where: { id: validatedData.users_id },
      data: {
        points: user.points + pointsGained,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: transaction.id,
          userId: transaction.users_id,
          userName: transaction.user?.name || 'Unknown',
          userEmail: transaction.user?.email || 'Unknown',
          totalItem: transaction.total_item,
          totalTransaction: transaction.total_transaction,
          pointsGained: transaction.points_gained,
          items: transaction.items,
          createdAt: transaction.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Validasi gagal: ' + error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create transaction error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
