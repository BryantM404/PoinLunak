// PUT /api/admin/transactions/:id - Update transaction with point adjustment
// DELETE /api/admin/transactions/:id - Delete transaction with point deduction

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
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

    const transactionId = parseInt(id);
    const body = await request.json();
    const { totalItem, totalTransaction, items } = body;

    // Check if transaction exists
    const transaction = await prisma.transactions.findUnique({
      where: { id: transactionId },
      include: {
        user: true,
      },
    });

    if (!transaction) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Calculate new points based on new total transaction
    // Using default ratio: Rp 1.000 = 1 Poin
    const defaultRatioAmount = 1000;
    const defaultRatioPoints = 1;
    const newPointsGained = Math.floor(totalTransaction / defaultRatioAmount) * defaultRatioPoints;
    
    // Calculate point difference
    const oldPointsGained = transaction.points_gained;
    const pointsDifference = newPointsGained - oldPointsGained;

    // Update transaction with new points
    const updatedTransaction = await prisma.transactions.update({
      where: { id: transactionId },
      data: {
        total_item: totalItem,
        total_transaction: totalTransaction,
        points_gained: newPointsGained,
        items: items,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Adjust user points if there's a difference
    if (pointsDifference !== 0 && transaction.user) {
      const newUserPoints = Math.max(0, transaction.user.points + pointsDifference);
      await prisma.users.update({
        where: { id: transaction.users_id },
        data: {
          points: newUserPoints,
        },
      });
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: `Transaksi berhasil diperbarui${pointsDifference !== 0 ? `. Poin user ${pointsDifference > 0 ? 'bertambah' : 'berkurang'} ${Math.abs(pointsDifference)} poin.` : ''}`,
        data: {
          ...updatedTransaction,
          pointsDifference,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update transaction error:', error);
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

    const transactionId = parseInt(id);

    // Check if transaction exists with user info
    const transaction = await prisma.transactions.findUnique({
      where: { id: transactionId },
      include: {
        user: true,
      },
    });

    if (!transaction) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    const pointsToDeduct = transaction.points_gained;

    // Deduct points from user before deleting transaction
    if (transaction.user && pointsToDeduct > 0) {
      const newUserPoints = Math.max(0, transaction.user.points - pointsToDeduct);
      await prisma.users.update({
        where: { id: transaction.users_id },
        data: {
          points: newUserPoints,
        },
      });
    }

    // Delete transaction
    await prisma.transactions.delete({
      where: { id: transactionId },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: `Transaksi berhasil dihapus${pointsToDeduct > 0 ? `. ${pointsToDeduct} poin telah dikurangi dari user.` : ''}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
