// Home / Landing Page

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function HomePage() {
  // Check if user is already logged in
  const currentUser = await getCurrentUser();
  
  if (currentUser) {
    if (currentUser.role === 'ADMIN') {
      redirect('/admin/dashboard');
    } else {
      redirect('/member/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DDBA72] via-[#c9a860] to-[#6B3E1D]">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen text-white px-4">
        <div className="text-center max-w-4xl">
          <div className="text-9xl mb-6 animate-bounce">🍗</div>
          <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">
            Poin Lunak
          </h1>
          <p className="text-2xl mb-3 text-[#6B3E1D] font-semibold">
            Ayam Goreng Tulang Lunak Holis Surya Sumantri
          </p>
          <p className="text-xl mb-12 opacity-90">
            Sistem Membership untuk Pelanggan Setia
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="text-5xl mb-3">💰</div>
              <h3 className="font-bold text-lg mb-2">Kumpulkan Poin</h3>
              <p className="text-sm opacity-90">
                Setiap Rp 1.000 = 1 Poin
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="text-5xl mb-3">🎁</div>
              <h3 className="font-bold text-lg mb-2">Tukar Reward</h3>
              <p className="text-sm opacity-90">
                Diskon & Voucher Gratis
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="text-5xl mb-3">⭐</div>
              <h3 className="font-bold text-lg mb-2">Level Member</h3>
              <p className="text-sm opacity-90">
                Bronze, Silver, Gold
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-[#6B3E1D] hover:bg-[#5a3318] text-white font-bold py-4 px-8 rounded-lg text-lg transition-all shadow-lg hover:scale-105"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/login"
              className="bg-white text-[#6B3E1D] hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-lg transition-all shadow-lg hover:scale-105"
            >
              Login
            </Link>
          </div>

          {/* Footer Info */}
          <div className="mt-16 text-sm opacity-75">
            <p>© 2024 Poin Lunak. All rights reserved.</p>
            <p className="mt-2">
              Proyek Rekayasa Perangkat Lunak - Universitas Kristen Maranatha
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
