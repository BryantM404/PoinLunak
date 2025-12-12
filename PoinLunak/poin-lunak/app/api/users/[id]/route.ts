import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// PUT: Update User
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const id = parseInt(params.id);
    const body = await request.json();
    const { name, email, password, phone, address, role, status } = body;

    const updateData: any = { 
      name, email, phone, address, role, status 
    };

    // Update password hanya jika diisi
    if (password && password.length > 0) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal update user' }, { status: 500 });
  }
}

// DELETE: Hapus User
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const id = parseInt(params.id);

    await prisma.users.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'User dihapus' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal hapus user' }, { status: 500 });
  }
}