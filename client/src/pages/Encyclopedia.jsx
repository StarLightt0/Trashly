import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Recycle, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Leaf, 
  Trash2, 
  Cpu, 
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';
import { wasteAPI } from '../services/api';

export default function Encyclopedia() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [wasteItems, setWasteItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const selectedCategory = searchParams.get('category') || 'all';
  const recyclableFilter = searchParams.get('recyclable') || 'all';

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const catRes = await wasteAPI.getCategories();
        if (catRes.data.success) {
          setCategories(catRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (recyclableFilter === 'yes') params.recyclable = 1;
        if (recyclableFilter === 'no') params.recyclable = 0;

        const res = await wasteAPI.getWasteItems(params);
        if (res.data.success) {
          setWasteItems(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching waste items:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchItems();
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, recyclableFilter]);

  const handleCategoryChange = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    setSearchParams(newParams);
  };

  const handleRecyclableChange = (val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val === 'all') {
      newParams.delete('recyclable');
    } else {
      newParams.set('recyclable', val);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-brand-700 to-teal-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Katalog Panduan Pemilahan Sampah
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ensiklopedia Sampah Trashly
          </h1>
          <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
            Cari jenis barang atau material sampah yang Anda miliki. Ketahui cara pemilahan yang benar, potensi daur ulang, serta waktu urai alaminya di bumi.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama sampah (misal: botol plastik, baterai, kardus, masker)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills & Recyclable Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Kategori
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'text-white shadow-sm ring-2 ring-offset-1'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  style={{
                    backgroundColor: isSelected ? cat.color : undefined,
                    color: isSelected ? '#ffffff' : undefined,
                    outlineColor: cat.color
                  }}
                >
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }}
                  ></span>
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Daur Ulang Filter Options */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 text-xs">
            <span className="text-slate-400 font-medium">Bisa Didaur Ulang:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => handleRecyclableChange('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  recyclableFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => handleRecyclableChange('yes')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  recyclableFilter === 'yes' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Ya (Daur Ulang)
              </button>
              <button
                onClick={() => handleRecyclableChange('no')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  recyclableFilter === 'no' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Tidak (Residu/B3)
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Active filters note */}
      {(selectedCategory !== 'all' || searchQuery || recyclableFilter !== 'all') && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div>
            Menampilkan hasil untuk: 
            {selectedCategory !== 'all' && <span className="ml-1 font-bold text-slate-800">Kategori {selectedCategory}</span>}
            {searchQuery && <span className="ml-1 font-bold text-slate-800">"{searchQuery}"</span>}
            {recyclableFilter !== 'all' && (
              <span className="ml-1 font-bold text-slate-800">
                ({recyclableFilter === 'yes' ? 'Hanya Dapat Didaur Ulang' : 'Tidak Dapat Didaur Ulang'})
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-brand-600 hover:text-brand-800 font-bold underline cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* Waste Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
              <div className="h-44 bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-12 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : wasteItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Trash2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Sampah Tidak Ditemukan</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Tidak ada material sampah yang sesuai dengan kata kunci atau filter yang Anda pilih. Coba gunakan kata kunci umum atau reset filter.
          </p>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors"
          >
            Tampilkan Semua Sampah
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wasteItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Thumbnail Container */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80";
                  }}
                />

                {/* Recyclable Badge */}
                <div className="absolute top-3 right-3">
                  {item.is_recyclable ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md">
                      <Recycle className="w-3 h-3" />
                      Bisa Didaur Ulang
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md">
                      <AlertTriangle className="w-3 h-3" />
                      Residu / Khusus
                    </span>
                  )}
                </div>

                {/* Category Pill Over Image */}
                <div className="absolute bottom-3 left-3">
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm"
                    style={{
                      backgroundColor: item.badge_bg || '#f1f5f9',
                      color: item.badge_text || '#334155'
                    }}
                  >
                    {item.category_name}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-brand-600 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>
                </div>

                {/* Metadata Pill */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Urai: <strong>{item.decomposition_time}</strong>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Dampak: {item.impact_level}
                  </span>
                </div>

                {/* Action Link */}
                <Link
                  to={`/ensiklopedia/${item.slug || item.id}`}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 font-bold text-xs transition-colors border border-slate-200/70 hover:border-brand-200"
                >
                  Lihat Cara Pemilahan
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
