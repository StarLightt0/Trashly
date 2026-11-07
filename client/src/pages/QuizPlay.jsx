import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Trophy, 
  Award, 
  RotateCcw, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUserPoints, refreshUser } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOption }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      setError(null);
      try {
        const res = await quizAPI.getQuizDetail(id);
        if (res.data.success) {
          setQuiz(res.data.data);
          setQuestions(res.data.data.questions || []);
        } else {
          setError(res.data.message || 'Kuis tidak ditemukan.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat kuis.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [id]);

  const handleSelectOption = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = async () => {
    // Check if at least one question is answered
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      if (!window.confirm(`Anda baru menjawab ${answeredCount} dari ${questions.length} pertanyaan. Yakin ingin mengirim sekarang?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await quizAPI.submitQuiz(id, answers);
      if (res.data.success) {
        setResult(res.data.result);
        if (res.data.result.new_total_points !== null && res.data.result.new_total_points !== undefined) {
          updateUserPoints(res.data.result.new_total_points);
        }
        await refreshUser();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim jawaban.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 font-semibold">Memuat pertanyaan kuis...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error || 'Kuis tidak ditemukan'}</h2>
        <Link
          to="/kuis"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Kuis
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Result View (Once submitted)
  if (result) {
    const isPassing = result.score >= 60;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Celebration Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-2xl text-center space-y-6">
          
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg bg-gradient-to-tr from-brand-500 to-emerald-400 text-white">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Hasil Kuis: {result.quiz_title}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              {isPassing ? 'Selamat! Anda Luar Biasa! 🎉' : 'Kerja Bagus! Terus Belajar! 💪'}
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {isPassing
                ? 'Anda telah menunjukkan pemahaman yang sangat baik dalam mengelola sampah secara bijak.'
                : 'Cek penjelasan di bawah untuk memperdalam wawasan pemilahan sampah Anda.'}
            </p>
          </div>

          {/* Score & Points Highlight */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-xs text-slate-400 font-semibold">Skor Anda</div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                {result.score}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {result.correct_answers} dari {result.total_questions} Benar
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <div className="text-xs text-emerald-700 font-semibold">Eco-Points Diraih</div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-1 flex items-center justify-center gap-1">
                +{result.points_earned}
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">
                {isAuthenticated ? 'Tercatat di Profil Anda' : 'Login untuk simpan poin!'}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Ulangi Kuis
            </button>

            <Link
              to="/leaderboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-md"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Lihat Papan Skor
            </Link>

            <Link
              to="/kuis"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-md shadow-brand-600/30"
            >
              Kuis Lainnya
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg">
            Review Pembahasan Jawaban
          </h3>

          <div className="space-y-4">
            {result.feedback.map((item, index) => (
              <div
                key={index}
                className={`p-5 rounded-2xl border transition-all ${
                  item.is_correct
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {item.is_correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={item.is_correct ? 'text-emerald-800' : 'text-rose-800'}>
                        Pertanyaan #{index + 1}
                      </span>
                      <span className={item.is_correct ? 'text-emerald-700' : 'text-rose-700'}>
                        {item.is_correct ? 'Jawaban Benar' : 'Jawaban Kurang Tepat'}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      {item.question_text}
                    </p>

                    <div className="text-xs space-y-1">
                      <div>
                        Jawaban Anda:{' '}
                        <span className={`font-semibold ${item.is_correct ? 'text-emerald-700' : 'text-rose-600 line-through'}`}>
                          {item.user_answer || '(Tidak dijawab)'}
                        </span>
                      </div>
                      {!item.is_correct && (
                        <div>
                          Kunci Jawaban:{' '}
                          <span className="font-bold text-emerald-700">
                            {item.correct_answer}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    {item.explanation && (
                      <div className="pt-2 text-xs text-slate-600 bg-white/80 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                        <strong className="text-slate-800">💡 Fakta & Penjelasan:</strong>{' '}
                        {item.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // Active Quiz Gameplay View
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/kuis"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Keluar Kuis
        </Link>

        <span className="text-xs font-bold px-3 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-full flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          Hadiah: +{quiz.reward_points} Eco-Points
        </span>
      </div>

      {/* Progress & Stepper */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Pertanyaan {currentIndex + 1} dari {questions.length}</span>
          <span>{progressPercent}% Selesai</span>
        </div>
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
          {currentQuestion.question_text}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = answers[currentQuestion.id] === option;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(currentQuestion.id, option)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 text-sm font-semibold ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/80 text-brand-900 shadow-sm ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {letter}
                </span>
                <span className="flex-1 leading-relaxed">{option}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Stepper Navigation */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Sebelumnya
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 font-bold text-xs text-white shadow-md shadow-brand-600/30 transition-all active:scale-95"
          >
            Selanjutnya
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 font-extrabold text-xs text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <span>Mengirim Jawaban...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Kirim & Lihat Skor
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
