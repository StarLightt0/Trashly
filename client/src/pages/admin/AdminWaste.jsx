import React, { useState, useEffect } from 'react';
import { adminAPI, wasteAPI } from '../../services/api';
import {
  Trash2,
  Plus,
  Search,
  Edit2,
  AlertTriangle,
  X,
  Check,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export default function AdminWaste() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: 1,
    image_url: '',
    decomposition_time: '',
    is_recyclable: true,
    impact_level: 'Sedang',
    summary: '',
    disposal_steps: [''],
    recycling_potential: '',
    danger_notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, catRes] = await Promise.all([
        adminAPI.getWasteItems({ search, category: selectedCategory }),
        wasteAPI.getCategories()
      ]);
      if (itemsRes.data.success) setItems(itemsRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch (err) {
      console.error('Error fetching waste items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      slug: '',
      category_id: categories[0]?.id || 1,
      image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
      decomposition_time: '50 - 100 tahun',
      is_recyclable: true,
      impact_level: 'Sedang',
      summary: '',
      disposal_steps: ['Bersihkan dari sisa kotoran', 'Pilah ke wadah daur ulang'],
      recycling_potential: 'Dapat diolah kembali menjadi produk bermanfaat.',
      danger_notes: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      slug: item.slug || '',
      category_id: item.category_id || 1,
      image_url: item.image_url || '',
      decomposition_time: item.decomposition_time || '',
      is_recyclable: Boolean(item.is_recyclable),
      impact_level: item.impact_level || 'Sedang',
      summary: item.summary || '',
      disposal_steps: Array.isArray(item.disposal_steps) && item.disposal_steps.length > 0 ? item.disposal_steps : [''],
      recycling_potential: item.recycling_potential || '',
      danger_notes: item.danger_notes || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleStepChange = (index, value) => {
    const updated = [...formData.disposal_steps];
    updated[index] = value;
    setFormData({ ...formData, disposal_steps: updated });
  };

  const addStep = () => {
    setFormData({ ...formData, disposal_steps: [...formData.disposal_steps, ''] });
  };

  const removeStep = (index) => {
    const updated = formData.disposal_steps.filter((_, i) => i !== index);
    setFormData({ ...formData, disposal_steps: updated.length ? updated : [''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Nama sampah wajib diisi!');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError('');

      const cleanSteps = formData.disposal_steps.filter(s => s.trim().length > 0);
      const payload = {
        ...formData,
        disposal_steps: cleanSteps
      };

      if (editingItem) {
        await adminAPI.updateWasteItem(editingItem.id, payload);
      } else {
        await adminAPI.createWasteItem(payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data sampah.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      await adminAPI.deleteWasteItem(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus item sampah.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Katalog Ensiklopedia Sampah</h2>
          <p className="text-xs text-slate-500">Kelola informasi jenis sampah, panduan pemilahan, dan referensi AI RAG</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Tambah Sampah Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari nama sampah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Memuat katalog sampah...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Layers className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Tidak ada item sampah ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau kategori filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Item Sampah</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Waktu Urai</th>
                  <th className="py-3 px-4">Daur Ulang</th>
                  <th className="py-3 px-4">Tingkat Dampak</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=100&q=80'}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">/ensiklopedia/{item.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.category_name || 'Anorganik'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {item.decomposition_time || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {item.is_recyclable ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <Check className="w-3.5 h-3.5" /> Bisa Didaur Ulang
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium text-[11px]">Residu / Sulit</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.impact_level === 'Sangat Tinggi' ? 'bg-rose-50 text-rose-700' :
                        item.impact_level === 'Tinggi' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.impact_level || 'Sedang'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit Item"
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem(item)}
                          title="Hapus Item"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col my-8">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editingItem ? 'Edit Item Sampah' : 'Tambah Item Sampah Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Sampah *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Botol Plastik PET"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Sampah *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Waktu Terurai</label>
                  <input
                    type="text"
                    placeholder="Contoh: 450 tahun"
                    value={formData.decomposition_time}
                    onChange={(e) => setFormData({ ...formData, decomposition_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Dampak Lingkungan</label>
                  <select
                    value={formData.impact_level}
                    onChange={(e) => setFormData({ ...formData, impact_level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="Rendah">Rendah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Sangat Tinggi">Sangat Tinggi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL Foto Sampah</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recyclable"
                  checked={formData.is_recyclable}
                  onChange={(e) => setFormData({ ...formData, is_recyclable: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                />
                <label htmlFor="recyclable" className="font-semibold text-slate-700 cursor-pointer">
                  Sampah ini berpotensi untuk didaur ulang
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ringkasan Edukasi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan ringkas tentang sampah ini..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Dynamic steps builder */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Langkah Pemilahan Bertahap</label>
                  <button
                    type="button"
                    onClick={addStep}
                    className="text-[11px] text-brand-600 font-semibold hover:underline"
                  >
                    + Tambah Langkah
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.disposal_steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-center text-slate-400 font-bold">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder={`Langkah ${idx + 1}...`}
                        value={step}
                        onChange={(e) => handleStepChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                      {formData.disposal_steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Potensi Daur Ulang / Produk Akhir</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Serat kain sintetis, karpet, ember plastik..."
                  value={formData.recycling_potential}
                  onChange={(e) => setFormData({ ...formData, recycling_potential: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50 -mx-5 -mb-5 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {formSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base mb-1">Hapus Item Sampah?</h4>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>"{deleteConfirmItem.name}"</strong>? Item ini akan dihapus dari ensiklopedia dan referensi AI.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold transition shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
