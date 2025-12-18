// POST /api/admin/points/adjust - Manual point adjustment by admin

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { manualPointAdjustmentSchema } from '@/lib/validations';
import { getMembershipLevel } from '@/lib/utils';
import type { ApiResponse } from '@/lib/types';

export async function POST(request: Request) {
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

    const body = await request.json();

    // Validate input
    const validatedData = manualPointAdjustmentSchema.parse(body);

    // Get current user points
    const user = await prisma.users.findUnique({
      where: { id: validatedData.users_id },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Calculate new points (prevent negative)
    const newPoints = Math.max(0, user.points + validatedData.points);

    // Update user points
    const updatedUser = await prisma.users.update({
      where: { id: validatedData.users_id },
      data: {
        points: newPoints,
      },
    });

    // Check membership level change
    const newLevel = getMembershipLevel(newPoints);
    if (newLevel !== updatedUser.membership_level) {
      await prisma.users.update({
        where: { id: validatedData.users_id },
        data: { membership_level: newLevel },
      });
    }

    // Create membership log
    const adjustmentType = validatedData.points > 0 ? 'Penambahan' : 'Pengurangan';
    await prisma.membership_logs.create({
      data: {
        users_id: validatedData.users_id,
        activity: `${adjustmentType} poin manual oleh admin: ${validatedData.points} poin. Alasan: ${validatedData.reason}`,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          oldPoints: user.points,
          newPoints,
          adjustment: validatedData.points,
        },
        message: 'Poin berhasil disesuaikan',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Manual point adjustment error:', error);

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
