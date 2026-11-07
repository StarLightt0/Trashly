import React, { useState, useEffect } from 'react';
import { chatAPI, adminAPI, wasteAPI } from '../../services/api';
import {
  MessageSquare,
  Sparkles,
  Send,
  Database,
  Bot,
  User,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';

export default function AdminChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Halo Admin! Ini adalah sandbox pengujian Asisten AI Trashly. Anda dapat menguji respons sistem dan melihat bagaimana data ensiklopedia diinjeksikan secara real-time.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [system, setSystem] = useState(null);
  const [wasteSample, setWasteSample] = useState([]);

  useEffect(() => {
    async function loadInfo() {
      try {
        const [sysRes, wasteRes] = await Promise.all([
          adminAPI.getSystemStatus(),
          wasteAPI.getWasteItems()
        ]);
        if (sysRes.data.success) setSystem(sysRes.data.data);
        if (wasteRes.data.success) setWasteSample(wasteRes.data.data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching chat info:', err);
      }
    }
    loadInfo();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    // Kirim riwayat percakapan sebelumnya (tidak menduplikasi pesan saat ini)
    const history = messages
      .filter(m => m.text)
      .slice(-10)
      .map(m => ({ role: m.role, text: m.text }));

    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await chatAPI.send(userText, history);
      const botReply = res.data?.reply || res.data?.data?.reply;

      if (res.data?.success && botReply) {
        setMessages([...newMessages, { role: 'assistant', text: botReply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', text: res.data?.message || 'Layanan AI sedang tidak tersedia.' }]);
      }
    } catch (err) {
      console.error('Error pengiriman chat di Admin:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Gagal menghubungi server Gemini AI.';
      setMessages([...newMessages, {
        role: 'assistant',
        text: errorMsg
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Monitoring & Pengujian Chatbot AI</h2>
        <p className="text-xs text-slate-500">Uji coba respons AI interaktif berbasis Gemini 2.5 Flash dengan sistem referensi ensiklopedia RAG Trashly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chatbot Sandbox */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[580px] overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-xs">Sandbox Percakapan AI</h3>
                <p className="text-[10px] text-slate-400">Model: {system?.geminiModel || 'gemini-2.5-flash'}</p>
              </div>
            </div>
            <button
              onClick={() => setMessages([{ role: 'assistant', text: 'Percakapan telah direset. Silakan tanyakan hal baru seputar pemilahan sampah!' }])}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-md leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></div>
                <span>Gemini sedang berpikir dan mencari referensi ensiklopedia...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
            <input
              type="text"
              placeholder="Tanyakan topik sampah, misal: 'Cara mengolah minyak jelantah?'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl transition flex items-center justify-center shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* System & RAG Diagnostic */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Database className="w-4 h-4 text-brand-600" /> Status Layanan AI
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Model REST:</span>
                <span className="font-mono text-[11px] font-bold text-purple-700">{system?.geminiModel || 'gemini-2.5-flash'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Status API Key:</span>
                <span className={`font-semibold ${system?.hasGeminiKey ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {system?.hasGeminiKey ? 'Aktif' : 'Tidak Terisi'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Rate Limit:</span>
                <span className="font-mono text-slate-600">20 req/menit</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <BookOpen className="w-4 h-4 text-brand-600" /> Sampel RAG Knowledge Base
            </h4>
            <p className="text-[11px] text-slate-400">
              Data ensiklopedia berikut secara otomatis dicari dan disisipkan ke context AI saat pengguna bertanya:
            </p>
            <div className="space-y-1.5">
              {wasteSample.map((item) => (
                <div key={item.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                  <p className="font-bold text-slate-800">{item.name}</p>
                  <p className="text-slate-500 truncate">{item.summary || item.decomposition_time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
