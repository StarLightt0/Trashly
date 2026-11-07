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
  Trash2,
  Lock,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  KeyRound,
  RotateCcw
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
  const { user: authUser, isAuthenticated, updateUserData, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'history'

  // Editable Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    bio: '',
    avatar: ''
  });

  // Password Change Form State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', text: '' });

  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    let isMounted = true;

    async function fetchDashboard() {
      try {
        const res = await userAPI.getDashboard();
        if (res.data.success && isMounted) {
          const u = res.data.data.user;
          setDashboardData(res.data.data);

          // Only initialize formData from server on first fetch so user typing is NEVER overwritten
          if (!isLoadedRef.current) {
            setFormData({
              name: u.name || '',
              email: u.email || '',
              phone: u.phone || '',
              institution: u.institution || 'Universitas Teknologi Bandung',
              bio: u.bio || '',
              avatar: u.avatar || ''
            });
            isLoadedRef.current = true;
          }
        }
      } catch (err) {
        console.error('Gagal mengambil data profil:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle direct file upload from user's device (PNG / JPG, max 2MB)
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
      // Compress and crop to crisp square avatar
      const processedBase64 = await processAvatarFile(file);

      // Immediately reflect in form preview
      setFormData(prev => ({ ...prev, avatar: processedBase64 }));

      // Save directly to backend so changes persist immediately
      const currentName = formData.name || dashboardData?.user?.name || authUser?.name;
      const res = await userAPI.updateProfile({
        name: currentName,
        avatar: processedBase64,
        bio: formData.bio,
        phone: formData.phone,
        institution: formData.institution
      });

      if (res.data.success) {
        const updatedUser = res.data.user;
        setDashboardData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            ...updatedUser
          }
        }));
        updateUserData(updatedUser);
        await refreshUser();

        setStatusMessage({
          type: 'success',
          text: 'Foto profil dari perangkat Anda berhasil diunggah dan disimpan!'
        });
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);
      } else {
        throw new Error(res.data.message || 'Gagal menyimpan foto profil.');
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

  // Select Preset Dicebear Avatar
  const handleSelectPresetAvatar = (url) => {
    setFormData(prev => ({ ...prev, avatar: url }));
  };

  // Reset to default robot avatar
  const handleResetToDefaultAvatar = () => {
    const defaultUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formData.name || 'User')}`;
    setFormData(prev => ({ ...prev, avatar: defaultUrl }));
  };

  // Save All Profile Changes (Username, Photo, Bio, Phone, Institution)
  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanName = (formData.name || '').trim();

    if (!cleanName) {
      setStatusMessage({ type: 'error', text: 'Username / Nama Pengguna tidak boleh kosong!' });
      return;
    }
    if (cleanName.length < 2) {
      setStatusMessage({ type: 'error', text: 'Username minimal terdiri dari 2 karakter!' });
      return;
    }

    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const payload = {
        name: cleanName,
        avatar: formData.avatar,
        bio: formData.bio,
        phone: formData.phone,
        institution: formData.institution
      };

      const res = await userAPI.updateProfile(payload);
      if (res.data.success) {
        const updatedUser = res.data.user;
        setDashboardData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            ...updatedUser
          }
        }));
        updateUserData(updatedUser);
        await refreshUser();

        setStatusMessage({
          type: 'success',
          text: 'Selamat! Username dan data profil Anda berhasil diperbarui.'
        });
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);
      } else {
        throw new Error(res.data.message || 'Gagal memperbarui profil.');
      }
    } catch (err) {
      console.error('Error saat update profile:', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Gagal memperbarui profil.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset Form to Last Saved Server Data
  const handleResetForm = () => {
    if (dashboardData?.user) {
      const u = dashboardData.user;
      setFormData({
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        institution: u.institution || 'Universitas Teknologi Bandung',
        bio: u.bio || '',
        avatar: u.avatar || ''
      });
      setStatusMessage({
        type: 'info',
        text: 'Formulir profil telah dikembalikan ke data tersimpan.'
      });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    }
  };

  // Change Password Handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setPasswordStatus({ type: 'error', text: 'Password lama dan baru wajib diisi!' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', text: 'Password baru minimal 6 karakter!' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'Konfirmasi password baru tidak cocok!' });
      return;
    }

    setSavingPassword(true);
    setPasswordStatus({ type: '', text: '' });

    try {
      const res = await userAPI.changePassword(passwordData);
      if (res.data.success) {
        setPasswordStatus({
          type: 'success',
          text: 'Password akun Anda berhasil diubah! Gunakan password baru saat login.'
        });
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordStatus({ type: '', text: '' }), 5000);
      }
    } catch (err) {
      setPasswordStatus({
        type: 'error',
        text: err.response?.data?.message || 'Gagal mengubah password. Pastikan password lama benar.'
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 font-bold">Memuat Dashboard Profil Pengguna...</p>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { user, rankBadge, stats, recentAttempts } = dashboardData;
  const currentAvatar = formData.avatar || user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`;
  const progressPercent = Math.min(
    100,
    Math.round((user.points / (rankBadge.targetPoints || 350)) * 100)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hidden File Input for Device Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <User className="w-7 h-7 text-brand-600" />
            Profil & Pengaturan Akun
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola identitas, foto profil, username, dan pantau progres Eco-Points Anda di platform Trashly.
          </p>
        </div>

        {/* Quick Points Indicator */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl shrink-0">
          <Sparkles className="w-5 h-5 text-emerald-600 fill-emerald-600" />
          <div>
            <div className="text-xs font-bold text-emerald-700">Total Eco-Points</div>
            <div className="text-lg font-black text-emerald-900 leading-none">{user.points} Pts</div>
          </div>
        </div>
      </div>

      {/* Global Status Alert Banner */}
      {statusMessage.text && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-bold shadow-sm transition-all ${
          statusMessage.type === 'error'
            ? 'bg-rose-50 border border-rose-200 text-rose-700'
            : statusMessage.type === 'info'
            ? 'bg-blue-50 border border-blue-200 text-blue-800'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : statusMessage.type === 'info' ? (
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
            ) : (
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage({ type: '', text: '' })}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: User Identity Card (4 of 12 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md relative overflow-hidden text-center sm:text-left">
            <div className="absolute top-0 right-0 w-44 h-44 bg-brand-100/50 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              
              {/* Avatar Container with Direct Upload Camera Badge */}
              <div className="relative group mb-4">
                <img
                  src={currentAvatar}
                  alt={formData.name || user.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-4 border-brand-100 bg-slate-50 shadow-md object-cover"
                />

                {/* Upload Photo Hover Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  title="Klik untuk memilih foto dari perangkat (PNG / JPG, Maks 2 MB)"
                  className="absolute inset-0 rounded-3xl bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[11px] font-bold">Ganti Foto</span>
                    </>
                  )}
                </button>

                {/* Always-Visible Corner Camera Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  title="Pilih foto dari galeri / laptop"
                  className="absolute -bottom-2 -right-2 p-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-2xl shadow-lg border-2 border-white transition-all cursor-pointer z-10"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* User Live Display Name */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight text-center break-words max-w-full">
                {formData.name || user.name}
              </h2>
              <p className="text-xs text-slate-400 font-medium text-center mt-0.5">
                {user.email}
              </p>

              {/* Rank & Level Badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 shadow-2xs">
                <Award className="w-3.5 h-3.5 text-brand-600" />
                <span>Level {rankBadge.level}: {rankBadge.title}</span>
              </div>

              {/* Bio Preview if exists */}
              {formData.bio && (
                <p className="mt-4 text-xs text-slate-600 italic text-center bg-slate-50 p-3 rounded-2xl border border-slate-100 w-full">
                  "{formData.bio}"
                </p>
              )}

              {/* Quick Details List */}
              <div className="w-full mt-5 pt-5 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Institusi
                  </span>
                  <span className="font-bold text-slate-800 truncate max-w-[170px]" title={formData.institution || 'Universitas Teknologi Bandung'}>
                    {formData.institution || 'Universitas Teknologi Bandung'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Telepon
                  </span>
                  <span className="font-bold text-slate-800">
                    {formData.phone || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Bergabung
                  </span>
                  <span className="font-bold text-slate-800">
                    {new Date(user.created_at || Date.now()).toLocaleDateString('id-ID', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Level Progress Bar */}
              <div className="w-full mt-5 pt-5 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Target: <strong className="text-slate-800">{rankBadge.nextTitle}</strong></span>
                  <span>{user.points} / {rankBadge.targetPoints} Pts</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Upload Photo Button under Card */}
              <div className="w-full mt-5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="w-full py-2.5 px-4 bg-brand-50 hover:bg-brand-100 active:scale-98 text-brand-800 text-xs font-bold rounded-xl border border-brand-200/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-brand-600" />
                  {uploadingPhoto ? 'Sedang Memproses Foto...' : 'Unggah Foto dari Perangkat'}
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-1.5">
                  Format PNG / JPG / JPEG, maksimal 2 MB
                </p>
              </div>

            </div>
          </div>

          {/* Environmental Impact Summary */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-600" /> Kontribusi Lingkungan Anda
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100">
                <div className="text-lg font-black text-blue-900">{stats.bottlesSaved}</div>
                <div className="text-[11px] text-blue-700 font-medium">Botol Diselamatkan</div>
              </div>
              <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
                <div className="text-lg font-black text-emerald-900">{stats.co2SavedKg} kg</div>
                <div className="text-[11px] text-emerald-700 font-medium">CO2 Dicegah</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Profile Edit Form & Tabs (8 of 12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs Navigation Header */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Edit Biodata & Profil</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Keamanan & Password</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Riwayat Kuis ({stats.totalQuizzesTaken})</span>
            </button>
          </div>

          {/* TAB 1: EDIT BIODATA & PROFIL */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900">Pengaturan Biodata & Profil</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah username, foto profil dari perangkat, biodata, dan informasi kontak Anda.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* 1. Username / Nama Pengguna (ALWAYS VISIBLE & EDITABLE) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="profile-username-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-600" /> Username / Nama Pengguna <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Bisa diketik & diedit langsung</span>
                  </div>
                  <input
                    id="profile-username-input"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan username atau nama lengkap Anda"
                    className="w-full px-4 py-3 bg-slate-50/80 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Nama ini akan tampil di Papan Peringkat (Leaderboard), sertifikat kuis, dan header navigasi.
                  </p>
                </div>

                {/* 2. Registered Email (Read-Only) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="profile-email-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" /> Alamat Email Terdaftar
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> Terverifikasi
                    </span>
                  </div>
                  <input
                    id="profile-email-input"
                    name="email"
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-500 cursor-not-allowed select-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    Email digunakan sebagai identitas akun utama untuk login dan tidak dapat diubah sembarangan.
                  </p>
                </div>

                {/* 3. Phone & Institution (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="profile-phone-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-600" /> Nomor Telepon / WhatsApp
                    </label>
                    <input
                      id="profile-phone-input"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="profile-institution-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-600" /> Institusi / Kampus / Sekolah
                    </label>
                    <input
                      id="profile-institution-input"
                      name="institution"
                      type="text"
                      value={formData.institution}
                      onChange={handleInputChange}
                      placeholder="Contoh: Universitas Teknologi Bandung"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* 4. Bio / Slogan Lingkungan */}
                <div className="space-y-2">
                  <label htmlFor="profile-bio-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Bio / Motto Ramah Lingkungan
                  </label>
                  <textarea
                    id="profile-bio-input"
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tuliskan komitmen atau motto Anda dalam menjaga lingkungan dan memilah sampah..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  ></textarea>
                </div>

                {/* 5. Foto Profil Section */}
                <div className="p-5 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-brand-600" /> Foto Profil & Avatar
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Unggah foto dari perangkat Anda atau pilih karakter bot yang tersedia.
                      </p>
                    </div>
                    <span className="inline-block text-[10px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
                      Format PNG/JPG, Maks 2 MB
                    </span>
                  </div>

                  {/* Device Photo Upload Trigger & Preview */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200/80">
                    <div className="relative shrink-0">
                      <img
                        src={currentAvatar}
                        alt="Preview Foto"
                        className="w-16 h-16 rounded-2xl border-2 border-brand-400 bg-slate-50 object-cover shadow-xs"
                      />
                      {formData.avatar?.startsWith('data:image/') && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] shadow font-black">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {uploadingPhoto ? 'Sedang Memproses Foto...' : 'Pilih Foto dari Perangkat (PNG / JPG)'}
                        </button>

                        {formData.avatar?.startsWith('data:image/') && (
                          <button
                            type="button"
                            onClick={handleResetToDefaultAvatar}
                            className="inline-flex items-center gap-1 px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus Foto Sendiri
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Klik tombol di atas untuk memilih foto dari galeri HP atau folder laptop Anda.
                      </p>
                    </div>
                  </div>

                  {/* Character Preset Avatars */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Atau Pilih Karakter Eco-Bot (Preset Dicebear):
                    </label>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {AVATAR_SEEDS.map((seed) => {
                        const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                        const isSelected = formData.avatar === url;
                        return (
                          <button
                            key={seed}
                            type="button"
                            onClick={() => handleSelectPresetAvatar(url)}
                            className={`w-13 h-13 rounded-2xl p-1 border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-400 scale-105 shadow-sm'
                                : 'border-slate-200 hover:border-brand-300 bg-white'
                            }`}
                            title={`Gunakan Avatar ${seed}`}
                          >
                            <img src={url} alt={seed} className="w-full h-full object-cover rounded-xl" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Submit Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Formulir
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan Perubahan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Simpan Semua Perubahan Profil</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* TAB 2: KEAMANAN & UBAH PASSWORD */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-brand-600" /> Keamanan & Ganti Password
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pastikan akun Trashly Anda tetap terlindungi dengan kata sandi yang kuat dan aman.
                </p>
              </div>

              {passwordStatus.text && (
                <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold shadow-xs ${
                  passwordStatus.type === 'error'
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {passwordStatus.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span>{passwordStatus.text}</span>
                  </div>
                  <button
                    onClick={() => setPasswordStatus({ type: '', text: '' })}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-5 max-w-lg">
                
                <div className="space-y-1.5">
                  <label htmlFor="old-password-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Password Saat Ini <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="old-password-input"
                    name="oldPassword"
                    type="password"
                    required
                    value={passwordData.oldPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Masukkan password akun yang sedang aktif"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="new-password-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Password Baru <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Minimal 6 karakter</span>
                  </div>
                  <input
                    id="new-password-input"
                    name="newPassword"
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Masukkan password baru yang kuat"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirm-password-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Konfirmasi Password Baru <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="confirm-password-input"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Ketik ulang password baru Anda"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan Password...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Perbarui Kata Sandi</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* TAB 3: RIWAYAT KUIS & PENCAPAIAN */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Riwayat Kuis & Skor</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Daftar kuis pemilahan sampah yang telah Anda selesaikan.</p>
                </div>
                <Link
                  to="/kuis"
                  className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200/80"
                >
                  Ikuti Kuis Baru <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentAttempts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Belum ada riwayat kuis</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Ayo ikuti kuis pemilahan sampah sekarang untuk mendapatkan Eco-Points dan naik level!
                  </p>
                  <Link
                    to="/kuis"
                    className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm"
                  >
                    Mulai Kuis Pertama
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
                          <div className="text-[11px] font-semibold text-slate-400">Skor</div>
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
          )}

        </div>

      </div>

    </div>
  );
}