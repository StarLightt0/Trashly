import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { adminAPI } from '../../services/api';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  X,
  Check,
  AlertTriangle,
  Phone,
  Clock,
  Compass,
  CheckCircle2
} from 'lucide-react';

const COMMON_WASTE_TYPES = [
  'Plastik',
  'Kardus',
  'Kertas',
  'Minyak Jelantah',
  'E-Waste',
  'Logam',
  'Kaca',
  'Baterai'
];

function toDMS(lat, lng) {
  if (lat === undefined || lng === undefined || lat === '' || lng === '') return '';
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum)) return '';

  const latDir = latNum >= 0 ? 'N' : 'S';
  const lngDir = lngNum >= 0 ? 'E' : 'W';

  const absLat = Math.abs(latNum);
  const absLng = Math.abs(lngNum);

  const latD = Math.floor(absLat);
  const latM = Math.floor((absLat - latD) * 60);
  const latS = (((absLat - latD) * 60 - latM) * 60).toFixed(1);

  const lngD = Math.floor(absLng);
  const lngM = Math.floor((absLng - lngD) * 60);
  const lngS = (((absLng - lngD) * 60 - lngM) * 60).toFixed(1);

  return `${latD}°${latM}'${latS}"${latDir} ${lngD}°${lngM}'${lngS}"${lngDir}`;
}

export default function AdminBankSampah() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal & Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [deleteConfirmPoint, setDeleteConfirmPoint] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    city: 'Bandung',
    address: '',
    latitude: -6.9175,
    longitude: 107.6191,
    opening_hours: 'Senin - Sabtu: 08.00 - 16.00 WIB',
    contact_phone: '081234567890',
    incentive: 'Konversi poin reward & uang tunai',
    accepted_types: ['Plastik', 'Kardus', 'Logam']
  });

  // Mini-map picker refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDropPoints();
      if (res.data.success) {
        setPoints(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch drop points:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  // Setup Leaflet map picker when modal opens
  useEffect(() => {
    if (!isModalOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const initLat = parseFloat(formData.latitude) || -6.9175;
      const initLng = parseFloat(formData.longitude) || 107.6191;

      const map = L.map(mapContainerRef.current, {
        center: [initLat, initLng],
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Create Custom Pin
      const pinIcon = L.divIcon({
        className: 'admin-map-pin',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #16a34a;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
          ">
            📍
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([initLat, initLng], { icon: pinIcon }).addTo(map);
      markerRef.current = marker;

      // Handle map click to place pin
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lng.toFixed(6))
        }));
      });

      mapInstanceRef.current = map;
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isModalOpen]);

  const openCreateModal = () => {
    setEditingPoint(null);
    setFormData({
      name: '',
      city: 'Bandung',
      address: '',
      latitude: -6.9175,
      longitude: 107.6191,
      opening_hours: 'Senin - Sabtu: 08.00 - 16.00 WIB',
      contact_phone: '081234567890',
      incentive: 'Konversi poin reward & uang tunai',
      accepted_types: ['Plastik', 'Kardus', 'Logam']
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (point) => {
    setEditingPoint(point);
    setFormData({
      name: point.name || '',
      city: point.city || 'Bandung',
      address: point.address || '',
      latitude: parseFloat(point.latitude) || -6.9175,
      longitude: parseFloat(point.longitude) || 107.6191,
      opening_hours: point.opening_hours || '08:00 - 16:00 WIB',
      contact_phone: point.contact_phone || '',
      incentive: point.incentive || 'Konversi poin reward & uang tunai',
      accepted_types: Array.isArray(point.accepted_types) ? point.accepted_types : ['Plastik']
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const toggleWasteType = (type) => {
    setFormData((prev) => {
      const exists = prev.accepted_types.includes(type);
      return {
        ...prev,
        accepted_types: exists
          ? prev.accepted_types.filter((t) => t !== type)
          : [...prev.accepted_types, type]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      setFormError('Nama bank sampah dan alamat lengkap wajib diisi!');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError('');

      if (editingPoint) {
        await adminAPI.updateDropPoint(editingPoint.id, formData);
      } else {
        await adminAPI.createDropPoint(formData);
      }

      setIsModalOpen(false);
      fetchPoints();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data bank sampah.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmPoint) return;
    try {
      await adminAPI.deleteDropPoint(deleteConfirmPoint.id);
      setDeleteConfirmPoint(null);
      fetchPoints();
    } catch (err) {
      alert('Gagal menghapus data bank sampah.');
    }
  };

  const filteredPoints = points.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Direktori Bank Sampah & Titik Peta</h2>
          <p className="text-xs text-slate-500">Kelola 7+ lokasi titik setor sampah, jam buka, kontak WhatsApp, dan koordinat GPS peta</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Tambah Bank Sampah
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Cari nama bank sampah, alamat, atau kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Total: <strong>{filteredPoints.length}</strong> lokasi
        </span>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Memuat data bank sampah...</p>
          </div>
        ) : filteredPoints.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MapPin className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Tidak ada bank sampah ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Nama Bank Sampah</th>
                  <th className="py-3 px-4">Alamat & Kota</th>
                  <th className="py-3 px-4">Titik Koordinat</th>
                  <th className="py-3 px-4">Kontak & Jam Buka</th>
                  <th className="py-3 px-4">Jenis Sampah</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPoints.map((point) => (
                  <tr key={point.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-900">{point.name}</p>
                          <span className="text-[10px] text-brand-600 font-semibold">{point.city}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-600 line-clamp-2">
                      {point.address}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <code className="text-[11px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded block">
                          {point.latitude}, {point.longitude}
                        </code>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {toDMS(point.latitude, point.longitude)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" /> {point.opening_hours || '-'}
                      </p>
                      <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {point.contact_phone || '-'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(point.accepted_types || []).slice(0, 3).map((type, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                            {type}
                          </span>
                        ))}
                        {(point.accepted_types || []).length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500">
                            +{(point.accepted_types || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka di Google Maps"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(point)}
                          title="Edit Lokasi"
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmPoint(point)}
                          title="Hapus Lokasi"
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

      {/* Modal Tambah / Edit dengan Leaflet Picker */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col my-6">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editingPoint ? 'Edit Lokasi Bank Sampah' : 'Tambah Bank Sampah Baru'}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Bank Sampah *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bank Sampah Bersinar (BSB) Pusat"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kota / Wilayah *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bandung / Jakarta / Surabaya"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jl. Terusan Bojongsoang No.174, Baleendah..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Map Coordinate Picker */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-brand-600" /> Interactive Leaflet Map Picker
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Klik pada peta untuk menempatkan pin koordinat secara akurat
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-brand-600 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    Uji di Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Map Canvas */}
                <div
                  ref={mapContainerRef}
                  className="w-full h-52 rounded-xl border border-slate-300 shadow-inner overflow-hidden z-10"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Latitude (Lintang)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Longitude (Bujur)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span>Format DMS: <strong>{toDMS(formData.latitude, formData.longitude)}</strong></span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Tersinkronisasi Otomatis</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Operasional</label>
                  <input
                    type="text"
                    placeholder="Contoh: Senin - Sabtu: 08.00 - 16.00 WIB"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / Telepon</label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Multi-select Jenis Sampah yang Diterima */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Jenis Sampah yang Diterima</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_WASTE_TYPES.map((type) => {
                    const isSelected = formData.accepted_types.includes(type);
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => toggleWasteType(type)}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {type}
                      </button>
                    );
                  })}
                </div>
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
                  {formSubmitting ? 'Menyimpan...' : 'Simpan Lokasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base mb-1">Hapus Lokasi Bank Sampah?</h4>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>"{deleteConfirmPoint.name}"</strong>? Titik ini tidak akan muncul lagi pada peta pengguna.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmPoint(null)}
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
