import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  ShieldCheck
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

export default function Profile() {
  const { user: authUser, isAuthenticated, updateUserData, updateUserPoints, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
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
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui profil.');
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
  const progressPercent = Math.min(
    100,
    Math.round((user.points / (rankBadge.targetPoints || 350)) * 100)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          
          {/* Avatar and Basic Details */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                alt={user.name}
                className="w-24 h-24 rounded-3xl border-4 border-brand-100 bg-slate-50 shadow-md object-cover"
              />
              <span className="absolute -bottom-2 -right-2 p-1.5 bg-brand-600 text-white rounded-xl shadow">
                <Sparkles className="w-4 h-4" />
              </span>
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
            </div>
          </div>

          {/* Action: Edit Profile Button */}
          <div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Ubah Profil & Avatar
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                <X className="w-4 h-4" /> Batal
              </button>
            )}
          </div>

        </div>

        {/* Edit Form Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ubah Nama Tampilan
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full sm:w-96 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pilih Karakter Avatar
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
                      className={`w-14 h-14 rounded-2xl p-1 border-2 transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-400'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <img src={url} alt={seed} className="w-full h-full object-cover rounded-xl" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            Profil Anda berhasil diperbarui!
          </div>
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
