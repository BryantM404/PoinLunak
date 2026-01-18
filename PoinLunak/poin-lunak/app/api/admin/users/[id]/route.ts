// PUT /api/admin/users/:id - Update user
// DELETE /api/admin/users/:id - Delete user

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { hash } from 'bcryptjs';
import type { ApiResponse } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const userId = parseInt(id);
    const body = await request.json();
    const { name, email, password, role, status } = body;

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email && email !== user.email) {
      // Check if new email already exists
      const existingEmail = await prisma.users.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Email sudah digunakan' },
          { status: 400 }
        );
      }
      updateData.email = email;
    }
    if (password) updateData.password = await hash(password, 10);
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    // Update user
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'User berhasil diperbarui',
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const userId = parseInt(id);

    // Prevent deleting yourself
    if (userId === currentUser.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Tidak bisa menghapus akun Anda sendiri' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete user (cascade will handle related records)
    await prisma.users.delete({
      where: { id: userId },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'User berhasil dihapus',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
