import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  HelpCircle,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmQuiz, setDeleteConfirmQuiz] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [expandedQuizId, setExpandedQuizId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    difficulty: 'Mudah',
    duration_minutes: 5,
    reward_points: 100,
    icon: 'Recycle',
    badge_name: 'Pakar Pemilah',
    questions: [
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: ''
      }
    ]
  });

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getQuizzes();
      if (res.data.success) {
        setQuizzes(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const openCreateModal = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      difficulty: 'Mudah',
      duration_minutes: 5,
      reward_points: 100,
      icon: 'Recycle',
      badge_name: 'Pakar Pemilah',
      questions: [
        {
          question_text: '',
          options: ['', '', '', ''],
          correct_answer: '',
          explanation: ''
        }
      ]
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: '',
          options: ['', '', '', ''],
          correct_answer: '',
          explanation: ''
        }
      ]
    }));
  };

  const handleRemoveQuestion = (qIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIndex)
    }));
  };

  const handleQuestionTextChange = (qIndex, text) => {
    const updated = [...formData.questions];
    updated[qIndex].question_text = text;
    setFormData({ ...formData, questions: updated });
  };

  const handleOptionChange = (qIndex, optIndex, val) => {
    const updated = [...formData.questions];
    updated[qIndex].options[optIndex] = val;
    setFormData({ ...formData, questions: updated });
  };

  const handleCorrectAnswerSelect = (qIndex, val) => {
    const updated = [...formData.questions];
    updated[qIndex].correct_answer = val;
    setFormData({ ...formData, questions: updated });
  };

  const handleExplanationChange = (qIndex, exp) => {
    const updated = [...formData.questions];
    updated[qIndex].explanation = exp;
    setFormData({ ...formData, questions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Judul kuis wajib diisi!');
      return;
    }

    // Validasi soal
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question_text.trim()) {
        setFormError(`Pertanyaan soal ke-${i + 1} tidak boleh kosong!`);
        return;
      }
      if (!q.correct_answer) {
        setFormError(`Tentukan kunci jawaban yang benar untuk soal ke-${i + 1}!`);
        return;
      }
    }

    try {
      setFormSubmitting(true);
      setFormError('');

      await adminAPI.createQuiz(formData);
      setIsModalOpen(false);
      fetchQuizzes();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan paket kuis.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmQuiz) return;
    try {
      await adminAPI.deleteQuiz(deleteConfirmQuiz.id);
      setDeleteConfirmQuiz(null);
      fetchQuizzes();
    } catch (err) {
      alert('Gagal menghapus paket kuis.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Manajemen Kuis & Bank Soal</h2>
          <p className="text-xs text-slate-500">Kelola paket kuis edukasi pemilahan sampah, reward poin, dan pertanyaan interaktif</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Buat Kuis Baru
        </button>
      </div>

      {/* Quizzes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Memuat paket kuis...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <HelpCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">Belum ada paket kuis terdaftar</p>
          </div>
        ) : (
          quizzes.map((quiz) => {
            const isExpanded = expandedQuizId === quiz.id;
            return (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{quiz.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          quiz.difficulty === 'Sulit' ? 'bg-rose-50 text-rose-700' :
                          quiz.difficulty === 'Sedang' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {quiz.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-xl">{quiz.description}</p>
                      <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {quiz.duration_minutes} Menit
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 font-semibold">
                          <Award className="w-3.5 h-3.5" /> +{quiz.reward_points} Eco-Points
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Layers className="w-3.5 h-3.5" /> {(quiz.questions || []).length} Soal
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setExpandedQuizId(isExpanded ? null : quiz.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {isExpanded ? 'Tutup Soal' : 'Lihat Bank Soal'}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmQuiz(quiz)}
                      title="Hapus Kuis"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Questions Bank */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      Daftar Pertanyaan ({quiz.questions?.length || 0})
                    </h4>
                    {(!quiz.questions || quiz.questions.length === 0) ? (
                      <p className="text-xs text-slate-400 py-3">Belum ada pertanyaan pada kuis ini.</p>
                    ) : (
                      <div className="space-y-3">
                        {quiz.questions.map((quest, idx) => (
                          <div
                            key={quest.id || idx}
                            className="p-3.5 bg-white rounded-xl border border-slate-200/80 text-xs space-y-2 shadow-2xs"
                          >
                            <p className="font-semibold text-slate-800">
                              <span className="text-brand-600 mr-1.5">#{idx + 1}</span>
                              {quest.question_text}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {(quest.options || []).map((opt, optIdx) => {
                                const isCorrect = opt === quest.correct_answer;
                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-2 rounded-lg border flex items-center justify-between ${
                                      isCorrect
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                  </div>
                                );
                              })}
                            </div>
                            {quest.explanation && (
                              <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                                💡 <strong>Penjelasan:</strong> {quest.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Buat Kuis Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[92vh] flex flex-col my-6">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Buat Paket Kuis & Bank Soal Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Judul Kuis *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kuis Cerdas Pilah Plastik"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Kesulitan</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Kuis</label>
                <textarea
                  rows={2}
                  placeholder="Uji pengetahuan pemilahan sampah Anda..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reward Eco-Points</label>
                  <input
                    type="number"
                    min="10"
                    value={formData.reward_points}
                    onChange={(e) => setFormData({ ...formData, reward_points: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Badge Lencana</label>
                  <input
                    type="text"
                    value={formData.badge_name}
                    onChange={(e) => setFormData({ ...formData, badge_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Questions Builder */}
              <div className="border-t border-slate-200 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">Daftar Pertanyaan ({formData.questions.length})</h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    + Tambah Soal
                  </button>
                </div>

                {formData.questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Soal #{qIdx + 1}</span>
                      {formData.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="Tuliskan pertanyaan kuis di sini..."
                      value={q.question_text}
                      onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                    />

                    <p className="text-[11px] text-slate-500 font-semibold">
                      Opsi Pilihan Ganda (Klik radio button untuk memilih kunci jawaban yang benar):
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                          <input
                            type="radio"
                            name={`correct_${qIdx}`}
                            checked={q.correct_answer === opt && opt.length > 0}
                            onChange={() => handleCorrectAnswerSelect(qIdx, opt)}
                            className="text-brand-600 focus:ring-brand-500"
                          />
                          <input
                            type="text"
                            required
                            placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            className="w-full text-xs focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Penjelasan edukasi saat jawaban ditampilkan (opsional)..."
                      value={q.explanation}
                      onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600"
                    />
                  </div>
                ))}
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
                  {formSubmitting ? 'Menyimpan...' : 'Simpan Kuis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base mb-1">Hapus Paket Kuis?</h4>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus kuis <strong>"{deleteConfirmQuiz.title}"</strong> beserta seluruh soal di dalamnya?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmQuiz(null)}
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
