import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Recycle, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  Share2, 
  Bookmark, 
  ShieldAlert,
  ChevronRight,
  Info
} from 'lucide-react';
import { wasteAPI } from '../services/api';

export default function WasteDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await wasteAPI.getWasteDetail(id);
        if (res.data.success) {
          setItem(res.data.data);
        } else {
          setError(res.data.message || 'Gagal memuat detail sampah.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Item tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-80 bg-slate-200 rounded-3xl"></div>
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Sampah Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500">{error || 'Data yang Anda cari tidak tersedia di ensiklopedia kami.'}</p>
        <Link
          to="/ensiklopedia"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Ensiklopedia
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-brand-600 transition-colors">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/ensiklopedia" className="hover:text-brand-600 transition-colors">Ensiklopedia</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link 
          to={`/ensiklopedia?category=${item.category_slug}`}
          className="hover:text-brand-600 transition-colors font-semibold"
          style={{ color: item.category_color }}
        >
          {item.category_name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-bold truncate max-w-[200px]">{item.name}</span>
      </nav>

      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/ensiklopedia"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Katalog
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          {copied ? 'Tautan Disalin!' : 'Bagikan Panduan'}
        </button>
      </div>

      {/* Hero Visual Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12 gap-0">
        
        {/* Left: Image with Overlay */}
        <div className="md:col-span-5 relative h-72 md:h-auto min-h-[320px] bg-slate-100">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent md:hidden"></div>
        </div>

        {/* Right: Info Header */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-xs font-extrabold px-3 py-1 rounded-lg"
                style={{
                  backgroundColor: item.badge_bg || '#f1f5f9',
                  color: item.badge_text || '#334155'
                }}
              >
                {item.category_name}
              </span>

              {item.is_recyclable ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-lg">
                  <Recycle className="w-3.5 h-3.5 text-emerald-600" />
                  Dapat Didaur Ulang
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Residu / Limbah Khusus
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {item.name}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              {item.summary}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" /> Waktu Urai Alami
              </div>
              <div className="text-base font-extrabold text-slate-800 mt-1">
                {item.decomposition_time}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-500" /> Tingkat Dampak
              </div>
              <div className="text-base font-extrabold text-slate-800 mt-1">
                {item.impact_level}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Disposal Steps (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                <CheckCircle className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Langkah Pemilahan & Penanganan
                </h3>
                <p className="text-xs text-slate-400">Ikuti tahapan berikut sebelum dibuang atau disetor</p>
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-3.5">
              {Array.isArray(item.disposal_steps) && item.disposal_steps.map((step, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-brand-50/50 hover:border-brand-100 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {index + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Potensi Daur Ulang & Bahaya (5 Cols) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Recycling Potential Card */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Potensi Nilai Daur Ulang
            </div>
            <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
              {item.recycling_potential}
            </p>
          </div>

          {/* Danger Notes Card */}
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-3xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Bahaya Jika Dibuang Sembarangan
            </div>
            <p className="text-xs sm:text-sm text-rose-950 leading-relaxed">
              {item.danger_notes}
            </p>
          </div>

          {/* Eco Tip Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 text-blue-500" />
              Kategori Terkait
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sampah ini digolongkan dalam <strong>{item.category_name}</strong>. {item.category_description}
            </p>
            <Link
              to={`/ensiklopedia?category=${item.category_slug}`}
              className="inline-block text-xs font-bold text-brand-600 hover:text-brand-800 underline"
            >
              Lihat semua sampah kategori ini →
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
