import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Recycle, Droplets, ShieldCheck, Zap, Info } from 'lucide-react';

export default function Interactive3DBottle() {
  const containerRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeModel, setActiveModel] = useState('smart'); // 'smart' | 'mineral'
  const [bottleWeight, setBottleWeight] = useState(210);
  const [recyclePercent, setRecyclePercent] = useState(60);
  const [showTip, setShowTip] = useState(false);
  const [lightPos, setLightPos] = useState({ x: 50, y: 30 });

  // Mouse move 3D tilt effect
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 14; // max 14 deg tilt
    const rotY = ((x - centerX) / centerX) * 16;  // max 16 deg tilt

    setRotate({ x: rotX, y: rotY });
    setLightPos({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100)
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Subtle natural floating animation when not hovered
  const [floatOffset, setFloatOffset] = useState(0);
  useEffect(() => {
    let frameId;
    let time = 0;
    const animate = () => {
      time += 0.03;
      setFloatOffset(Math.sin(time) * 6);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Micro interaction: Click on smart bin OLED to simulate scanning recycled bottles
  const handleScanBottle = () => {
    setBottleWeight(prev => (prev >= 450 ? 120 : prev + 30));
    setRecyclePercent(prev => (prev >= 95 ? 40 : prev + 5));
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none">
      
      {/* 3D Model Switcher Pill (Top of Bottle) */}
      <div className="mb-4 inline-flex items-center p-1 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full border border-slate-200/80 dark:border-slate-800 shadow-sm z-20">
        <button
          type="button"
          onClick={() => setActiveModel('smart')}
          className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            activeModel === 'smart'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          🏆 Smart Eco-Receptacle 3D
        </button>
        <button
          type="button"
          onClick={() => setActiveModel('mineral')}
          className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
            activeModel === 'mineral'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Droplets className="w-3 h-3 text-cyan-300" />
          Botol Mineral PET 3D
        </button>
      </div>

      {/* Main 3D Stage / Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[420px] sm:max-w-[460px] h-[480px] sm:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing perspective-[1200px]"
      >
        
        {/* Ambient Backlight Glow (Cyan/Green soft atmospheric glow matching screenshot) */}
        <div
          className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-60 dark:opacity-40"
          style={{
            background: activeModel === 'smart'
              ? 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(34, 197, 94, 0.25) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(14, 165, 233, 0.5) 0%, rgba(16, 185, 129, 0.3) 50%, transparent 70%)',
            transform: `translate(${rotate.y * 1.5}px, ${rotate.x * 1.5}px)`
          }}
        ></div>

        {/* 3D Transform Object Container */}
        <div
          className="relative transition-transform duration-200 ease-out will-change-transform flex flex-col items-center justify-center"
          style={{
            transform: `translateY(${isHovered ? 0 : floatOffset}px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >

          {/* ================= MODEL 1: SMART RECEPTACLE & GOLD BOTTLE (Matching Screenshot) ================= */}
          {activeModel === 'smart' && (
            <div className="relative group/bottle flex flex-col items-center">
              
              {/* Bottle Cap (Maroon Textured Cap with Embossed Detail) */}
              <div 
                className="w-24 h-16 sm:w-28 sm:h-18 rounded-t-2xl relative shadow-md overflow-hidden z-20"
                style={{
                  background: 'linear-gradient(135deg, #881337 0%, #4c0519 50%, #9f1239 100%)',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.35)'
                }}
              >
                {/* Cap Ridges Texture */}
                <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(90deg,transparent,transparent_3px,#000_4px)]"></div>
                {/* Cap Embossed Logo */}
                <div className="absolute inset-x-0 bottom-2 text-center text-[8px] font-black tracking-widest text-rose-200/60 uppercase">
                  TRASHLY
                </div>
              </div>

              {/* Cap Neck Ring */}
              <div 
                className="w-26 h-3 rounded-sm z-20"
                style={{
                  background: 'linear-gradient(90deg, #ca8a04 0%, #fef08a 40%, #a16207 100%)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              ></div>

              {/* Gold Metallic Bottle Body */}
              <div 
                className="w-56 h-60 sm:w-64 sm:h-68 rounded-t-[48px] relative overflow-hidden -mt-1 z-10"
                style={{
                  background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, #fef08a 0%, #eab308 25%, #ca8a04 60%, #854d0e 90%, #713f12 100%)`,
                  boxShadow: 'inset 0 4px 12px rgba(255,255,255,0.6), inset -6px 0 16px rgba(0,0,0,0.4), 0 16px 32px -8px rgba(0,0,0,0.3)'
                }}
              >
                {/* Metallic Brush Texture & Dynamic Light Sweep */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(${105 + rotate.y * 2}deg, transparent 20%, rgba(255,255,255,0.7) 45%, rgba(255,255,255,0.9) 50%, transparent 65%)`
                  }}
                ></div>

                {/* Subtle Surface Texture Scratches */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]"></div>

                {/* Red Geometric Mountain Triangle Logo (Exact Match to Screenshot) */}
                <div className="absolute left-6 bottom-14 flex items-end gap-1 opacity-90 drop-shadow-sm">
                  {/* Big Left Triangle */}
                  <div 
                    className="w-12 h-14"
                    style={{
                      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                      background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
                      boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)'
                    }}
                  ></div>
                  {/* Smaller Right Triangle */}
                  <div 
                    className="w-10 h-10 -ml-3"
                    style={{
                      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                      background: 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)'
                    }}
                  ></div>
                </div>

                {/* Gold Sheen Reflection highlight */}
                <div className="absolute top-0 right-8 w-12 h-full bg-white/20 blur-md pointer-events-none"></div>
              </div>

              {/* Smart Docking Station Receptacle (Matte Black Base) */}
              <div 
                className="w-64 sm:w-72 h-44 rounded-b-3xl relative overflow-hidden -mt-6 z-20 border-t border-slate-700/60 flex flex-col items-center justify-between p-3"
                style={{
                  background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 40%, #020617 100%)',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1)'
                }}
              >
                {/* Digital OLED Sensor Screen */}
                <button
                  type="button"
                  onClick={handleScanBottle}
                  title="Klik untuk simulasi sensor timbangan cerdas!"
                  className="mt-1 px-3 py-1 bg-slate-950 rounded-md border border-cyan-500/40 shadow-inner flex items-center gap-2 cursor-pointer hover:border-cyan-400 transition-all group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></div>
                  <span className="font-mono text-[10px] font-bold text-cyan-300 tracking-wider">
                    {bottleWeight} gms • {recyclePercent}%
                  </span>
                  <Zap className="w-2.5 h-2.5 text-cyan-400 group-hover:scale-125 transition-transform" />
                </button>

                {/* Dock Chamber Window with Golden Backlight */}
                <div className="w-44 h-24 bg-gradient-to-b from-amber-950/40 via-amber-900/20 to-slate-950 rounded-xl border border-amber-500/30 shadow-inner flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial from-amber-400/10 to-transparent"></div>
                  {/* Embossed Triangle Logo in Chamber */}
                  <div className="flex items-center gap-1 opacity-25 scale-75">
                    <div className="w-8 h-10 bg-amber-400" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                    <div className="w-6 h-7 bg-amber-500 -ml-2" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                  </div>
                  <span className="absolute bottom-1 text-[9px] font-mono font-bold text-amber-300/60 uppercase tracking-widest">
                    SMART COMPACTOR
                  </span>
                </div>

                {/* Dock Base Rim */}
                <div className="w-full flex justify-between items-center px-3 pt-1 border-t border-slate-800 text-[9px] font-bold text-slate-500">
                  <span>SENSOR ID #TR-01</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ONLINE
                  </span>
                </div>
              </div>

              {/* Realistic Contact Shadow */}
              <div 
                className="w-56 h-6 rounded-full bg-black/40 blur-md -mt-2 transition-all duration-300 pointer-events-none"
                style={{
                  transform: `scale(${isHovered ? 1.08 : 1})`,
                  opacity: isHovered ? 0.6 : 0.4
                }}
              ></div>

            </div>
          )}

          {/* ================= MODEL 2: BOTOL AIR MINERAL 3D (PET KODE 1) ================= */}
          {activeModel === 'mineral' && (
            <div className="relative group/bottle flex flex-col items-center animate-fade-in">
              
              {/* Blue Mineral Bottle Cap */}
              <div 
                className="w-16 h-10 rounded-t-lg relative shadow-md z-20"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #075985 100%)',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), 0 3px 6px rgba(0,0,0,0.2)'
                }}
              >
                <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_3px)]"></div>
              </div>

              {/* Safety Ring Neck */}
              <div className="w-18 h-2 bg-sky-300 rounded-xs z-20"></div>

              {/* Transparent Ribbed PET Plastic Bottle */}
              <div 
                className="w-52 h-76 sm:w-56 sm:h-84 rounded-t-[36px] rounded-b-2xl relative overflow-hidden backdrop-blur-xs z-10 border border-sky-200/50"
                style={{
                  background: 'linear-gradient(135deg, rgba(224, 242, 254, 0.45) 0%, rgba(186, 230, 253, 0.25) 50%, rgba(224, 242, 254, 0.5) 100%)',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.7), inset -4px 0 10px rgba(3, 105, 161, 0.15), 0 16px 32px rgba(0,0,0,0.1)'
                }}
              >
                {/* 3D Cylindrical Contour Ribs */}
                <div className="absolute inset-x-0 top-12 h-2.5 bg-sky-300/30 border-y border-white/50"></div>
                <div className="absolute inset-x-0 top-20 h-2.5 bg-sky-300/30 border-y border-white/50"></div>
                <div className="absolute inset-x-0 top-28 h-2.5 bg-sky-300/30 border-y border-white/50"></div>

                {/* Recycled Water Level Wave */}
                <div 
                  className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-cyan-400/40 via-sky-300/25 to-transparent relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>

                {/* Eco Label Banner Wrap */}
                <div className="absolute inset-x-0 top-36 py-3 bg-gradient-to-r from-emerald-600 via-brand-500 to-teal-700 text-white shadow-md flex items-center justify-between px-4 z-20">
                  <div className="flex items-center gap-1.5">
                    <Recycle className="w-5 h-5 text-amber-300 animate-spin-slow" />
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider leading-none">
                        PET Kode 1
                      </div>
                      <div className="text-[8px] text-emerald-100 font-semibold">
                        100% Recyclable
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full border border-white/40">
                    450 Thn Urai
                  </span>
                </div>

                {/* Lower Grip Ribs */}
                <div className="absolute inset-x-0 bottom-12 h-2.5 bg-sky-300/30 border-y border-white/50"></div>
                <div className="absolute inset-x-0 bottom-6 h-2.5 bg-sky-300/30 border-y border-white/50"></div>

                {/* Specular Light Reflection Sweep */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-60"
                  style={{
                    background: `linear-gradient(${115 + rotate.y * 3}deg, transparent 25%, rgba(255,255,255,0.8) 50%, transparent 65%)`
                  }}
                ></div>

              </div>

              {/* Botol Mineral Base Contact Shadow */}
              <div 
                className="w-48 h-5 rounded-full bg-black/25 blur-md mt-1 transition-all pointer-events-none"
                style={{ transform: `scale(${isHovered ? 1.1 : 1})` }}
              ></div>

            </div>
          )}

        </div>

      </div>

      {/* Floating Bottom Pill Tags (Matching Screenshot Bottom Labels) */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 z-20">
        
        {/* Organik : Daun */}
        <div className="px-4 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold tracking-wider uppercase shadow-xs flex items-center gap-2 hover:border-emerald-500 transition-colors">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>ORGANIK : DAUN</span>
        </div>

        {/* Anorganik : Botol 50 */}
        <div className="px-4 py-2 rounded-full bg-slate-900 dark:bg-white border border-slate-800 dark:border-slate-200 text-white dark:text-slate-900 text-xs font-bold tracking-wider uppercase shadow-xs flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="w-2 h-2 rounded-full bg-brand-400"></span>
          <span>ANORGANIK : BOTOL 50</span>
        </div>

      </div>

    </div>
  );
}
