import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all points ratios from database
    let ratios = await prisma.points_ratio.findMany({
      orderBy: { created_at: 'desc' },
    });

    // If no ratios exist, create default one
    if (ratios.length === 0) {
      const defaultRatio = await prisma.points_ratio.create({
        data: {
          amount: 1000,
          points: 1,
          description: 'Rp 1.000 = 1 Poin',
          is_active: true,
        },
      });
      ratios = [defaultRatio];
    }

    return NextResponse.json<ApiResponse<typeof ratios>>(
      { success: true, data: ratios },
      { status: 200 }   
    );
  } catch (error: any) {
    console.error('Error fetching points ratios:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error.message || 'Failed to fetch points ratios' },
      { status: 500 }
    );
  }
}
