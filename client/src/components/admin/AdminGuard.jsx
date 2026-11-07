import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function AdminGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Memverifikasi hak akses Administrator...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-100 rounded-full">
            Akses Ditolak (403)
          </span>
          <h1 className="text-2xl font-bold text-slate-800 mt-4 mb-2">Area Khusus Administrator</h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Akun Anda (<strong className="text-slate-700">{user.email}</strong>) terdaftar dengan hak akses <code className="bg-slate-100 px-2 py-0.5 rounded text-brand-600 font-semibold">{user.role}</code>. Halaman ini memerlukan hak akses <code className="bg-slate-100 px-2 py-0.5 rounded text-rose-600 font-semibold">admin</code>.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition shadow-md shadow-brand-600/20"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
            <p className="text-xs text-slate-400 mt-2">
              💡 Tip: Untuk pengujian, Anda dapat masuk menggunakan akun demo <code>admin@trashly.id</code> (password: <code>password123</code>).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
