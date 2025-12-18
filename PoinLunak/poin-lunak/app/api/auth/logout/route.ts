// POST /api/auth/logout - User logout endpoint

import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';

export async function POST() {
  try {
    await clearAuthCookie();

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Logout berhasil',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Terjadi kesalahan server',
      },
      { status: 500 }
    );
  }
}
