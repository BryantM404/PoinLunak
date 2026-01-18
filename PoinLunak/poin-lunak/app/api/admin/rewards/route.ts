// GET /api/admin/rewards - Get all reward items (catalog)
// POST /api/admin/rewards - Create new reward item

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';
import { z } from 'zod';

const createRewardSchema = z.object({
  name: z.string().min(1, 'Nama reward harus diisi'),
  description: z.string().optional(),
  points_required: z.number().min(1, 'Poin harus lebih dari 0'),
  stock: z.number().min(0, 'Stok harus 0 atau lebih'),
  validity_days: z.number().min(1, 'Masa berlaku harus minimal 1 hari').default(30),
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

    // Get all reward items from new reward_items table
    const rewardItems = await prisma.reward_items.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: rewardItems,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get reward items error:', error);
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
    const validatedData = createRewardSchema.parse(body);

    const rewardItem = await prisma.reward_items.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        points_required: validatedData.points_required,
        stock: validatedData.stock,
        validity_days: validatedData.validity_days || 30,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: rewardItem,
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

    console.error('Create reward item error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
