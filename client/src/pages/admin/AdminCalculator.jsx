import React, { useState } from 'react';
import {
  Calculator as CalcIcon,
  Sparkles,
  TreePine,
  RotateCcw,
  CheckCircle2,
  Ticket,
  Clock,
  Coins,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const EMISSION_FACTORS = [
  { name: 'Botol Plastik PET', weight: '20g / item', co2e: '0.0825 kg CO2e', impact: 'Tinggi', category: 'Anorganik' },
  { name: 'Kantong Kresek (LDPE)', weight: '8g / item', co2e: '0.0330 kg CO2e', impact: 'Sedang', category: 'Anorganik' },
  { name: 'Gelas Plastik / Cup', weight: '15g / item', co2e: '0.0620 kg CO2e', impact: 'Sedang', category: 'Anorganik' },
  { name: 'Wadah Styrofoam', weight: '5g / item', co2e: '0.0210 kg CO2e', impact: 'Sangat Tinggi', category: 'Residu' },
  { name: 'Kardus & Kertas Box', weight: '150g / item', co2e: '0.1400 kg CO2e', impact: 'Sedang', category: 'Daur Ulang' },
  { name: 'Sedotan Plastik', weight: '2g / item', co2e: '0.0083 kg CO2e', impact: 'Tinggi', category: 'Residu' }
];

export default function AdminCalculator() {
  const [activeCode, setActiveCode] = useState('TRASHLY-WEEKLY');
  const [rewardAmount, setRewardAmount] = useState(30);
  const [cooldownDays, setCooldownDays] = useState(7);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Parameter Kalkulator Jejak Sampah</h2>
        <p className="text-xs text-slate-500">Kelola faktor emisi karbon, formula konversi satuan sampah, dan kode bonus klaim mingguan</p>
      </div>

      {/* Grid: Emission Factors & Reward Setting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Factors */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <CalcIcon className="w-4 h-4 text-brand-600" /> Koefisien Emisi CO2 per Satuan Sampah
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Standar IPCC 2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Jenis Sampah</th>
                  <th className="py-2.5 px-3">Bobot Rata-rata</th>
                  <th className="py-2.5 px-3">Faktor Emisi (CO2e)</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Kategori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {EMISSION_FACTORS.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{item.weight}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">{item.co2e}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Formula konversi emisi otomatis digunakan oleh halaman Kalkulator Jejak Karbon pengguna untuk mengestimasi dampak pohon terselamatkan dan reduksi polusi.
          </p>
        </div>

        {/* Weekly Bonus Code Settings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Ticket className="w-4 h-4 text-amber-500" /> Kode Reward Mingguan
            </h3>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Pengaturan kode bonus kalkulator berhasil diperbarui!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Voucher Aktif</label>
              <input
                type="text"
                value={activeCode}
                onChange={(e) => setActiveCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 uppercase focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reward Eco-Points</label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
                <span className="absolute right-3 top-2 text-slate-400 font-semibold text-[11px]">Poin</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batas Waktu Cooldown (Hari)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={cooldownDays}
                  onChange={(e) => setCooldownDays(parseInt(e.target.value) || 7)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
                <span className="absolute right-3 top-2 text-slate-400 font-semibold text-[11px]">Hari</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition shadow-sm"
            >
              Simpan Pengaturan Voucher
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
