'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface NavLink {
  label: string;
  href: string;
}

const adminLinks: NavLink[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Kelola User', href: '/admin/users' },
  { label: 'Transaksi', href: '/admin/transactions' },
  { label: 'Kelola Rewards', href: '/admin/rewards' },
];

const memberLinks: NavLink[] = [
  { label: 'Dashboard', href: '/member/dashboard' },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        if (data.success) {
          setCurrentUser(data.data);
        }
      } catch (error) {
        console.error('Fetch current user error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logout berhasil');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Gagal logout');
    }
  };

  // Don't show navbar on login and register pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null;
  }

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-[#6B3E1D] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#DDBA72] rounded-full flex items-center justify-center">
                <span className="text-[#6B3E1D] font-bold text-lg">PL</span>
              </div>
              <span className="text-xl font-bold">Poin Lunak</span>
            </div>
            <div className="text-sm">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  const navLinks = currentUser?.role === 'ADMIN' ? adminLinks : memberLinks;

  return (
    <nav className="sticky top-0 z-50 bg-[#6B3E1D] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main navbar row */}
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo and brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push(currentUser?.role === 'ADMIN' ? '/admin/dashboard' : '/member/dashboard')}
          >
            <div className="w-10 h-10 bg-[#ffffff] rounded-full flex items-center justify-center">
              <span className="text-[#ffffff] font-bold text-lg">
                <img src="/logo-poin-lunak.png"></img>
              </span>
            </div>
            <span className="text-xl font-bold hidden sm:block">Poin Lunak</span>
          </div>

          {/* Center: Navigation Links - Desktop */}
          <div className="hidden sm:flex gap-1 flex-wrap">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${pathname === link.href || (link.href.includes('?') && pathname === link.href.split('?')[0])
                    ? 'bg-[#DDBA72] text-[#6B3E1D]'
                    : 'bg-[#5A2F1A] text-white hover:bg-[#DDBA72] hover:text-[#6B3E1D]'
                  }
                `}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right: Logout button */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="sm:hidden p-2 rounded-md hover:bg-[#5A2F1A] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            <Button
              onClick={handleLogout}
              className="bg-white text-[#6B3E1D] hover:bg-gray-100 text-sm px-4 py-2 font-semibold"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    router.push(link.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left
                    ${pathname === link.href || (link.href.includes('?') && pathname === link.href.split('?')[0])
                      ? 'bg-[#DDBA72] text-[#6B3E1D]'
                      : 'bg-[#5A2F1A] text-white hover:bg-[#DDBA72] hover:text-[#6B3E1D]'
                    }
                  `}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
