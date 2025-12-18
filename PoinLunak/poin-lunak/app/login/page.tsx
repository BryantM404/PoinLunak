// Login Page

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Login berhasil! 🎉');
        
        // Redirect based on role
        if (data.data.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/member/dashboard');
        }
      } else {
        toast.error(data.error || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-black flex items-center justify-center bg-gradient-to-br from-[#DDBA72] to-[#6B3E1D] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">
              <img
              src="/logo-poin-lunak.png"
              width={128} 
              height={128}
              className="mx-auto"
            /></div>
            <CardTitle className="text-3xl">Poin Lunak</CardTitle>
            <p className="text-gray-600 mt-2">Membership System</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-[#6B3E1D] font-semibold hover:underline"
              >
                Daftar di sini
              </button>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Demo Login:</p>
            <p className="text-xs">Admin: admin@poinlunak.com / admin123</p>
            <p className="text-xs">Member: member@poinlunak.com / member123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
