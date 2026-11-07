import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Sparkles, 
  Award, 
  Trophy, 
  Recycle, 
  Leaf, 
  Clock, 
  Edit3, 
  Check, 
  X, 
  HelpCircle, 
  ArrowRight, 
  Upload, 
  Camera, 
  AlertCircle, 
  Loader2,
  Trash2
} from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AVATAR_SEEDS = [
  'EcoWarrior',
  'GreenHero',
  'Solaris',
  'CyberPilah',
  'Botanist',
  'RecyclePro'
];

// Helper to downscale and crop image to a crisp, lightweight square avatar
function processAvatarFile(file, maxSize = 450, quality = 0.90) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2;
          const sy = (img.height - side) / 2;

          const canvas = document.createElement('canvas');
          const targetSize = Math.min(maxSize, side);
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext('2d');
          // Fill background with clean white so transparent PNG does not render as black
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetSize, targetSize);
          ctx.drawImage(img, sx, sy, side, side, 0, 0, targetSize, targetSize);

          const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
          const format = isPng ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(format, quality);
          resolve(dataUrl);
        } catch (err) {
          if (e.target.result && e.target.result.startsWith('data:image/')) {
            resolve(e.target.result);
          } else {
            reject(new Error('Gagal memproses gambar avatar.'));
          }
        }
      };
      img.onerror = () => {
        if (e.target.result && e.target.result.startsWith('data:image/')) {
          resolve(e.target.result);
        } else {
          reject(new Error('Gagal membaca data gambar dari perangkat.'));
        }
      };
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file dari perangkat.'));
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const { user: authUser, isAuthenticated, updateUserData, updateUserPoints, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    async function fetchDashboard() {
      try {
        const res = await userAPI.getDashboard();
        if (res.data.success) {
          setDashboardData(res.data.data);
          setEditName(res.data.data.user.name);
          setSelectedAvatar(res.data.data.user.avatar || '');
          if (typeof res.data.data.user.points === 'number') {
            updateUserPoints(res.data.data.user.points);
          }
        }
      } catch (err) {
        console.error('Gagal mengambil data profil:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [isAuthenticated, navigate, updateUserPoints]);

  // Handle direct file upload from user's device
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so user can re-select same file if needed
    e.target.value = '';

    // 1. Validate format (PNG, JPG, JPEG)
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const fileName = file.name.toLowerCase();
    const isExtensionValid = fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');

    if (!validTypes.includes(file.type) && !isExtensionValid) {
      setStatusMessage({
        type: 'error',
        text: 'Format file tidak didukung! Harap unggah file foto berformat PNG atau JPG/JPEG.'
      });
      return;
    }

    // 2. Validate size (Max 2 MB = 2 * 1024 * 1024 bytes)
    const MAX_SIZE_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setStatusMessage({
        type: 'error',
        text: `Ukuran file (${sizeMB} MB) melebihi batas maksimal 2 MB!`
      });
      return;
    }

    setUploadingPhoto(true);
    setStatusMessage({ type: '', text: '' });

    try {
      // Compress and format to crisp square avatar
      const processedBase64 = await processAvatarFile(file);

      // Immediately save to backend so it persists permanently
      const currentName = editName || dashboardData?.user?.name || authUser?.name;
      const res = await userAPI.updateProfile({
        name: currentName,
        avatar: processedBase64
      });

      if (res.data.success) {
        setSelectedAvatar(processedBase64);
        setDashboardData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            avatar: processedBase64
          }
        }));
        updateUserData({ avatar: processedBase64 });
        await refreshUser();

        setStatusMessage({
          type: 'success',
          text: 'Foto profil dari perangkat Anda berhasil diunggah dan disimpan!'
        });
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
      } else {
        throw new Error(res.data.message || 'Gagal menyimpan foto.');
      }
    } catch (err) {
      console.error('Error saat upload foto:', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Gagal mengunggah foto profil dari perangkat.'
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const res = await userAPI.updateProfile({
        name: editName,
        avatar: selectedAvatar
      });
      if (res.data.success) {
        setDashboardData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            name: res.data.user.name,
            avatar: res.data.user.avatar
          }
        }));
        updateUserData({
          name: res.data.user.name,
          avatar: res.data.user.avatar
        });
        await refreshUser();
        setIsEditing(false);
        setStatusMessage({
          type: 'success',
          text: 'Profil Anda berhasil diperbarui!'
        });
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Gagal memperbarui profil.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 font-semibold">Memuat profil Eco Warrior...</p>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { user, rankBadge, stats, recentAttempts } = dashboardData;
  const currentAvatar = selectedAvatar || user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`;
  const progressPercent = Math.min(
    100,
    Math.round((user.points / (rankBadge.targetPoints || 350)) * 100)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Hidden File Input for Device Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Global Status Toast / Alert */}
      {statusMessage.text && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold shadow-md transition-all ${
          statusMessage.type === 'error'
            ? 'bg-rose-50 border border-rose-200 text-rose-700'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage({ type: '', text: '' })}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          
          {/* Avatar and Basic Details */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            
            {/* Interactive Avatar Container with Visible Camera Button */}
            <div className="relative group">
              <img
                src={currentAvatar}
                alt={user.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-brand-100 bg-slate-50 shadow-md object-cover"
              />

              {/* Upload Photo Button Overlay on Hover */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Ganti Foto Profil dari Perangkat (PNG/JPG, Maks 2MB)"
                className="absolute inset-0 rounded-3xl bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <>
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Ganti Foto</span>
                  </>
                )}
              </button>

              {/* Always Visible Camera Action Button at Corner */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Pilih Foto dari Perangkat (PNG / JPG, Maks 2 MB)"
                className="absolute -bottom-2 -right-2 p-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-xl shadow-lg border-2 border-white transition-all cursor-pointer z-10 flex items-center justify-center"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {rankBadge.title}
                </span>
              </div>
              <p className="text-xs text-slate-400">{user.email}</p>
              
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                  {user.points} Eco-Points
                </span>
                <span>•</span>
                <span>Level {rankBadge.level}</span>
              </div>

              {/* Direct Upload Buttons under Details */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold rounded-lg border border-brand-200/80 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-brand-600" />
                  {uploadingPhoto ? 'Mengunggah...' : 'Upload Foto Perangkat'}
                </button>
                <span className="text-[10px] text-slate-400 font-medium">PNG / JPG, Maks 2 MB</span>
              </div>
            </div>

          </div>

          {/* Action: Edit Profile Drawer Button */}
          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Ubah Profil & Karakter
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" /> Tutup Form
              </button>
            )}
          </div>

        </div>

        {/* Edit Form Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-slate-100 space-y-6">
            
            {/* Change Display Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Tampilan Anda
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Masukkan nama tampilan baru"
                className="w-full sm:w-96 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800 font-medium"
              />
            </div>

            {/* Custom Device Photo Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Foto Profil dari Perangkat Sendiri
                </label>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  PNG / JPG (Maks 2 MB)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={currentAvatar}
                    alt="Preview Avatar"
                    className="w-16 h-16 rounded-2xl border-2 border-brand-400 bg-white object-cover shadow-sm"
                  />
                  {selectedAvatar?.startsWith('data:image/') && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] shadow">
                      ✓
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingPhoto ? 'Sedang Memproses...' : 'Pilih Foto dari Perangkat (PNG/JPG)'}
                    </button>

                    {selectedAvatar?.startsWith('data:image/') && (
                      <button
                        type="button"
                        onClick={() => setSelectedAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${editName || user.name}`)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-rose-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus Foto Sendiri
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pilih file foto dari galeri HP atau folder laptop Anda. Sistem otomatis memotong menjadi avatar proporsional.
                  </p>
                </div>
              </div>
            </div>

            {/* Character Preset Avatars */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Atau Pilih Karakter Eco-Bot (Preset)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {AVATAR_SEEDS.map((seed) => {
                  const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                  const isSelected = selectedAvatar === url;
                  return (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => setSelectedAvatar(url)}
                      className={`w-14 h-14 rounded-2xl p-1 border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-400 scale-105 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <img src={url} alt={seed} className="w-full h-full object-cover rounded-xl" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Changes Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Menyimpan Perubahan...' : 'Simpan Nama & Foto Profil'}
              </button>
            </div>
          </form>
        )}

        {/* Level Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Progress Menuju: <strong className="text-slate-800">{rankBadge.nextTitle}</strong></span>
            <span>{user.points} / {rankBadge.targetPoints} Poin ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Recycle className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{stats.bottlesSaved}</div>
            <div className="text-xs text-slate-500 font-medium">Botol Plastik Diselamatkan</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Leaf className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{stats.co2SavedKg} kg</div>
            <div className="text-xs text-slate-500 font-medium">Emisi CO2 Dicegah</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{stats.totalQuizzesTaken}</div>
            <div className="text-xs text-slate-500 font-medium">Kuis Telah Diselesaikan</div>
          </div>
        </div>

      </div>

      {/* Quiz History Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Riwayat Kuis & Pencapaian</h2>
            <p className="text-xs text-slate-400">Histori perolehan skor dan poin dari kuis yang Anda ikuti</p>
          </div>
          <Link
            to="/kuis"
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            Ikuti Kuis Baru <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Belum ada riwayat kuis</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Ikuti kuis pemilahan sampah sekarang untuk mendapatkan poin dan menguji pemahaman Anda!
            </p>
            <Link
              to="/kuis"
              className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors"
            >
              Mulai Kuis Pertama Anda
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentAttempts.map((attempt) => (
              <div key={attempt.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-extrabold text-slate-900">
                    {attempt.quiz_title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(attempt.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span>•</span>
                    <span className="text-brand-600 font-semibold">{attempt.badge_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-slate-400">Skor</div>
                    <div className="text-base font-black text-slate-900">{attempt.score}%</div>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl font-black text-xs">
                    +{attempt.points_earned} Pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
