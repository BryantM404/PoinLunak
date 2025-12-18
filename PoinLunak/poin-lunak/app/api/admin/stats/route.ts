// GET /api/admin/stats - Get admin dashboard statistics with charts data

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { ApiResponse, AdminStats } from '@/lib/types';

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

    // Get total users
    const totalUsers = await prisma.users.count();

    // Get total transactions
    const totalTransactions = await prisma.transactions.count();

    // Get total points issued (sum of all points_gained)
    const pointsIssued = await prisma.transactions.aggregate({
      _sum: {
        points_gained: true,
      },
    });

    // Get total points redeemed (sum of all points_required)
    const pointsRedeemed = await prisma.rewards.aggregate({
      _sum: {
        points_required: true,
      },
    });

    // Get transactions per day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactionsByDay = await prisma.transactions.groupBy({
      by: ['created_at'],
      where: {
        created_at: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        total_transaction: true,
      },
    });

    // Format transactions per day
    const transactionsPerDay = transactionsByDay.map(t => ({
      date: t.created_at.toISOString().split('T')[0],
      count: t._count.id,
      amount: Number(t._sum.total_transaction || 0),
    }));

    // Get points activity (issued vs redeemed) for last 30 days
    const pointsIssuedByDay = await prisma.transactions.groupBy({
      by: ['created_at'],
      where: {
        created_at: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        points_gained: true,
      },
    });

    const pointsRedeemedByDay = await prisma.rewards.groupBy({
      by: ['created_at'],
      where: {
        created_at: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        points_required: true,
      },
    });

    // Combine points data
    const dateMap = new Map<string, { issued: number; redeemed: number }>();

    pointsIssuedByDay.forEach(p => {
      const date = p.created_at.toISOString().split('T')[0];
      const current = dateMap.get(date) || { issued: 0, redeemed: 0 };
      dateMap.set(date, {
        ...current,
        issued: p._sum.points_gained || 0,
      });
    });

    pointsRedeemedByDay.forEach(p => {
      const date = p.created_at.toISOString().split('T')[0];
      const current = dateMap.get(date) || { issued: 0, redeemed: 0 };
      dateMap.set(date, {
        ...current,
        redeemed: p._sum.points_required || 0,
      });
    });

    const pointsActivity = Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      issued: data.issued,
      redeemed: data.redeemed,
    }));

    const stats: AdminStats = {
      totalUsers,
      totalTransactions,
      totalPointsIssued: pointsIssued._sum.points_gained || 0,
      totalPointsRedeemed: pointsRedeemed._sum.points_required || 0,
      transactionsPerDay,
      pointsActivity,
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin stats error:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Terjadi kesalahan server',
      },
      { status: 500 }
    );
  }
}
