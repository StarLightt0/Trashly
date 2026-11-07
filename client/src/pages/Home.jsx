import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BookOpen, 
  Recycle, 
  Sparkles, 
  ShieldAlert, 
  Leaf, 
  Cpu, 
  Trash2, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  Search
} from 'lucide-react';
import { wasteAPI } from '../services/api';

export default function Home() {
  const [stats, setStats] = useState({
    totalItems: 9,
    totalRecyclable: 6,
    recyclablePercentage: 67,
    totalCategories: 5
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, catsRes] = await Promise.all([
          wasteAPI.getStats(),
          wasteAPI.getCategories()
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (catsRes.data.success) setCategories(catsRes.data.data);
      } catch (err) {
        console.warn('Menggunakan fallback visual untuk beranda:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-brand-50/70 via-white to-slate-50">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.brand.100),white)] opacity-60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold tracking-wide uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                Platform Edukasi Sampah #1 di Indonesia
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Kelola Sampah dengan <span className="text-brand-600 underline decoration-brand-300 decoration-wavy">Bijak</span>, 
                Ciptakan Bumi Lebih Sehat.
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Pelajari cara memilah sampah dari rumah, pahami dampak lingkungan dari setiap material, dan kumpulkan poin edukasi ramah lingkungan bersama <strong>Trashly</strong>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/ensiklopedia"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 hover:-translate-y-0.5 transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  Jelajahi Ensiklopedia
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/kuis"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  Main Kuis Pilah
                </Link>
              </div>

              {/* Trust factors */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  Panduan Terverifikasi
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  5 Kategori Standar KLHK
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  100% Gratis & Terbuka
                </div>
              </div>
            </div>

            {/* Right Column: Visual Card Highlight */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl shadow-slate-200/80 border border-slate-100 space-y-6">
                
                {/* Visual badge top */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Recycle className="w-6 h-6 animate-spin-slow" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Prinsip 3R</h4>
                      <p className="text-xs text-slate-400">Reduce, Reuse, Recycle</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    Aktif
                  </span>
                </div>

                {/* Example interactive preview card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Fakta Sampah Plastik</span>
                    <span className="text-rose-500">450 Tahun</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-500 to-emerald-400 h-2.5 rounded-full w-4/5"></div>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    "Setiap 1 botol plastik yang kamu daur ulang menghemat cukup energi untuk menyalakan lampu bohlam selama 6 jam."
                  </p>
                </div>

                {/* Mini quick stat rows */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 text-center">
                    <div className="text-2xl font-black text-brand-700">{stats.recyclablePercentage}%</div>
                    <div className="text-[11px] text-brand-900 font-medium">Bisa Didaur Ulang</div>
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-center">
                    <div className="text-2xl font-black text-blue-700">{stats.totalItems}+ Item</div>
                    <div className="text-[11px] text-blue-900 font-medium">Katalog Ensiklopedia</div>
                  </div>
                </div>

                <Link
                  to="/ensiklopedia"
                  className="block text-center text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-100/70 hover:bg-brand-100 py-2.5 rounded-xl transition-colors"
                >
                  Cari Sampah di Rumah Anda →
                </Link>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-brand-400">{stats.totalCategories} Kategori</div>
              <p className="text-sm text-slate-400">Pengelompokan jenis sampah berstandar nasional</p>
            </div>
            <div className="space-y-2 pt-6 md:pt-0">
              <div className="text-4xl sm:text-5xl font-black text-emerald-400">{stats.totalItems}+ Material</div>
              <p className="text-sm text-slate-400">Katalog panduan pemilahan & waktu urai detail</p>
            </div>
            <div className="space-y-2 pt-6 md:pt-0">
              <div className="text-4xl sm:text-5xl font-black text-blue-400">+50 Poin</div>
              <p className="text-sm text-slate-400">Bonus awal pendaftaran untuk aksi nyata peduli bumi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Guide Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Pahami 5 Kategori Tempat Sampah
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Memilah sampah dimulai dengan mengetahui wadah yang tepat agar proses daur ulang berjalan optimal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          
          {/* Organik */}
          <Link
            to="/ensiklopedia?category=organik"
            className="group bg-white p-6 rounded-2xl border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors">
                Organik
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sisa makanan, kulit buah, dan daun. Dapat diolah jadi pupuk kompos & eco-enzyme.
              </p>
            </div>
            <div className="pt-4 text-xs font-bold text-emerald-600 flex items-center gap-1">
              Lihat Item <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Anorganik */}
          <Link
            to="/ensiklopedia?category=anorganik"
            className="group bg-white p-6 rounded-2xl border-2 border-blue-100 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Recycle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                Anorganik
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Plastik, kardus, kertas, kaca, dan kaleng. Memiliki nilai ekonomi di Bank Sampah.
              </p>
            </div>
            <div className="pt-4 text-xs font-bold text-blue-600 flex items-center gap-1">
              Lihat Item <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* B3 */}
          <Link
            to="/ensiklopedia?category=b3"
            className="group bg-white p-6 rounded-2xl border-2 border-rose-100 hover:border-rose-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-rose-600 transition-colors">
                Limbah B3
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Baterai bekas, lampu neon, racun serangga, dan minyak jelantah. Berbahaya & beracun!
              </p>
            </div>
            <div className="pt-4 text-xs font-bold text-rose-600 flex items-center gap-1">
              Lihat Item <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Residu */}
          <Link
            to="/ensiklopedia?category=residu"
            className="group bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-slate-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-slate-700 transition-colors">
                Residu
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tisu kotor, styrofoam makanan, masker medis, dan popok. Dibuang langsung ke TPA.
              </p>
            </div>
            <div className="pt-4 text-xs font-bold text-slate-600 flex items-center gap-1">
              Lihat Item <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* E-Waste */}
          <Link
            to="/ensiklopedia?category=e-waste"
            className="group bg-white p-6 rounded-2xl border-2 border-purple-100 hover:border-purple-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-purple-600 transition-colors">
                E-Waste
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                HP rusak, kabel charger putus, dan komponen elektronik. Jangan dibakar!
              </p>
            </div>
            <div className="pt-4 text-xs font-bold text-purple-600 flex items-center gap-1">
              Lihat Item <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-emerald-700 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold">Mulai Kebiasaan Bijak Sampah Hari Ini!</h3>
            <p className="text-brand-100 text-sm max-w-xl">
              Daftarkan diri Anda sekarang untuk mencatat progres edukasi, mengakses fitur kuis interaktif, dan kumpulkan Eco-Points.
            </p>
          </div>
          <Link
            to="/register"
            className="px-8 py-3.5 bg-white text-brand-700 font-extrabold rounded-xl hover:bg-brand-50 shadow-lg hover:scale-105 transition-all text-center whitespace-nowrap"
          >
            Daftar Sekarang — Gratis
          </Link>
        </div>
      </section>

    </div>
  );
}
