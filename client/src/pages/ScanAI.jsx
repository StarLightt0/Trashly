import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Recycle, 
  Coins, 
  ArrowRight, 
  RefreshCw, 
  MapPin, 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  Lightbulb, 
  SlidersHorizontal,
  History,
  Info,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { scanAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ScanAI() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('camera'); // 'camera', 'upload', 'sample'
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  
  // Camera state
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'

  // Image & Scanning state
  const [selectedImage, setSelectedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [rewardNotice, setRewardNotice] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  // File drop ref
  const fileInputRef = useRef(null);

  // 1. Load Presets & Scan History
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await scanAPI.getSamples();
        if (res.data?.success) {
          setSamples(res.data.data);
        }
      } catch (err) {
        console.warn('Gagal memuat sampel preset:', err.message);
      }

      if (isAuthenticated) {
        try {
          const histRes = await scanAPI.getHistory();
          if (histRes.data?.success) {
            setScanHistory(histRes.data.data);
          }
        } catch (e) {
          // ignore
        }
      }
    }
    loadInitial();
  }, [isAuthenticated]);

  // 2. Camera Management
  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser Anda tidak mendukung akses kamera langsung.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera error:', err);
      setCameraError(
        err.name === 'NotAllowedError' 
          ? 'Izin akses kamera ditolak. Silakan berikan izin kamera pada browser Anda.' 
          : 'Kamera tidak dapat diakses atau sedang digunakan oleh aplikasi lain.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === 'camera' && !selectedImage && !result) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, selectedImage, result]);

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // 3. Take Snapshot from Camera
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    stopCamera();
    setSelectedImage(dataUrl);
    setSelectedSample(null);
    triggerAiScan(dataUrl);
  };

  // 4. File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, atau WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar. Maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setSelectedImage(dataUrl);
      setSelectedSample(null);
      stopCamera();
      triggerAiScan(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // 5. Select Preset Sample
  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setSelectedImage(sample.thumbnail);
    stopCamera();
    triggerAiScan(sample.thumbnail, sample.hint, sample.id);
  };

  // 6. Trigger AI Scan Processing
  const triggerAiScan = async (imgData, hint = '', sampleId = null) => {
    setIsScanning(true);
    setResult(null);
    setErrorMessage(null);
    setRewardNotice(null);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep(prev => (prev < 2 ? prev + 1 : prev));
    }, 600);

    try {
      const res = await scanAPI.detectWaste({
        image: imgData,
        hint: hint || (selectedSample ? selectedSample.hint : ''),
        sampleId: sampleId || (selectedSample ? selectedSample.id : null)
      });

      clearInterval(stepInterval);

      if (res.data?.success) {
        const detection = res.data.detection;
        setResult(detection);

        if (res.data.points_awarded > 0) {
          setRewardNotice({
            points: res.data.points_awarded,
            newTotal: res.data.new_total_points
          });
        }

        // Simpan ke riwayat lokal
        setScanHistory(prev => [
          {
            id: Date.now(),
            waste_name: detection.name,
            category_name: detection.category,
            confidence: detection.confidence ? Math.round(detection.confidence) : null,
            created_at: new Date()
          },
          ...prev.slice(0, 9)
        ]);
      }
    } catch (err) {
      clearInterval(stepInterval);
      const backendMsg = err.response?.data?.message || 'Layanan AI sedang tidak tersedia. Coba pilih sampel atau coba lagi nanti.';
      setErrorMessage(backendMsg);
    } finally {
      setIsScanning(false);
    }
  };

  // 7. Reset Scan
  const handleResetScan = () => {
    setResult(null);
    setErrorMessage(null);
    setSelectedImage(null);
    setSelectedSample(null);
    setRewardNotice(null);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-400/20 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-400/30 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-300 animate-spin-slow" />
            Trashly Vision AI
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Scan & Deteksi Sampah Pintar
          </h1>

          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Arahkan kamera ke sampah atau unggah foto kemasan. AI Trashly akan mengenali jenis material, menentukan wadah tempat sampah yang sesuai standar nasional (KLHK), serta memberikan panduan daur ulang dan estimasi nilai di Bank Sampah.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Deteksi Cepat &lt; 2 Detik
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 font-semibold">
              <Coins className="w-3.5 h-3.5 text-amber-300" />
              Bonus +15 Poin tiap Scan
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Standar Resmi KLHK
            </span>
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Scanner Viewport & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Mode Selector Tabs */}
          {!result && (
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setActiveTab('camera'); setSelectedImage(null); setErrorMessage(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Kamera Langsung</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('upload'); stopCamera(); setErrorMessage(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Unggah Foto</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('sample'); stopCamera(); setErrorMessage(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'sample'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Sampel Cepat (1-Klik)</span>
              </button>
            </div>
          )}

          {/* Scanner Viewport Frame */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-md relative overflow-hidden">
            
            {/* Viewport Box */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-slate-800">
              
              {/* Mode 1: Live Video Feed */}
              {activeTab === 'camera' && !selectedImage && (
                <div className="relative w-full h-full flex items-center justify-center">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-6 text-center space-y-3 max-w-sm">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                        <Camera className="w-6 h-6 animate-pulse" />
                      </div>
                      <p className="text-xs text-slate-300">
                        {cameraError || 'Mempersiapkan kamera video stream...'}
                      </p>
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Coba Akses Kamera Lagi
                      </button>
                    </div>
                  )}

                  {/* Reticle Overlay */}
                  {cameraActive && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-8 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg"></div>
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 border border-emerald-400/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          KAMERA AKTIF
                        </span>
                        <div className="w-8 h-8 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg"></div>
                      </div>

                      <div className="text-center">
                        <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-medium border border-white/10">
                          Tempatkan sampah di dalam bidikan kamera
                        </span>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="w-8 h-8 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg"></div>
                        <div className="w-8 h-8 border-b-3 border-r-3 border-emerald-400 rounded-br-lg"></div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Mode 2: Upload Mode Viewport */}
              {activeTab === 'upload' && !selectedImage && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 cursor-pointer hover:bg-slate-900 transition-colors group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-3xl bg-slate-800 text-emerald-400 flex items-center justify-center border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">
                      Klik untuk Unggah Foto Sampah
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Mendukung format JPG, PNG, atau WebP (Maksimal ukuran file 5 MB)
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-500 transition-all">
                    Pilih File Gambar
                  </span>
                </div>
              )}

              {/* Mode 3: Preset Samples Grid */}
              {activeTab === 'sample' && !selectedImage && (
                <div className="w-full h-full p-4 overflow-y-auto bg-slate-900">
                  <div className="text-center pb-3">
                    <h4 className="text-xs font-bold text-slate-300">
                      Pilih Contoh Sampah untuk Uji Deteksi Cepat:
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {samples.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectSample(s)}
                        className="group bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 rounded-2xl p-2.5 text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer"
                      >
                        <div className="w-full h-20 rounded-xl overflow-hidden bg-slate-950">
                          <img
                            src={s.thumbnail}
                            alt={s.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-white leading-tight line-clamp-1">
                            {s.name}
                          </div>
                          <div className="text-[10px] text-emerald-400 uppercase font-semibold mt-0.5">
                            {s.category}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Captured / Uploaded Image View with Scanning Laser */}
              {selectedImage && (
                <div className="relative w-full h-full">
                  <img
                    src={selectedImage}
                    alt="Captured Waste"
                    className="w-full h-full object-cover"
                  />

                  {/* Animated Laser Scanning Bar */}
                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-scan-laser"></div>
                      <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px]"></div>
                    </div>
                  )}

                  {/* Scanning Status Badge */}
                  {isScanning && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-emerald-500/40 text-white text-xs font-bold shadow-xl flex items-center gap-2 whitespace-nowrap">
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      <span>
                        {scanStep === 0 && 'Mengirim gambar ke AI Engine...'}
                        {scanStep === 1 && 'Menganalisis komposisi & polimer material...'}
                        {scanStep === 2 && 'Menentukan wadah tempat sampah & daur ulang...'}
                      </span>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Bottom Controls Bar */}
            <div className="pt-4 flex items-center justify-between gap-3">
              {activeTab === 'camera' && !selectedImage && (
                <>
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    disabled={!cameraActive}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                    title="Ganti Kamera Depan / Belakang"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={captureSnapshot}
                    disabled={!cameraActive || isScanning}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer"
                  >
                    <div className="w-3 h-3 rounded-full bg-white animate-ping"></div>
                    <Camera className="w-5 h-5" />
                    <span>Ambil Foto & Scan AI</span>
                  </button>
                </>
              )}

              {selectedImage && !isScanning && (
                <div className="w-full flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetScan}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Foto Ulang</span>
                  </button>

                  {!result && (
                    <button
                      type="button"
                      onClick={() => triggerAiScan(selectedImage)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>Analisis Sekarang</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Quick Tips Box */}
          <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Tips Pengambilan Foto yang Akurat:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
              <li>Pastikan objek sampah berada di tengah bingkai dan memiliki pencahayaan cukup.</li>
              <li>Hindari tumpukan sampah yang terlalu banyak sekaligus agar fokus material jelas.</li>
              <li>Jika layanan AI sedang tidak tersedia, Anda tetap dapat menguji fitur menggunakan tab <strong>Sampel Cepat</strong>.</li>
            </ul>
          </div>

        </div>

        {/* Right Column: AI Detection Result Dashboard (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm space-y-2 animate-fade-in">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-rose-800">
                    Gagal Mendeteksi Sampah
                  </h4>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('sample'); setSelectedImage(null); setErrorMessage(null); }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Coba Sampel Preset
                </button>
                <button
                  type="button"
                  onClick={handleResetScan}
                  className="px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          {/* Default Empty State when No Result */}
          {!result && !isScanning && !errorMessage && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">
                  Hasil Deteksi AI Akan Muncul di Sini
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Ambil foto sampah atau pilih salah satu sampel cepat di tab sebelah kiri. 
                  Sistem kami akan memberikan panduan pemilahan wadah resmi KLHK dan potensi ekonominya.
                </p>
              </div>
            </div>
          )}

          {/* Scanning Skeleton Pulse */}
          {isScanning && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-5 shadow-sm">
              <div className="h-6 bg-slate-200 rounded-full w-2/3"></div>
              <div className="h-20 bg-slate-100 rounded-2xl"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
              <div className="h-32 bg-slate-100 rounded-2xl"></div>
            </div>
          )}

          {/* Active AI Result Card */}
          {result && !isScanning && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Reward Notification Banner */}
              {rewardNotice && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-between gap-3 animate-bounce-short">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Coins className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-xs font-black">+{rewardNotice.points} Poin Edukasi Diterima!</div>
                      <div className="text-[11px] text-emerald-100">Total Poin Akun: <strong>{rewardNotice.newTotal} Poin</strong></div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">
                    Eco Hero 🌱
                  </span>
                </div>
              )}

              {/* Main Result Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-5">
                
                {/* Header: Badge "Dianalisis AI" vs "Mode offline (berdasarkan kata kunci)" */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {result.source === 'ai' ? (
                      <span>
                        {result.confidence ? `${result.confidence}% Akurat • Dianalisis AI` : 'Dianalisis AI'}
                      </span>
                    ) : (
                      <span>Mode offline (berdasarkan kata kunci)</span>
                    )}
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                    {result.source === 'ai' ? 'AI Cloud' : 'Katalog Lokal'}
                  </span>
                </div>

                {/* Waste Object Name */}
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {result.name}
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                {/* National Standard Bin Card */}
                <div 
                  className="p-4 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-xs"
                  style={{
                    backgroundColor: result.badge_bg || '#EFF6FF',
                    borderColor: result.bin_color || '#2563EB'
                  }}
                >
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Wadah Tempat Sampah Sesuai:
                    </div>
                    <div 
                      className="text-base font-black"
                      style={{ color: result.badge_text || '#1D4ED8' }}
                    >
                      {result.bin_name}
                    </div>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm"
                    style={{ backgroundColor: result.bin_color || '#2563EB' }}
                  >
                    🗑️
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Waktu Urai Alami:
                    </div>
                    <div className="text-xs font-black text-slate-800">
                      {result.decomposition_time}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Recycle className="w-3 h-3 text-brand-600" />
                      Status Daur Ulang:
                    </div>
                    <div className={`text-xs font-black ${result.is_recyclable ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {result.is_recyclable ? 'Dapat Didaur Ulang ♻️' : 'Residu / Khusus ⚠️'}
                    </div>
                  </div>
                </div>

                {/* Economic Value in Bank Sampah */}
                {result.economic_value && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <strong>Estimasi Nilai Bank Sampah:</strong> {result.economic_value}
                    </div>
                  </div>
                )}

                {/* Step-by-Step Disposal Guide */}
                {result.disposal_steps && result.disposal_steps.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Langkah Pemilahan Praktis:
                    </h4>
                    <div className="space-y-2">
                      {result.disposal_steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Danger / Environmental Impact Note */}
                {result.danger_notes && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-rose-700">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Dampak Jika Dibuang Sembarangan:
                    </div>
                    <p className="text-[11px] leading-relaxed text-rose-800">
                      {result.danger_notes}
                    </p>
                  </div>
                )}

                {/* Eco Tip */}
                {result.eco_tip && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Tips Hijau:</strong> {result.eco_tip}
                    </div>
                  </div>
                )}

                {/* Action Buttons: Bank Sampah & Encyclopedia */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/bank-sampah"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all text-center"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Cari Bank Sampah</span>
                  </Link>
                  <Link
                    to={`/ensiklopedia?q=${encodeURIComponent(result.name)}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all text-center"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ensiklopedia</span>
                  </Link>
                </div>

              </div>

              {/* CTA to Open Chat Widget */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Punya Pertanyaan Lain?</div>
                    <div className="text-[11px] text-slate-500">Gunakan Chatbot AI Trashly di pojok kanan bawah layar.</div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* User Scan History Section (If Authenticated) */}
      {isAuthenticated && scanHistory.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-800">Riwayat Pemindaian Anda</h3>
            </div>
            <span className="text-xs text-slate-500">
              Total {scanHistory.length} kali scan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scanHistory.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 transition-colors flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800">{item.waste_name}</div>
                  <div className="text-[10px] text-slate-500">
                    {item.category_name} {item.confidence ? `• ${item.confidence}% Akurasi` : ''}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  +15 Poin
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
