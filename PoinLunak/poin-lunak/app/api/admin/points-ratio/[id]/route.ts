import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const ratioId = parseInt(id);

    if (isNaN(ratioId)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid ratio ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { amount, points, description } = body;

    // Validate input
    if (!amount || !points || amount <= 0 || points <= 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Amount dan points harus lebih dari 0' },
        { status: 400 }
      );
    }

    // Check if ratio exists
    const existingRatio = await prisma.points_ratio.findUnique({
      where: { id: ratioId },
    });

    if (!existingRatio) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Rasio poin tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update the ratio
    const updatedRatio = await prisma.points_ratio.update({
      where: { id: ratioId },
      data: {
        amount: parseFloat(amount),
        points: parseInt(points),
        description: description || `Rp ${parseFloat(amount).toLocaleString()} = ${parseInt(points)} Poin`,
      },
    });

    return NextResponse.json<ApiResponse<typeof updatedRatio>>(
      { success: true, data: updatedRatio, message: 'Rasio poin berhasil diperbarui' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating points ratio:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error.message || 'Failed to update points ratio' },
      { status: 500 }
    );
  }
}
