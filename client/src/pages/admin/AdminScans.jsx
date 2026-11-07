import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  Scan,
  Sparkles,
  Trash2,
  AlertCircle,
  CheckCircle,
  Eye,
  X,
  Search,
  Filter,
  Layers
} from 'lucide-react';

export default function AdminScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [previewScan, setPreviewScan] = useState(null);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getScans();
      if (res.data.success) {
        setScans(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch scan logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus log scan ini?')) return;
    try {
      await adminAPI.deleteScan(id);
      fetchScans();
    } catch (err) {
      alert('Gagal menghapus log scan.');
    }
  };

  const filteredScans = scans.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      (s.waste_name && s.waste_name.toLowerCase().includes(q)) ||
      (s.category_name && s.category_name.toLowerCase().includes(q)) ||
      (s.user_name && s.user_name.toLowerCase().includes(q));

    const matchSource =
      filterSource === 'all'
        ? true
        : filterSource === 'ai'
        ? s.source === 'ai' || (s.confidence && s.confidence > 0)
        : s.source === 'local' || !s.confidence;

    return matchSearch && matchSource;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Log Pemindaian Visual (Scan AI)</h2>
          <p className="text-xs text-slate-500">Pantau seluruh riwayat deteksi sampah pengguna yang dianalisis oleh AI Vision dan model offline</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari nama sampah atau pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilterSource('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              filterSource === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({scans.length})
          </button>
          <button
            onClick={() => setFilterSource('ai')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              filterSource === 'ai' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Dianalisis AI
          </button>
          <button
            onClick={() => setFilterSource('local')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              filterSource === 'local' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mode Offline
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Memuat log scan...</p>
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Scan className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Belum ada riwayat pemindaian</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Foto Sampah</th>
                  <th className="py-3 px-4">Hasil Deteksi</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Sumber & Akurasi</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScans.map((scan) => {
                  const isAi = scan.source === 'ai' || (scan.confidence && scan.confidence > 0);
                  return (
                    <tr key={scan.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <img
                          src={scan.image_url || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=100&q=80'}
                          alt={scan.waste_name}
                          onClick={() => setPreviewScan(scan)}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 cursor-pointer hover:opacity-80 transition"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {scan.waste_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {scan.category_name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isAi ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              <Sparkles className="w-3 h-3 text-purple-500" /> Dianalisis AI
                            </span>
                            <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                              {scan.confidence ? `${scan.confidence}% Akurat` : '-'}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Mode Offline
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">Berdasarkan Kata Kunci</p>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <p className="font-semibold text-slate-800">{scan.user_name || 'Tamu'}</p>
                        <p className="text-[10px] text-slate-400">{scan.user_email || '-'}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(scan.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewScan(scan)}
                            title="Preview Detail"
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(scan.id)}
                            title="Hapus Log"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Modal Preview Detail Foto */}
      {previewScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 text-sm">Detail Pemindaian</h4>
              <button
                onClick={() => setPreviewScan(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={previewScan.image_url}
              alt={previewScan.waste_name}
              className="w-full h-64 rounded-xl object-contain bg-slate-900 border border-slate-800"
            />
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Hasil Deteksi:</span>
                <span className="font-bold text-slate-800">{previewScan.waste_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Kategori:</span>
                <span className="font-semibold text-emerald-600">{previewScan.category_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Akurasi:</span>
                <span className="font-semibold text-purple-600">{previewScan.confidence || 95}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Waktu Scan:</span>
                <span className="text-slate-600">{new Date(previewScan.created_at).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
