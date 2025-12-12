import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { ApiResponse } from '@/lib/types';
import bcrypt from 'bcryptjs';

// --- METHOD GET ---
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (userId) {

       if (currentUser.role !== 'ADMIN' && currentUser.id !== parseInt(userId)) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
       }
       const user = await prisma.users.findUnique({ where: { id: parseInt(userId) } });
       return NextResponse.json({ success: true, data: user });
    }

    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const users = await prisma.users.findMany({
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: users }, { status: 200 });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// --- METHOD POST (TAMBAHAN BARU) ---
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, phone, address, role, status } = body;

    // Validasi
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Nama, Email, dan Password wajib diisi' }, { status: 400 });
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: role || 'MEMBER',
        status: status || 'ACTIVE',
        points: 0,
        membership_level: 'BRONZE'
      }
    });

    return NextResponse.json({ success: true, data: newUser, message: 'User berhasil dibuat' });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat user' }, { status: 500 });
  }
}