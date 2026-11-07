import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, ShieldCheck, Database, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminTopbar({ onOpenSidebar, title = 'Dashboard' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">Panel Kontrol Administrator Trashly</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Badges Info */}
        <div className="hidden md:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistem Aktif
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Sparkles className="w-3 h-3 text-brand-600" />
            AI Ready
          </span>
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200">
          <div className="flex items-center gap-2.5">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'Admin'}`}
              alt={user?.name || 'Admin'}
              className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 object-cover"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'admin'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
