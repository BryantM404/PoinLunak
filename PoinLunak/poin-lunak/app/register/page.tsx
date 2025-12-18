// Register Page

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Registrasi berhasil! 🎉');
        router.push('/member/dashboard');
      } else {
        toast.error(data.error || 'Registrasi gagal');
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#DDBA72] to-[#6B3E1D] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">🍗</div>
            <CardTitle className="text-3xl">Daftar Member</CardTitle>
            <p className="text-gray-600 mt-2">Poin Lunak Membership</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="name"
              label="Nama Lengkap"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
            <Input
              type="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              required
            />
            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 karakter"
              required
            />
            <Input
              type="tel"
              name="phone"
              label="Nomor HP (Opsional)"
              value={formData.phone}
              onChange={handleChange}
              placeholder="081234567890"
            />
            <div>
              <label className="block text-sm font-medium text-[#6B3E1D] mb-1">
                Alamat (Opsional)
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DDBA72] focus:border-transparent"
                rows={3}
                placeholder="Alamat lengkap"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Mendaftar...' : 'Daftar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-[#6B3E1D] font-semibold hover:underline"
              >
                Login di sini
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
