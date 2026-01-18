// Home / Landing Page

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen bg-[#F5E6D3]">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen text-[#6B3E1D] px-4">
        <div className="text-center max-w-4xl">
          <div className="text-9xl mb-6 animate-bounce">
            <img
              src="/logo-poin-lunak.png"
              // alt="Logo Poin Lunak"
              width={128} // Set width in pixels
              height={128} // Set height in pixels
              className="mx-auto"
            />
          </div>
          <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">
            Poin Lunak
          </h1>
          <p className="text-2xl mb-3 text-[#6B3E1D] font-semibold">
            Ayam Goreng Tulang Lunak Holis Surya Sumantri
          </p>
          <p className="text-xl mb-12 opacity-90">
            Sistem Membership untuk Pelanggan Setia
          </p>
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="primary" className="py-4 px-8 text-lg">
                Daftar Sekarang
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="py-4 px-8 text-lg border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-gray-100">
                Login
              </Button>
            </Link>
          </div>

          {/* Footer Info */}
          <div></div>
          <div className="mt-16 text-sm opacity-75">
            <p>© 2025 Poin Lunak. All rights reserved.</p>
            <p className="mt-2">
              Pemrograman Terapan - Universitas Kristen Maranatha
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
