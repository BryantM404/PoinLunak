// POST /api/auth/login - User login endpoint

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import type { ApiResponse } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.status !== 'active') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Akun tidak aktif' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Create membership log
    await prisma.membership_logs.create({
      data: {
        users_id: user.id,
        activity: 'Login ke sistem',
      },
    });

    // Remove password from response
    const { password: _, ...safeUser } = user;

    // Create token and set cookie
    const token = await createToken(safeUser);
    await setAuthCookie(token);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: safeUser,
        message: 'Login berhasil',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);

    // Zod validation error
    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.errors[0]?.message || 'Validasi gagal',
        },
        { status: 400 }
      );
    }

    // Server error
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Terjadi kesalahan server',
      },
      { status: 500 }
    );
  }
}
