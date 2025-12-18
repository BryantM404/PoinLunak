// GET /api/users - Get all users (Admin only) or current user info

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';

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
    const userId = searchParams.get('id');

    // If userId provided, get specific user
    if (userId) {
      // Only allow admins or the user themselves
      if (currentUser.role !== 'ADMIN' && currentUser.id !== parseInt(userId)) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }

      const user = await prisma.users.findUnique({
        where: { id: parseInt(userId) },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          join_date: true,
          points: true,
          membership_level: true,
          status: true,
          created_at: true,
        },
      });

      if (!user) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'User tidak ditemukan' },
          { status: 404 }
        );
      }

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: user,
        },
        { status: 200 }
      );
    }

    // Get all users (admin only)
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }

    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        join_date: true,
        points: true,
        membership_level: true,
        status: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get users error:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Terjadi kesalahan server',
      },
      { status: 500 }
    );
  }
}
