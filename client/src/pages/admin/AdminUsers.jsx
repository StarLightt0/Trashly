import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  ShieldCheck,
  Coins,
  Shield,
  Edit,
  PlusCircle,
  MinusCircle,
  X,
  AlertCircle
} from 'lucide-react';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Adjust points modal
  const [adjustModalUser, setAdjustModalUser] = useState(null);
  const [pointsDelta, setPointsDelta] = useState(50);
  const [adjustReason, setAdjustReason] = useState('Bonus partisipasi kegiatan pilah sampah');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers({ search, role: roleFilter });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleToggle = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const confirmMsg = targetUser.role === 'admin'
      ? `Turunkan ${targetUser.name} menjadi user biasa?`
      : `Promosikan ${targetUser.name} menjadi Administrator?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await adminAPI.updateUserRole(targetUser.id, newRole);
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah role pengguna.');
    }
  };

  const handleAdjustPointsSubmit = async (e) => {
    e.preventDefault();
    if (!adjustModalUser) return;

    try {
      setAdjustSubmitting(true);
      setAdjustError('');

      await adminAPI.adjustUserPoints(adjustModalUser.id, pointsDelta, adjustReason);
      setAdjustModalUser(null);
      fetchUsers();
    } catch (err) {
      setAdjustError(err.response?.data?.message || 'Gagal menyesuaikan poin.');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Manajemen Pengguna & Gamifikasi</h2>
          <p className="text-xs text-slate-500">Kelola hak akses role administrator dan penyesuaian saldo Eco-Points pengguna</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari nama, email, atau institusi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              roleFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              roleFilter === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Administrator
          </button>
          <button
            onClick={() => setRoleFilter('user')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              roleFilter === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            User Biasa
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Memuat data pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Role Akses</th>
                  <th className="py-3 px-4">Eco-Points</th>
                  <th className="py-3 px-4">Institusi / No. HP</th>
                  <th className="py-3 px-4">Tgl Bergabung</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isAdmin = u.role === 'admin';
                  const isSelf = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              {u.name}
                              {isSelf && (
                                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                                  Anda
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isAdmin
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                          {isAdmin ? 'Administrator' : 'User'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-amber-600 text-xs">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{(u.points || 0).toLocaleString('id-ID')} Poin</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <p className="font-medium text-[11px] text-slate-800">{u.institution || '-'}</p>
                        <p className="text-[10px] text-slate-400">{u.phone || '-'}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAdjustModalUser(u);
                              setPointsDelta(50);
                              setAdjustReason('Bonus partisipasi kegiatan pilah sampah');
                              setAdjustError('');
                            }}
                            title="Sesuaikan Eco-Points"
                            className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition border border-amber-200 inline-flex items-center gap-1"
                          >
                            <Coins className="w-3 h-3" /> Ubah Poin
                          </button>

                          {!isSelf && (
                            <button
                              onClick={() => handleRoleToggle(u)}
                              title={isAdmin ? 'Turunkan ke User Biasa' : 'Jadikan Administrator'}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition border ${
                                isAdmin
                                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
                              }`}
                            >
                              {isAdmin ? 'Jadikan User' : 'Set Admin'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Penyesuaian Eco-Points */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 text-sm">Sesuaikan Eco-Points</h4>
              <button
                onClick={() => setAdjustModalUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adjustError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                {adjustError}
              </div>
            )}

            <div>
              <p className="text-slate-500">Pengguna:</p>
              <p className="font-bold text-slate-800 text-sm">{adjustModalUser.name}</p>
              <p className="text-slate-400 text-[11px]">Saldo Saat Ini: <strong>{adjustModalUser.points}</strong> Poin</p>
            </div>

            <form onSubmit={handleAdjustPointsSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jumlah Perubahan Poin (Bisa positif atau negatif)
                </label>
                <input
                  type="number"
                  required
                  placeholder="+50 atau -20"
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Gunakan angka minus (contoh: <code>-30</code>) untuk mengurangi poin.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Penyesuaian</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalUser(null)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition shadow-sm disabled:opacity-50"
                >
                  {adjustSubmitting ? 'Memproses...' : 'Terapkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
