import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Heart, Shield, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">
                Trash<span className="text-brand-400">ly</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Platform edukasi interaktif pengelolaan sampah untuk generasi sadar lingkungan. 
              Membantu memilah sampah dari rumah, mengurangi beban TPA, dan mewujudkan masa depan sirkular Indonesia.
            </p>
            <div className="flex items-center gap-3 text-xs text-brand-400 font-medium">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Berbasis Indonesia
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Standar KLHK & 3R
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Navigasi Utama</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-brand-400 transition-colors">Beranda</Link>
              </li>
              <li>
                <Link to="/ensiklopedia" className="hover:text-brand-400 transition-colors">Ensiklopedia Sampah</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">Masuk Akun</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-400 transition-colors">Daftar Akun Baru</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">Kategori Sampah</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/ensiklopedia?category=organik" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Organik (Kompos)
                </Link>
              </li>
              <li>
                <Link to="/ensiklopedia?category=anorganik" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Anorganik (Daur Ulang)
                </Link>
              </li>
              <li>
                <Link to="/ensiklopedia?category=b3" className="hover:text-red-400 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Limbah B3 Berbahaya
                </Link>
              </li>
              <li>
                <Link to="/ensiklopedia?category=residu" className="hover:text-slate-400 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span> Residu TPA
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Trashly. Dikembangkan untuk HIMTEC HACKATHON.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> untuk Bumi Lebih Bersih
          </p>
        </div>
      </div>
    </footer>
  );
}
