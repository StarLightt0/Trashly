import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Sparkles, 
  Award, 
  ArrowRight, 
  Flame, 
  UserCheck, 
  Crown,
  Medal,
  HelpCircle
} from 'lucide-react';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await quizAPI.getLeaderboard();
        if (res.data.success) {
          setLeaderboard(res.data.data);
        }
      } catch (err) {
        console.error('Gagal mengambil leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  // Find current user's rank info in the leaderboard
  const currentUserEntry = leaderboard.find(
    item => (user?.id && String(item.id) === String(user.id)) || (user?.email && item.email === user.email)
  );

  const topThree = leaderboard.slice(0, 3);

  const isUserMatch = (item) => {
    if (!user || !item) return false;
    return (user.id && String(item.id) === String(user.id)) || (user.email && item.email === user.email);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase tracking-wider shadow-sm">
          <Trophy className="w-4 h-4 text-amber-600" />
          Papan Skor Nasional Eco Warriors
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Peringkat Penggiat Sampah
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Daftar pejuang lingkungan dengan akumulasi Eco-Points tertinggi dari hasil kuis edukasi dan pemilahan sampah.
        </p>
      </div>

      {/* Pinned User Rank Card (Always visible when logged in) */}
      {isAuthenticated && (
        <div className="bg-gradient-to-r from-emerald-600 via-brand-600 to-teal-700 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-4 text-center sm:text-left z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex flex-col items-center justify-center shrink-0 shadow-inner">
              <span className="text-[10px] uppercase font-bold text-emerald-100">Posisi</span>
              <span className="text-xl sm:text-2xl font-black leading-none">
                #{currentUserEntry?.rank || '-'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-extrabold text-base sm:text-lg">{user?.name}</span>
                <span className="bg-white/25 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase">
                  Akun Anda
                </span>
              </div>
              <div className="text-xs text-emerald-100 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span>{currentUserEntry?.badge || 'Sahabat Bumi 🌱'}</span>
                <span>•</span>
                <span className="font-black text-white text-sm">
                  {currentUserEntry?.points !== undefined ? currentUserEntry.points : (user?.points || 0)} Eco-Points
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10 shrink-0">
            <Link
              to="/kuis"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-emerald-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-emerald-50 transition-all active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              Kerjakan Kuis & Tambah Poin
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500 font-semibold">Memuat data peringkat...</p>
        </div>
      ) : (
        <>
          {/* Podium for Top 3 */}
          {topThree.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end pt-4 pb-2 max-w-2xl mx-auto">
              
              {/* Rank 2 (Silver) */}
              <div className={`bg-white rounded-3xl p-4 sm:p-6 border-2 shadow-md text-center flex flex-col items-center space-y-3 order-1 h-[255px] justify-between transition-all ${
                isUserMatch(topThree[1]) ? 'border-brand-500 ring-2 ring-brand-400 bg-brand-50/30' : 'border-slate-200'
              }`}>
                <div className="relative">
                  <img
                    src={topThree[1].avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${topThree[1].name}`}
                    alt={topThree[1].name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-slate-300 bg-slate-100 shadow"
                  />
                  <span className="absolute -bottom-2 right-0 w-6 h-6 rounded-full bg-slate-400 text-white font-black text-xs flex items-center justify-center shadow">
                    2
                  </span>
                  {isUserMatch(topThree[1]) && (
                    <span className="absolute -top-2 -left-2 px-2 py-0.5 bg-brand-600 text-white font-black text-[9px] rounded-full shadow">
                      Anda
                    </span>
                  )}
                </div>
                <div className="space-y-0.5 w-full">
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                    {topThree[1].name}
                  </h3>
                  <div className="text-[10px] text-slate-400 font-semibold truncate">
                    {topThree[1].badge}
                  </div>
                </div>
                <div className="px-3 py-1 bg-slate-100 text-slate-700 font-black text-xs sm:text-sm rounded-xl">
                  {topThree[1].points} Pts
                </div>
              </div>

              {/* Rank 1 (Gold - Taller) */}
              <div className={`bg-gradient-to-b from-amber-50 to-white rounded-3xl p-4 sm:p-6 border-2 shadow-xl text-center flex flex-col items-center space-y-3 order-2 h-[295px] justify-between relative -translate-y-2 transition-all ${
                isUserMatch(topThree[0]) ? 'border-amber-500 ring-4 ring-amber-300' : 'border-amber-400'
              }`}>
                <div className="absolute -top-3.5 px-3 py-0.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 fill-white" /> Juara 1
                </div>
                <div className="relative mt-2">
                  <img
                    src={topThree[0].avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${topThree[0].name}`}
                    alt={topThree[0].name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-400 bg-amber-100 shadow-md"
                  />
                  <span className="absolute -bottom-2 right-0 w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow">
                    🥇
                  </span>
                  {isUserMatch(topThree[0]) && (
                    <span className="absolute -top-2 -left-2 px-2 py-0.5 bg-brand-600 text-white font-black text-[9px] rounded-full shadow">
                      Anda
                    </span>
                  )}
                </div>
                <div className="space-y-0.5 w-full">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                    {topThree[0].name}
                  </h3>
                  <div className="text-[11px] text-amber-700 font-bold truncate">
                    {topThree[0].badge}
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-amber-500 text-white font-black text-xs sm:text-base rounded-xl shadow-sm">
                  {topThree[0].points} Pts
                </div>
              </div>

              {/* Rank 3 (Bronze) */}
              <div className={`bg-white rounded-3xl p-4 sm:p-6 border-2 shadow-md text-center flex flex-col items-center space-y-3 order-3 h-[240px] justify-between transition-all ${
                isUserMatch(topThree[2]) ? 'border-brand-500 ring-2 ring-brand-400 bg-brand-50/30' : 'border-amber-200'
              }`}>
                <div className="relative">
                  <img
                    src={topThree[2].avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${topThree[2].name}`}
                    alt={topThree[2].name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-300 bg-amber-50 shadow"
                  />
                  <span className="absolute -bottom-2 right-0 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow">
                    3
                  </span>
                  {isUserMatch(topThree[2]) && (
                    <span className="absolute -top-2 -left-2 px-2 py-0.5 bg-brand-600 text-white font-black text-[9px] rounded-full shadow">
                      Anda
                    </span>
                  )}
                </div>
                <div className="space-y-0.5 w-full">
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                    {topThree[2].name}
                  </h3>
                  <div className="text-[10px] text-slate-400 font-semibold truncate">
                    {topThree[2].badge}
                  </div>
                </div>
                <div className="px-3 py-1 bg-amber-100 text-amber-900 font-black text-xs sm:text-sm rounded-xl">
                  {topThree[2].points} Pts
                </div>
              </div>

            </div>
          )}

          {/* Full Ranked Table: Displays ALL Users (Rank 1 to End) */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="w-14 text-center">Peringkat</span>
              <span className="flex-1">Pengguna Eco Warrior</span>
              <span className="w-32 text-right">Total Eco-Points</span>
            </div>

            <div className="divide-y divide-slate-100">
              {leaderboard.map((item) => {
                const isCurrentUser = isUserMatch(item);

                return (
                  <div
                    key={item.id}
                    className={`px-6 py-4 flex items-center justify-between transition-all ${
                      isCurrentUser
                        ? 'bg-emerald-50/90 border-l-4 border-l-brand-600 shadow-sm'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="w-14 text-center font-extrabold text-sm flex items-center justify-center">
                      {item.rank === 1 && <span className="text-xl">🥇</span>}
                      {item.rank === 2 && <span className="text-xl">🥈</span>}
                      {item.rank === 3 && <span className="text-xl">🥉</span>}
                      {item.rank > 3 && (
                        <span className={isCurrentUser ? 'text-brand-700 font-black' : 'text-slate-500'}>
                          #{item.rank}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 flex items-center gap-3">
                      <img
                        src={item.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.name}`}
                        alt={item.name}
                        className={`w-10 h-10 rounded-full border bg-slate-100 object-cover ${
                          isCurrentUser ? 'border-brand-500 ring-2 ring-brand-300' : 'border-slate-200'
                        }`}
                      />
                      <div>
                        <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <span>{item.name}</span>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 bg-brand-600 text-white rounded text-[10px] font-black uppercase tracking-wider shadow-sm">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {item.badge}
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="w-32 text-right font-black text-sm text-brand-700">
                      {item.points} Pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* CTA Box */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-extrabold text-lg">Ingin Naikkan Peringkat Anda?</h3>
          <p className="text-xs text-slate-400">Kerjakan kuis pemilahan sampah dan kumpulkan poin lebih banyak setiap harinya!</p>
        </div>
        <Link
          to="/kuis"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl text-xs transition-colors shadow-lg shadow-brand-600/30 whitespace-nowrap"
        >
          Mulai Kuis Sekarang →
        </Link>
      </div>

    </div>
  );
}
