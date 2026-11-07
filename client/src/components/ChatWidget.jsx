import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  RotateCcw, 
  Sparkles, 
  Bot, 
  AlertCircle,
  HelpCircle,
  Minimize2
} from 'lucide-react';
import { chatAPI } from '../services/api';

const DEFAULT_GREETING = {
  id: 'greeting',
  role: 'assistant',
  text: 'Halo! Saya Asisten Trashly 🌱. Tanyakan apa pun seputar pemilahan sampah, cara mendaur ulang, pembuatan kompos, atau penanganan limbah B3!'
};

const SUGGESTION_CHIPS = [
  'Baterai bekas dibuang ke mana?',
  'Cara membuat kompos dari sisa makanan?',
  'Berapa harga botol plastik di bank sampah?'
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([DEFAULT_GREETING]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Send message handler
  const handleSendMessage = async (textToSend = inputMessage) => {
    const trimmed = (textToSend || '').trim();
    if (!trimmed || isLoading) return;

    if (trimmed.length > 500) {
      setErrorMessage('Pertanyaan maksimal 500 karakter.');
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed
    };

    // Siapkan history untuk backend (format [{ role, text }])
    const currentHistory = messages
      .filter(m => m.id !== 'greeting')
      .map(m => ({ role: m.role, text: m.text }));

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await chatAPI.send(trimmed, currentHistory);
      if (res.data?.success && res.data.reply) {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: res.data.reply
          }
        ]);
      } else {
        throw new Error(res.data?.message || 'Gagal menerima tanggapan.');
      }
    } catch (err) {
      console.warn('Chat error:', err);
      const backendMsg = err.response?.data?.message || 'Layanan Chatbot AI sedang tidak tersedia atau kuota habis. Silakan coba lagi nanti.';
      setErrorMessage(backendMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset conversation
  const handleResetChat = () => {
    setMessages([DEFAULT_GREETING]);
    setInputMessage('');
    setErrorMessage(null);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      
      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 h-[520px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden mb-3 animate-fade-in">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 p-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                <Bot className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="flex flex-col">
                <div className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                  <span>Asisten Trashly</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                </div>
                <span className="text-[10px] text-emerald-100 font-medium">
                  Pakar Edukasi Pemilahan Sampah
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset Percakapan"
                className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Tutup Chat"
                className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Suggestion Chips */}
          <div className="bg-slate-50 border-b border-slate-100 p-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 pl-1">
              Saran:
            </span>
            {SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-[11px] text-slate-600 hover:text-brand-700 transition-all font-medium cursor-pointer shadow-2xs whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-xs font-medium'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/80 shadow-xs whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl rounded-bl-none border border-slate-200 max-w-[70%] shadow-2xs">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span className="text-[10px] text-slate-400 italic">Asisten sedang mengetik...</span>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-[11px]">Terjadi Kendala</div>
                  <div className="text-[11px] leading-relaxed text-rose-700">{errorMessage}</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tanya pemilahan sampah (maks. 500 huruf)..."
              disabled={isLoading}
              maxLength={500}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-slate-50 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Buka Chatbot AI Trashly"
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white rounded-full shadow-lg shadow-brand-600/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-400/30"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 ring-2 ring-brand-700 animate-pulse"></span>
        </div>
        <span className="font-bold text-xs tracking-tight">Tanya AI</span>
      </button>

    </div>
  );
}
