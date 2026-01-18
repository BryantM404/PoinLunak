// PUT /api/admin/rewards/[id] - Update reward item
// DELETE /api/admin/rewards/[id] - Delete reward item

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';
import { z } from 'zod';

const updateRewardSchema = z.object({
  name: z.string().min(1, 'Nama reward harus diisi').optional(),
  description: z.string().optional(),
  points_required: z.number().min(1, 'Poin harus lebih dari 0').optional(),
  stock: z.number().min(0, 'Stok harus 0 atau lebih').optional(),
  validity_days: z.number().min(1, 'Masa berlaku harus minimal 1 hari').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const itemId = parseInt(id);

    // Check if reward item exists
    const existingItem = await prisma.reward_items.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Reward item tidak ditemukan' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = updateRewardSchema.parse(body);

    const rewardItem = await prisma.reward_items.update({
      where: { id: itemId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description || null }),
        ...(validatedData.points_required && { points_required: validatedData.points_required }),
        ...(validatedData.stock !== undefined && { stock: validatedData.stock }),
        ...(validatedData.validity_days !== undefined && { validity_days: validatedData.validity_days }),
        ...(validatedData.status && { status: validatedData.status }),
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: rewardItem,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Validasi gagal: ' + error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Update reward item error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const itemId = parseInt(id);

    // Check if reward item exists
    const existingItem = await prisma.reward_items.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Reward item tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.reward_items.delete({
      where: { id: itemId },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { id: itemId },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete reward item error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
