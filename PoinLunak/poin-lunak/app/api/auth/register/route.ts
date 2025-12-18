// POST /api/auth/register - User registration endpoint

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import type { ApiResponse } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user with default values
    const user = await prisma.users.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        role: 'MEMBER',
        join_date: new Date(),
        points: 0,
        membership_level: 'BRONZE',
        status: 'active',
      },
    });

    // Create membership log
    await prisma.membership_logs.create({
      data: {
        users_id: user.id,
        activity: 'Registrasi akun baru',
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
        message: 'Registrasi berhasil',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);

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
