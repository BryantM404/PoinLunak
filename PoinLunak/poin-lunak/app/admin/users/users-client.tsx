// Admin Users Management Client Component

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading';

interface User {
  id: number;
  name: string;
  email: string;
  role: string | null;
  points: number;
  status: string | null;
  join_date: Date | null;
  created_at: Date;
}

interface CurrentUser {
  id: number;
  email: string;
  role: string;
}

const ITEMS_PER_PAGE = 25;

export default function AdminUsersClient() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER',
    status: 'ACTIVE',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.data);
      }
    } catch (error) {
      console.error('Fetch current user error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.success) {
        // Sort by ID ascending
        const sortedUsers = data.data.sort((a: User, b: User) => a.id - b.id);
        setUsers(sortedUsers);
      } else {
        toast.error(data.error || 'Gagal memuat user');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role || 'MEMBER',
        status: user.status || 'ACTIVE',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'MEMBER',
        status: 'ACTIVE',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'MEMBER',
      status: 'ACTIVE',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.name || !formData.email) {
      toast.error('Nama dan email harus diisi');
      return;
    }

    if (!editingId && !formData.password) {
      toast.error('Password harus diisi untuk user baru');
      return;
    }

    try {
      const url = editingId
        ? `/api/admin/users/${editingId}`
        : '/api/admin/users';
      const method = editingId ? 'PUT' : 'POST';

      const body: Record<string, unknown> = { ...formData };
      if (!formData.password && editingId) {
        delete body.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        handleCloseModal();
        await fetchUsers();
      } else {
        toast.error(data.error || 'Gagal menyimpan user');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const message = newStatus === 'ACTIVE' ? 'Aktifkan' : 'Nonaktifkan';

    // Check if this is the current user trying to deactivate themselves
    if (currentUser && user.id === currentUser.id && newStatus === 'INACTIVE') {
      await Swal.fire({
        icon: 'error',
        title: 'Tidak Bisa Nonaktifkan',
        text: 'Anda tidak bisa menonaktifkan akun diri sendiri.',
        confirmButtonColor: '#6B3E1D',
        confirmButtonText: 'OK',
      });
      return;
    }

    // If trying to deactivate an admin, check if there are other active admins
    if (user.role === 'ADMIN' && newStatus === 'INACTIVE') {
      const activeAdmins = users.filter(
        (u) => u.role === 'ADMIN' && u.status === 'ACTIVE' && u.id !== user.id
      );

      if (activeAdmins.length === 0) {
        await Swal.fire({
          icon: 'warning',
          title: 'Admin Minimal',
          text: 'Minimal harus ada 1 admin yang aktif dalam sistem. Tidak bisa menonaktifkan user terakhir.',
          confirmButtonColor: '#6B3E1D',
          confirmButtonText: 'OK',
        });
        return;
      }
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      icon: 'info',
      title: `${message} User?`,
      text: `Apakah Anda yakin ingin ${message.toLowerCase()} user ${user.name}?`,
      showCancelButton: true,
      confirmButtonColor: '#6B3E1D',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: `Ya, ${message}`,
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        await fetchUsers();
      } else {
        toast.error(data.error || 'Gagal mengubah status user');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  // Filter users
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f9]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f9]">
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Title with Back Button */}
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            className="border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
            onClick={() => router.back()}
          >
            ← Kembali
          </Button>
          <h1 className="text-3xl font-bold text-[#6B3E1D]">Kelola User</h1>
          <Button
            className="bg-white border-[#6B3E1D] text-[#6B3E1D] hover:bg-[#f3e7d1]"
            onClick={() => handleOpenModal()}
          >
            Tambah User
          </Button>
        </div>

        {/* Add Button */}
        {/* <div className="flex justify-end">
          
        </div> */}

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <Input
              type="text"
              placeholder="Cari user (nama atau email)..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              label=""
            />
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar User ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">ID</th>
                    <th className="text-left">Nama</th>
                    <th className="text-left">Email</th>
                    <th className="text-left">Role</th>
                    <th className="text-left">Poin</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Terdaftar</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        Tidak ada user
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => {
                      const isCurrentUser = currentUser && user.id === currentUser.id;
                      return (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.name} {isCurrentUser && <span className="text-xs text-blue-600 ml-2">(Anda)</span>}</td>
                          <td className="text-sm">{user.email}</td>
                          <td>
                            <span className="px-3 py-1 text-sm rounded-md bg-[#f3e7d1] text-[#6B3E1D]">
                              {user.role || 'MEMBER'}
                            </span>
                          </td>
                          <td className="font-semibold text-[#DDBA72]">
                            {user.points.toLocaleString()}
                          </td>
                          <td>
                            <span
                              className={`px-3 py-1 text-sm rounded-md ${
                                user.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="text-sm">
                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="text-center flex justify-center flex-wrap gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-3 py-1 text-xs border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                              onClick={() => handleOpenModal(user)}
                              disabled={!!isCurrentUser}
                              title={isCurrentUser ? 'Tidak bisa edit diri sendiri' : ''}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`px-3 py-1 text-xs border ${
                                isCurrentUser
                                  ? 'border-gray-400 text-gray-400 bg-gray-100 cursor-not-allowed opacity-50'
                                  : user.status === 'ACTIVE'
                                  ? 'border-orange-600 text-orange-600 bg-white hover:bg-orange-50'
                                  : 'border-green-600 text-green-600 bg-white hover:bg-green-50'
                              }`}
                              onClick={() => handleToggleStatus(user)}
                              disabled={!!isCurrentUser}
                              title={isCurrentUser ? 'Tidak bisa ubah status diri sendiri' : ''}
                            >
                              {user.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                  >
                    ← Sebelumnya
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page
                            ? 'bg-[#6B3E1D] text-white'
                            : 'border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]'
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                  >
                    Selanjutnya →
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingId ? 'Edit User' : 'Tambah User Baru'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nama"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nama lengkap"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@example.com"
                  required
                />
                {!editingId && (
                  <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    required
                  />
                )}
                {editingId && (
                  <Input
                    label="Password (kosongkan jika tidak ingin mengubah)"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                )}
                <div>
                  <label className="block text-xs font-medium text-[#875600] mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-[#d1d5db] rounded-md focus:border-[#875600] text-sm"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#875600] mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-[#d1d5db] rounded-md focus:border-[#875600] text-sm"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Nonaktif</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-white border-[#6B3E1D] text-[#6B3E1D] hover:bg-[#f3e7d1]"
                  >
                    Simpan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="flex-1 border-[#6B3E1D] text-[#6B3E1D] bg-white hover:bg-[#f3e7d1]"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
