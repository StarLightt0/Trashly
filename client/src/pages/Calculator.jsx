import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator as CalcIcon, 
  Sparkles, 
  Leaf, 
  TreePine, 
  Bike, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight,
  TrendingDown,
  Info,
  Award,
  Lock,
  Clock,
  Ticket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

export default function Calculator() {
  const { user, isAuthenticated, updateUserPoints, refreshUser } = useAuth();

  // Weekly consumption inputs
  const [inputs, setInputs] = useState({
    bottles: 5,     // 20g each
    bags: 7,        // 8g each
    cups: 3,        // 15g each
    styrofoam: 2,   // 5g each
    cardboards: 2,  // 150g each
    straws: 6       // 2g each
  });

  const [claimedReward, setClaimedReward] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimCode, setClaimCode] = useState('TRASHLY-WEEKLY');
  const [claimMessage, setClaimMessage] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimStatus, setClaimStatus] = useState({
    canClaim: true,
    daysRemaining: 0,
    hoursRemaining: 0,
    nextClaimDate: null,
    activeCode: 'TRASHLY-WEEKLY'
  });

  React.useEffect(() => {
    async function checkStatus() {
      if (isAuthenticated) {
        try {
          const res = await userAPI.getCalculatorStatus();
          if (res.data.success) {
            setClaimStatus(res.data);
            if (res.data.activeCode) {
              setClaimCode(res.data.activeCode);
            }
            if (!res.data.canClaim) {
              setClaimedReward(true);
              setClaimMessage(`Bonus mingguan sudah diklaim. Dapat diklaim kembali dalam ${res.data.daysRemaining} hari lagi.`);
            }
          }
        } catch (err) {
          // Ignore
        }
      }
    }
    checkStatus();
  }, [isAuthenticated]);

  const handleChange = (key, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setInputs(prev => ({ ...prev, [key]: num }));
  };

  const handleReset = () => {
    setInputs({
      bottles: 0,
      bags: 0,
      cups: 0,
      styrofoam: 0,
      cardboards: 0,
      straws: 0
    });
  };

  // Calculations
  const weeklyKg = (
    inputs.bottles * 0.02 +
    inputs.bags * 0.008 +
    inputs.cups * 0.015 +
    inputs.styrofoam * 0.005 +
    inputs.cardboards * 0.15 +
    inputs.straws * 0.002
  );

  const annualKg = (weeklyKg * 52).toFixed(1);
  const annualCO2 = (annualKg * 2.8).toFixed(1); // 2.8 kg CO2e per kg packaging life-cycle
  const treesNeeded = Math.ceil(annualCO2 / 21); // 1 mature tree absorbs ~21 kg CO2/year
  const motorKm = Math.round(annualCO2 / 0.11); // Average motorcycle emits ~110g CO2/km

  // Determine top waste contributor
  const contributors = [
    { name: 'Botol Plastik', weight: inputs.bottles * 0.02, tip: 'Gunakan tumbler isi ulang di rumah atau kantor untuk memangkas ratusan botol sekali pakai.' },
    { name: 'Kantong Kresek', weight: inputs.bags * 0.008, tip: 'Bawa tas belanja kain (tote bag) lipat di tas atau bagasi motor Anda.' },
    { name: 'Cup Minuman', weight: inputs.cups * 0.015, tip: 'Banyak kedai kopi kini memberikan diskon Rp 2.000 - Rp 5.000 jika membawa cangkir/tumbler sendiri!' },
    { name: 'Styrofoam', weight: inputs.styrofoam * 0.005, tip: 'Bawa wadah bekal sendiri saat jajan untuk menghindari styrofoam yang hampir tidak bisa terurai.' },
    { name: 'Kardus Paket', weight: inputs.cardboards * 0.15, tip: 'Kumpulkan kardus dalam kondisi bersih dan kering, lalu setorkan ke Bank Sampah terdekat.' },
    { name: 'Sedotan Plastik', weight: inputs.straws * 0.002, bias: 'Tolak sedotan plastik saat memesan minuman dan beralihlah ke sedotan stainless atau bambu.' }
  ].sort((a, b) => b.weight - a.weight);

  const primaryWaste = contributors[0];

  const handleClaimReward = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAuthenticated) return;
    setClaiming(true);
    setClaimError('');
    try {
      const res = await userAPI.claimCalculatorReward({ code: claimCode });
      if (res.data.success) {
        setClaimedReward(true);
        setClaimStatus({
          canClaim: false,
          daysRemaining: res.data.daysRemaining || 7,
          hoursRemaining: res.data.hoursRemaining || 168,
          nextClaimDate: res.data.nextClaimDate
        });
        setClaimMessage(res.data.message || '+30 Eco-Points berhasil diklaim!');
        if (typeof res.data.newTotalPoints === 'number') {
          updateUserPoints(res.data.newTotalPoints);
        }
        await refreshUser();
      }
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Gagal mengklaim kode bonus.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-brand-700 to-emerald-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Fitur Interaktif Lingkungan
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Kalkulator Jejak Sampah Pribadi
          </h1>
          <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
            Hitung perkiraan timbulan sampah kemasan sekali pakai yang Anda hasilkan per minggu. 
            Ketahui jejak emisi karbonnya dan temukan langkah kecil untuk menyelamatkan bumi!
          </p>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Sliders & Counters (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">Konsumsi Mingguan Anda</h2>
              <p className="text-xs text-slate-400">Geser atau ketik jumlah barang yang Anda pakai dalam 1 minggu</p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="space-y-5">
            
            {/* 1. Botol Plastik */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  🧴 Botol Plastik Minuman (Air / Soda)
                </span>
                <span className="text-brand-700 font-black bg-brand-50 px-2.5 py-0.5 rounded-lg">
                  {inputs.bottles} botol / mgg
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={inputs.bottles}
                onChange={(e) => handleChange('bottles', e.target.value)}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

            {/* 2. Kantong Kresek */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  🛍️ Kantong Kresek Belanja
                </span>
                <span className="text-brand-700 font-black bg-brand-50 px-2.5 py-0.5 rounded-lg">
                  {inputs.bags} lembar / mgg
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={inputs.bags}
                onChange={(e) => handleChange('bags', e.target.value)}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

            {/* 3. Cup Kopi/Boba */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  🥤 Cup Kopi / Minuman Takeaway
                </span>
                <span className="text-brand-700 font-black bg-brand-50 px-2.5 py-0.5 rounded-lg">
                  {inputs.cups} cup / mgg
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={inputs.cups}
                onChange={(e) => handleChange('cups', e.target.value)}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

            {/* 4. Wadah Styrofoam */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  🥡 Kotak Makanan Styrofoam
                </span>
                <span className="text-brand-700 font-black bg-brand-50 px-2.5 py-0.5 rounded-lg">
                  {inputs.styrofoam} kotak / mgg
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={inputs.styrofoam}
                onChange={(e) => handleChange('styrofoam', e.target.value)}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

            {/* 5. Kardus Belanja Online */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  📦 Kardus & Paket Belanja Online
                </span>
                <span className="text-brand-700 font-black bg-brand-50 px-2.5 py-0.5 rounded-lg">
                  {inputs.cardboards} paket / mgg
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={inputs.cardboards}
                onChange={(e) => handleChange('cardboards', e.target.value)}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

            {/* 6. Sedotan & Sendok Plastik */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  🥢 Sedotan & Alat Makan Plastik
                </span>
                <span className="text-brand-700 font-black bg-brand-50 px-2.5 py-0.5 rounded-lg">
                  {inputs.straws} pcs / mgg
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={inputs.straws}
                onChange={(e) => handleChange('straws', e.target.value)}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

          </div>

        </div>

        {/* Right Column: Calculations & Impact (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Impact Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Proyeksi Jejak Tahunan
              </span>
              <span className="px-2.5 py-0.5 bg-brand-100 text-brand-800 rounded-full text-xs font-black">
                Per 1 Orang
              </span>
            </div>

            {/* Two Big Hero Numbers */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-400">Total Sampah / Tahun</div>
                <div className="text-3xl font-black text-slate-900 mt-1">
                  {annualKg} <span className="text-sm font-semibold text-slate-500">kg</span>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <div className="text-[11px] font-semibold text-emerald-800">Emisi Karbon (CO2e)</div>
                <div className="text-3xl font-black text-emerald-700 mt-1">
                  {annualCO2} <span className="text-sm font-semibold text-emerald-600">kg</span>
                </div>
              </div>
            </div>

            {/* Equivalencies */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Dampak Lingkungan Setara Dengan:
              </h4>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <TreePine className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900">{treesNeeded} Pohon Dewasa</div>
                  <div className="text-[11px] text-slate-500">Dibutuhkan selama 1 tahun penuh untuk menyerap emisi sampah Anda.</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900">±{motorKm} km Perjalanan Motor</div>
                  <div className="text-[11px] text-slate-500">Setara dengan emisi gas buang motor bensin.</div>
                </div>
              </div>
            </div>

            {/* Eco Action Recommendation */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Penyumbang Terbesar: {primaryWaste.name}
              </div>
              <p className="text-amber-800 leading-relaxed font-medium">
                💡 <strong>Solusi Anda:</strong> {primaryWaste.tip}
              </p>
            </div>

            {/* Klaim Kode Bonus (Batas Klaim: Seminggu Sekali) */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-brand-600" />
                  Klaim Kode Bonus Jejak
                </span>
                <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                  Batas 1 Minggu Sekali
                </span>
              </div>

              {/* Status Message or Error Alert */}
              {claimMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{claimMessage}</span>
                </div>
              )}

              {claimError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{claimError}</span>
                </div>
              )}

              {claimedReward || !claimStatus.canClaim ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs space-y-2">
                  <div className="flex items-center justify-center gap-2 font-black text-slate-800">
                    <Lock className="w-4 h-4 text-amber-600" />
                    Kode Bonus Telah Diklaim Minggu Ini
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Sesuai ketentuan, batas klaim kode bonus kalkulator adalah <strong>1 minggu sekali (7 hari)</strong>.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-[11px] font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Tersedia kembali dalam: <strong>{claimStatus.daysRemaining || 7} hari ({claimStatus.hoursRemaining || 168} jam)</strong>
                  </div>
                </div>
              ) : isAuthenticated ? (
                <form onSubmit={handleClaimReward} className="space-y-2.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={claimCode}
                      onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                      placeholder="Masukkan Kode Klaim"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={claiming || !claimCode.trim()}
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl shadow-md text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      {claiming ? 'Mengklaim...' : 'Klaim (+30 Pts)'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>Kode mingguan aktif: <strong className="text-brand-700 font-mono">TRASHLY-WEEKLY</strong></span>
                    <button
                      type="button"
                      onClick={() => setClaimCode('TRASHLY-WEEKLY')}
                      className="text-brand-600 font-bold hover:underline"
                    >
                      Gunakan Kode
                    </button>
                  </div>
                </form>
              ) : (
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition-all text-center"
                >
                  Masuk Akun untuk Klaim Kode +30 Poin →
                </Link>
              )}
            </div>

          </div>

          {/* Quick Encyclopedia Link Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-3">
            <h4 className="font-extrabold text-sm flex items-center gap-2">
              <Leaf className="w-4 h-4 text-brand-400" />
              Ingin Tahu Cara Daur Ulang Setiap Bahan?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pelajari panduan rinci pemilahan botol plastik, styrofoam, dan kardus di Ensiklopedia Sampah Trashly.
            </p>
            <Link
              to="/ensiklopedia"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 underline pt-1"
            >
              Buka Katalog Ensiklopedia <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
