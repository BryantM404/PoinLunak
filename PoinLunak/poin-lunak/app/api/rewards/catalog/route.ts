// GET /api/rewards/catalog - Get available rewards catalog from database

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

    // Fetch active reward items from database (only items with stock > 0)
    const rewardItems = await prisma.reward_items.findMany({
      where: {
        status: 'ACTIVE',
        stock: {
          gt: 0,
        },
      },
      orderBy: { points_required: 'asc' },
    });

    // Format catalog
    const catalog = rewardItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      points: item.points_required,
      stock: item.stock,
      validity_days: item.validity_days,
      status: item.status,
    }));

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
