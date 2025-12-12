'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { Pencil, Trash2, Plus, ArrowLeft } from 'lucide-react';

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  points: number;
  membership_level: string;
  status: string;
  created_at: string;
};

export default function UsersManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = { 
    name: '', email: '', password: '', phone: '', address: '', role: 'MEMBER', status: 'active' 
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      if (json.success) setUsers(json.data);
      else toast.error(json.error);
    } catch (err) {
      toast.error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role,
        status: user.status
      });
    } else {
      setSelectedUser(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = selectedUser 
        ? `/api/users/${selectedUser.id}` 
        : '/api/users';
      
      const method = selectedUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(selectedUser ? 'User diperbarui' : 'User berhasil dibuat');
        setIsModalOpen(false);
        fetchUsers();
      } else {
        toast.error(json.error || 'Gagal menyimpan data');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('User berhasil dihapus');
        setIsDeleteModalOpen(false);
        fetchUsers();
      } else {
        toast.error(json.error);
      }
    } catch (err) {
      toast.error('Gagal menghapus');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-[#6B3E1D]">Kelola Users</h1>
          </div>
          <Button 
            onClick={() => handleOpenModal()} 
            className="bg-[#6B3E1D] hover:bg-[#543016] text-white flex flex-row items-center gap-2"
          >
            <Plus className="h-4 w-4" /> 
            <span>Tambah User</span>
          </Button>
        </div>

        {/* Tabel */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Semua User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-black">
                <thead className="border-b bg-gray-100">
                  <tr>
                    <th className="p-4">Nama & Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Level & Poin</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-[#6B3E1D]">{user.name}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{user.membership_level}</div>
                        <div className="text-yellow-600 text-xs font-bold">{user.points} Poin</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(user)}>
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- MODAL ADD / EDIT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">
                {selectedUser ? 'Edit User' : 'Tambah User Baru'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B3E1D] text-black bg-white"
                      placeholder="Masukkan Nama"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B3E1D] text-black bg-white"
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Password {selectedUser && <span className="text-gray-400 text-xs">(Biarkan kosong jika tidak diubah)</span>}
                  </label>
                  <input 
                    type="password" 
                    required={!selectedUser} 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B3E1D] text-black bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-sm font-medium text-gray-700">No. Telepon</label>
                     <input 
                       type="text" 
                       value={formData.phone} 
                       onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                       className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B3E1D] text-black bg-white"
                     />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <select 
                      value={formData.role} 
                      onChange={(e) => setFormData({...formData, role: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B3E1D] text-black bg-white"
                    >
                      <option value="MEMBER">MEMBER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label className="text-sm font-medium text-gray-700">Alamat</label>
                   <textarea 
                     value={formData.address} 
                     onChange={(e) => setFormData({...formData, address: e.target.value})} 
                     className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B3E1D] text-black bg-white"
                     rows={2} 
                   />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status Akun</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B3E1D] text-black bg-white"
                  >
                    <option value="active">ACTIVE</option>
                    <option value="inactive">INACTIVE</option>
                    <option value="suspended">SUSPENDED</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" className="flex-1 text-black border-gray-300 hover:bg-gray-100" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" className="flex-1 bg-[#6B3E1D] text-white hover:bg-[#543016]" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- MODAL DELETE --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle className="text-red-600">Hapus User?</CardTitle></CardHeader>
            <CardContent>
              <p className="mb-6 text-gray-600">Anda yakin ingin menghapus <b>{selectedUser?.name}</b>?</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Batal</Button>
                <Button variant="danger" className="flex-1 bg-red-600 text-white" onClick={handleDelete} disabled={isSubmitting}>Hapus</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}