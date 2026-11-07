import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import {
  Users,
  Trash2,
  MapPin,
  HelpCircle,
  Scan,
  Coins,
  Sparkles,
  Database,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, sysRes] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getSystemStatus()
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (sysRes.data.success) setSystem(sysRes.data.data);
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-9 h-9 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalUsers: 0,
    totalWaste: 0,
    totalDropPoints: 0,
    totalQuizzes: 0,
    totalScans: 0,
    totalPointsCirculating: 0
  };

  const kpiCards = [
    {
      title: 'Total Pengguna',
      value: metrics.totalUsers,
      subtext: 'User terdaftar di platform',
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 text-blue-600',
      link: '/admin/users'
    },
    {
      title: 'Ensiklopedia Sampah',
      value: metrics.totalWaste,
      subtext: 'Item sampah terdata',
      icon: Trash2,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-600',
      link: '/admin/waste'
    },
    {
      title: 'Bank Sampah Aktif',
      value: metrics.totalDropPoints,
      subtext: 'Titik setor terverifikasi',
      icon: MapPin,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-600',
      link: '/admin/bank-sampah'
    },
    {
      title: 'Total Scan AI',
      value: metrics.totalScans,
      subtext: 'Pemindaian visual dianalisis',
      icon: Scan,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 text-purple-600',
      link: '/admin/scans'
    },
    {
      title: 'Kuis Edukasi',
      value: metrics.totalQuizzes,
      subtext: 'Paket kuis pilah sampah',
      icon: HelpCircle,
      color: 'bg-teal-500',
      lightColor: 'bg-teal-50 text-teal-600',
      link: '/admin/quizzes'
    },
    {
      title: 'Eco-Points Beredar',
      value: metrics.totalPointsCirculating.toLocaleString('id-ID'),
      subtext: 'Total poin reward pengguna',
      icon: Coins,
      color: 'bg-amber-600',
      lightColor: 'bg-amber-50 text-amber-700',
      link: '/admin/users'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Selamat Datang di Pusat Kendali
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Trashly Management Console</h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Kelola seluruh konten ensiklopedia, koordinat bank sampah, kuis interaktif, log pemindaian AI, dan data pengguna dari satu tempat terpadu.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/waste"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Tambah Sampah
          </Link>
          <Link
            to="/admin/bank-sampah"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition border border-slate-700"
          >
            <PlusCircle className="w-4 h-4" /> Tambah Bank Sampah
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card, i) => (
          <Link
            key={i}
            to={card.link}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1 group-hover:text-brand-600 transition">
                  {card.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-xl ${card.lightColor}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>{card.subtext}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-brand-600" />
            </div>
          </Link>
        ))}
      </div>

      {/* System Status & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Diagnostics */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-600" /> Diagnostik Sistem & AI
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-200">
              Live
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Koneksi Database</span>
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${system?.databaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {system?.databaseConnected ? 'MySQL Connected' : 'In-Memory Fallback'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Model Gemini Vision</span>
              <code className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-brand-700 font-semibold">
                {system?.geminiModel || 'gemini-2.5-flash'}
              </code>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">API Key Gemini</span>
              <span className={`font-semibold ${system?.hasGeminiKey ? 'text-emerald-600' : 'text-amber-600'}`}>
                {system?.hasGeminiKey ? 'Terkonfigurasi' : 'Belum Terisi (Mode Presets)'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">CORS Allowed Origin</span>
              <span className="font-mono text-[11px] text-slate-600">{system?.corsOrigin || 'localhost:3000'}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">Waktu Server</span>
              <span className="text-slate-600 font-mono text-[11px]">
                {system?.serverTime ? new Date(system.serverTime).toLocaleTimeString('id-ID') : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-brand-600" /> Sebaran Item Ensiklopedia
            </h3>
            <Link to="/admin/waste" className="text-xs text-brand-600 font-medium hover:underline">
              Kelola Semua →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(stats?.categoryBreakdown || []).map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || '#10b981' }}></span>
                  <span className="text-xs font-semibold text-slate-700 truncate">{cat.name}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-slate-900">{cat.item_count}</span>
                  <span className="text-[11px] text-slate-400">item</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity: Scans & Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scans */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Scan className="w-4 h-4 text-purple-600" /> Pemindaian Terakhir (Scan AI)
            </h3>
            <Link to="/admin/scans" className="text-xs text-brand-600 font-medium hover:underline">
              Lihat Log Lengkap →
            </Link>
          </div>

          {(stats?.recentScans || []).length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada riwayat scan.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentScans.map((scan, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={scan.image_url || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=100&q=80'}
                      alt={scan.waste_name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{scan.waste_name}</p>
                      <p className="text-[11px] text-slate-400">
                        {scan.user_name || 'Tamu'} • {new Date(scan.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {scan.category_name}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{scan.confidence}% Akurasi</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Pengguna Baru Mendaftar
            </h3>
            <Link to="/admin/users" className="text-xs text-brand-600 font-medium hover:underline">
              Kelola Pengguna →
            </Link>
          </div>

          {(stats?.recentUsers || []).length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada pengguna terdaftar.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      user.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-[11px] font-bold text-amber-600 mt-0.5">{user.points} Poin</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
