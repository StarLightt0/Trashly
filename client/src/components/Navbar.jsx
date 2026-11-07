import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Recycle, 
  BookOpen, 
  Home, 
  LogIn, 
  UserPlus, 
  LogOut, 
  User, 
  Sparkles, 
  Menu, 
  X,
  Trophy,
  HelpCircle,
  Award,
  Calculator
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6 animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-800">
                Trash<span className="text-brand-600">ly</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase -mt-1">
                Edukasi & Pilah Sampah
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-brand-600 bg-brand-50 font-semibold' 
                  : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              Beranda
            </Link>

            <Link
              to="/ensiklopedia"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/ensiklopedia')
                  ? 'text-brand-600 bg-brand-50 font-semibold' 
                  : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Ensiklopedia
            </Link>

            <Link
              to="/kuis"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/kuis')
                  ? 'text-brand-600 bg-brand-50 font-semibold' 
                  : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Kuis Pilah
            </Link>

            <Link
              to="/kalkulator"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/kalkulator')
                  ? 'text-brand-600 bg-brand-50 font-semibold' 
                  : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Kalkulator Jejak
            </Link>

            <Link
              to="/leaderboard"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/leaderboard')
                  ? 'text-brand-600 bg-brand-50 font-semibold' 
                  : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              Peringkat
            </Link>
          </div>

          {/* User Section / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Eco Points Badge */}
                <Link
                  to="/profil"
                  title="Lihat Dashboard Profil & Poin Anda"
                  className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                  <span>{user.points || 0} Eco-Points</span>
                </Link>

                {/* User Info & Avatar -> Link to Profile */}
                <Link
                  to="/profil"
                  className="flex items-center gap-2.5 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-slate-800 leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[11px] text-brand-600 font-semibold capitalize">
                      Dashboard Profil →
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Keluar / Logout"
                  className="ml-1 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/30 hover:shadow-md transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/profil"
                className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold"
              >
                <Sparkles className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                <span>{user.points || 0}</span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/') ? 'text-brand-600 bg-brand-50 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4" />
            Beranda
          </Link>

          <Link
            to="/ensiklopedia"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/ensiklopedia') ? 'text-brand-600 bg-brand-50 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Ensiklopedia Sampah
          </Link>

          <Link
            to="/kuis"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/kuis') ? 'text-brand-600 bg-brand-50 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Kuis Pilah Sampah
          </Link>

          <Link
            to="/kalkulator"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/kalkulator') ? 'text-brand-600 bg-brand-50 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Kalkulator Jejak
          </Link>

          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/leaderboard') ? 'text-brand-600 bg-brand-50 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            Papan Peringkat
          </Link>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-3">
                <Link
                  to="/profil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full bg-white border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{user.name}</div>
                    <div className="text-xs text-brand-600 font-semibold">Buka Profil & Poin →</div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-sm font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar Akun
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center"
                >
                  <LogIn className="w-4 h-4" />
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg text-center shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
