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

    // Get total points redeemed (sum of all reward_items.points_required from rewards)
    const rewardsWithPoints = await prisma.rewards.findMany({
      select: {
        created_at: true,
        reward_item: {
          select: {
            points_required: true,
          },
        },
      },
    });
    
    const totalPointsRedeemed = rewardsWithPoints.reduce((sum, r) => sum + (r.reward_item?.points_required || 0), 0);

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


    // Generate last 30 days date array
    const daysArr: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      daysArr.push(d.toISOString().split('T')[0]);
    }

    // Map transactions by date
    const txMap = new Map<string, { count: number; amount: number }>();
    transactionsByDay.forEach(t => {
      const date = t.created_at.toISOString().split('T')[0];
      txMap.set(date, {
        count: t._count.id,
        amount: Number(t._sum.total_transaction || 0),
      });
    });
    const transactionsPerDay = daysArr.map(date => ({
      date,
      count: txMap.get(date)?.count || 0,
      amount: txMap.get(date)?.amount || 0,
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

    // Get points redeemed by day (from reward_items via rewards)
    const pointsRedeemedByDay = rewardsWithPoints
      .filter(r => new Date(r.created_at) >= thirtyDaysAgo)
      .reduce((acc, r) => {
        const date = new Date(r.created_at).toISOString().split('T')[0];
        const current = acc.find(a => a.date === date);
        const points = r.reward_item?.points_required || 0;
        if (current) {
          current.points += points;
        } else {
          acc.push({ date, points });
        }
        return acc;
      }, [] as Array<{ date: string; points: number }>);


    // Combine points data, fill 0 for missing days
    const issuedMap = new Map<string, number>();
    pointsIssuedByDay.forEach(p => {
      const date = p.created_at.toISOString().split('T')[0];
      issuedMap.set(date, p._sum.points_gained || 0);
    });
    const redeemedMap = new Map<string, number>();
    pointsRedeemedByDay.forEach(p => {
      redeemedMap.set(p.date, p.points);
    });
    const pointsActivity = daysArr.map(date => ({
      date,
      issued: issuedMap.get(date) || 0,
      redeemed: redeemedMap.get(date) || 0,
    }));

    const pointRatio =
    pointsRedeemed._sum.points_required && pointsIssued._sum.points_gained
    ? pointsRedeemed._sum.points_required / pointsIssued._sum.points_gained
    : 0;


    const stats: AdminStats = {
      totalUsers,
      totalTransactions,
      pointRatio,
      totalPointsIssued: pointsIssued._sum.points_gained || 0,
      totalPointsRedeemed: totalPointsRedeemed,
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
