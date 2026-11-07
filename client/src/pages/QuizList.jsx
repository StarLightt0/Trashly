import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Sparkles, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  Trophy, 
  CheckCircle2, 
  Flame, 
  Recycle,
  AlertTriangle
} from 'lucide-react';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await quizAPI.getQuizzes();
        if (res.data.success) {
          setQuizzes(res.data.data);
        }
      } catch (err) {
        console.error('Gagal mengambil kuis:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Arena Gamifikasi Sampah
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Kuis Pilah Sampah Interaktif
          </h1>
          <p className="text-emerald-50 text-sm sm:text-base leading-relaxed">
            Uji ketangkasan dan pengetahuan Anda dalam memilah sampah sehari-hari. Jawab dengan benar, kumpulkan <strong>Eco-Points</strong>, dan naikkan peringkat Anda di papan skor nasional!
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-800 rounded-xl hover:bg-emerald-50 shadow-md transition-all active:scale-95 font-bold"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              Lihat Papan Peringkat
            </Link>
            {isAuthenticated && (
              <span className="inline-flex items-center gap-1.5 text-emerald-100 bg-emerald-900/40 px-3.5 py-2 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Poin Anda Saat Ini: <strong className="text-white">{user?.points || 0} Eco-Points</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quiz List Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Pilih Tantangan Kuis</h2>
            <p className="text-xs text-slate-500">Selesaikan kuis untuk mengklaim lencana dan Eco-Points</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-brand-100 text-brand-800 rounded-full">
            {quizzes.length} Kuis Tersedia
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(n => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                <div className="h-16 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 hover:border-brand-500 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  
                  {/* Badges Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                        quiz.difficulty === 'Mudah'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        Tingkat: {quiz.difficulty}
                      </span>
                      {quiz.is_locked && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Selesai ({quiz.last_score}%)
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 font-extrabold text-xs px-3 py-1 rounded-full border border-brand-200">
                      <Sparkles className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                      +{quiz.reward_points} Eco-Points
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {quiz.description}
                    </p>
                  </div>

                  {/* Details Pill */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-4 h-4 text-brand-600" />
                      {quiz.question_count || 5} Pertanyaan
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      ±{quiz.duration_minutes || 5} Menit
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      {quiz.badge_name}
                    </span>
                  </div>
                </div>

                {/* Start Button with 24h Lock */}
                {quiz.is_locked ? (
                  <div className="space-y-1.5">
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs border border-slate-200 cursor-not-allowed"
                    >
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Kuis Selesai Hari Ini</span>
                    </button>
                    <p className="text-[11px] text-center text-slate-400">
                      Batas 1x sehari. Dapat dikerjakan lagi dalam <strong>{quiz.hours_remaining} jam</strong>.
                    </p>
                  </div>
                ) : (
                  <Link
                    to={`/kuis/${quiz.slug || quiz.id}`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-extrabold text-sm shadow-md transition-all group-hover:shadow-lg active:scale-[0.98]"
                  >
                    <span>Mulai Kuis Sekarang</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gamification Tips */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          Cara Mengumpulkan Eco-Points:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">1. Registrasi Akun</span>
            <p>Dapatkan langsung <strong>+50 Poin</strong> saat pertama kali mendaftar akun Trashly.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">2. Selesaikan Kuis</span>
            <p>Raih hingga <strong>+150 Poin</strong> untuk setiap kuis yang Anda selesaikan dengan skor tinggi.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">3. Buka Lencana Spesial</span>
            <p>Naikkan peringkat dari <em>Pilah Pemula</em> hingga mencapai <em>Master Daur Ulang</em>!</p>
          </div>
        </div>
      </div>

    </div>
  );
}
