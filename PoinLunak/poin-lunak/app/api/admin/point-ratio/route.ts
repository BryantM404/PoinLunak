import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma singleton (aman untuk Next.js dev & prod)
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * GET /api/admin/point-ratio
 * Ambil rasio poin saat ini
 */
export async function GET() {
  try {
    // const setting = await prisma.settings.findFirst();

    return NextResponse.json({
      success: true,
      data: {
        // ratio: setting?.point_ratio ?? 0,
      },
    });
  } catch (error) {
    console.error('GET point ratio error:', error);

    return NextResponse.json(
      { success: false, error: 'Gagal mengambil rasio poin' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/point-ratio
 * Update rasio poin
 */
export async function POST(req: Request) {
  try {
    const { ratio } = await req.json();

    const numericRatio = Number(ratio);

    if (isNaN(numericRatio) || numericRatio <= 0) {
      return NextResponse.json(
        { success: false, error: 'Rasio harus berupa angka > 0' },
        { status: 400 }
      );
    }

    /**
     * Karena tabel settings diasumsikan 1 baris,
     * updateMany aman dan sederhana
     */
    // await prisma.settings.updateMany({
    //   data: {
    //     point_ratio: numericRatio,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: 'Rasio poin berhasil diperbarui',
    });
  } catch (error) {
    console.error('POST point ratio error:', error);

    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui rasio poin' },
      { status: 500 }
    );
  }
}
