import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  RotateCw, 
  Scan, 
  Sparkles, 
  ShieldCheck, 
  Droplets, 
  Maximize2, 
  Minimize2, 
  Info,
  Compass,
  ArrowRight,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Interactive3DBottle() {
  const mountRef = useRef(null);
  
  // Interactive UI States
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [waterFilled, setWaterFilled] = useState(true);
  const [bottleCrushed, setBottleCrushed] = useState(false);
  const [activeInfo, setActiveInfo] = useState('pet'); // 'pet' | 'cap' | 'co2'

  // References to 3D scene objects to manipulate from React state
  const sceneRef = useRef(null);
  const bottleGroupRef = useRef(null);
  const plasticMeshRef = useRef(null);
  const waterMeshRef = useRef(null);
  const capMeshRef = useRef(null);
  const labelMeshRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousPointerPos = useRef({ x: 0, y: 0 });
  const momentumRef = useRef({ x: 0, y: 0.005 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const width = container.clientWidth || 440;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.3, 8.5);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Clear existing canvas if any
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting Rig for Realistic Glass/Plastic PBR
    // Main key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Cyan/Sky Blue rim backlight for edge highlights (Fresnel reflection)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 3.5);
    rimLight.position.set(-6, 3, -5);
    scene.add(rimLight);

    // Soft emerald fill light for eco brand atmosphere
    const fillLight = new THREE.DirectionalLight(0x10b981, 1.2);
    fillLight.position.set(6, -3, 3);
    scene.add(fillLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // 3. Create Master Bottle Group
    const bottleGroup = new THREE.Group();
    bottleGroupRef.current = bottleGroup;
    bottleGroup.position.set(0, -0.15, 0);
    scene.add(bottleGroup);

    // 4. Construct LatheGeometry for Realistic Ribbed Mineral Bottle Profile
    const profilePoints = [
      new THREE.Vector2(0.0, -3.0),
      new THREE.Vector2(0.85, -2.96),
      new THREE.Vector2(1.15, -2.85),
      new THREE.Vector2(1.18, -2.6),
      // Lower grip ribs
      new THREE.Vector2(1.1, -2.3),
      new THREE.Vector2(1.22, -2.0),
      new THREE.Vector2(1.12, -1.8),
      new THREE.Vector2(1.22, -1.6),
      new THREE.Vector2(1.12, -1.4),
      // Smooth label cylindrical section
      new THREE.Vector2(1.2, -1.2),
      new THREE.Vector2(1.2, 0.4),
      // Upper grip ribs
      new THREE.Vector2(1.12, 0.6),
      new THREE.Vector2(1.22, 0.8),
      new THREE.Vector2(1.12, 1.0),
      new THREE.Vector2(1.22, 1.2),
      // Conical tapered shoulder
      new THREE.Vector2(1.2, 1.4),
      new THREE.Vector2(1.05, 1.7),
      new THREE.Vector2(0.85, 2.0),
      new THREE.Vector2(0.58, 2.25),
      new THREE.Vector2(0.44, 2.45),
      // Collar / Flange Ring
      new THREE.Vector2(0.52, 2.5),
      new THREE.Vector2(0.44, 2.55),
      // Neck cylinder
      new THREE.Vector2(0.42, 2.75),
      new THREE.Vector2(0.40, 2.95),
      // Rim lip
      new THREE.Vector2(0.36, 2.95),
      new THREE.Vector2(0.34, 2.8)
    ];

    const plasticGeometry = new THREE.LatheGeometry(profilePoints, 64);

    // Physically Based Clear PET Plastic Material
    const plasticMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf0f9ff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.06,
      ior: 1.52, // Exact IOR of PET Plastic
      reflectivity: 0.7,
      thickness: 0.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      attenuationColor: new THREE.Color(0xbae6fd),
      attenuationDistance: 2.5
    });

    const plasticMesh = new THREE.Mesh(plasticGeometry, plasticMaterial);
    plasticMesh.castShadow = true;
    plasticMeshRef.current = plasticMesh;
    bottleGroup.add(plasticMesh);

    // 5. Liquid Water Mesh inside the Bottle
    const waterPoints = [
      new THREE.Vector2(0.0, -2.85),
      new THREE.Vector2(1.05, -2.8),
      new THREE.Vector2(1.12, -2.5),
      new THREE.Vector2(1.13, -1.2),
      new THREE.Vector2(1.14, 0.4),
      new THREE.Vector2(1.14, 1.2),
      new THREE.Vector2(0.95, 1.7),
      new THREE.Vector2(0.75, 1.95),
      // Water surface meniscus
      new THREE.Vector2(0.0, 1.95)
    ];

    const waterGeometry = new THREE.LatheGeometry(waterPoints, 48);
    const waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.88,
      transparent: true,
      opacity: 0.95,
      roughness: 0.02,
      ior: 1.333, // IOR of Pure Water
      thickness: 0.8,
      attenuationColor: new THREE.Color(0x0284c7),
      attenuationDistance: 1.2
    });

    const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    waterMeshRef.current = waterMesh;
    bottleGroup.add(waterMesh);

    // 6. Screw Cap (Tutup Botol Biru)
    const capGroup = new THREE.Group();
    capMeshRef.current = capGroup;

    const capMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.35,
      metalness: 0.15
    });

    // Cap outer cylinder with ridges
    const capCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 0.55, 48),
      capMat
    );
    capCylinder.position.y = 2.85;
    capCylinder.castShadow = true;
    capGroup.add(capCylinder);

    // Cap top dome
    const capTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.44, 0.48, 0.12, 48),
      capMat
    );
    capTop.position.y = 3.15;
    capGroup.add(capTop);

    // Security ring notches
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.4
    });
    const securityRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.47, 0.47, 0.12, 32),
      ringMat
    );
    securityRing.position.y = 2.52;
    capGroup.add(securityRing);

    bottleGroup.add(capGroup);

    // 7. Dynamic Canvas Procedural Label Texture
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 1024;
    labelCanvas.height = 512;
    const ctx = labelCanvas.getContext('2d');

    // Gradient background for label
    const grad = ctx.createLinearGradient(0, 0, 1024, 0);
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(0.2, '#059669');
    grad.addColorStop(0.5, '#10b981');
    grad.addColorStop(0.8, '#059669');
    grad.addColorStop(1, '#064e3b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // White accent borders
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 992, 480);

    // Trashly Brand Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('TRASHLY PURE', 80, 160);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('600ml • 100% RECYCLABLE BOTTLE', 80, 220);

    // Resin Code PET 1 Box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(720, 80, 220, 180);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 4;
    ctx.strokeRect(720, 80, 220, 180);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText('♳ PET 1', 745, 160);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('FOOD GRADE', 760, 215);

    // Barcode and KLHK Standard
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '24px monospace';
    ctx.fillText('STANDAR KLHK: #2026-PET-RECYCLE', 80, 320);
    ctx.fillText('+15 ECO-POINTS REWARD DI BANK SAMPAH', 80, 360);

    // Faux Barcode bars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) {
      const barW = (i % 3 === 0) ? 6 : 3;
      ctx.fillRect(720 + (i * 5.5), 300, barW, 90);
    }

    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    labelTexture.wrapS = THREE.RepeatWrapping;
    labelTexture.repeat.set(1, 1);

    const labelGeo = new THREE.CylinderGeometry(1.215, 1.215, 1.45, 64, 1, true);
    const labelMat = new THREE.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.25,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.y = -0.4;
    labelMeshRef.current = labelMesh;
    bottleGroup.add(labelMesh);

    // 8. Contact Floor Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 110);
    sGrad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    sGrad.addColorStop(0.4, 'rgba(15, 23, 42, 0.2)');
    sGrad.addColorStop(1, 'transparent');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -3.05;
    scene.add(shadowPlane);

    // 9. Interactive Drag to Rotate 360 Logic
    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      previousPointerPos.current = { x: e.clientX, y: e.clientY };
      momentumRef.current = { x: 0, y: 0 };
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousPointerPos.current.x;
      const deltaY = e.clientY - previousPointerPos.current.y;

      const rotY = deltaX * 0.012;
      const rotX = deltaY * 0.01;

      bottleGroup.rotation.y += rotY;
      bottleGroup.rotation.x = Math.max(-0.6, Math.min(0.6, bottleGroup.rotation.x + rotX));

      momentumRef.current = { x: rotX * 0.7, y: rotY * 0.7 };
      previousPointerPos.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 10. Animation Render Loop
    let animId;
    let floatClock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      floatClock += 0.02;

      // Handle Inertia / Momentum or Auto-Rotation
      if (!isDraggingRef.current) {
        if (Math.abs(momentumRef.current.y) > 0.0001 || Math.abs(momentumRef.current.x) > 0.0001) {
          bottleGroup.rotation.y += momentumRef.current.y;
          bottleGroup.rotation.x = Math.max(-0.6, Math.min(0.6, bottleGroup.rotation.x + momentumRef.current.x));
          momentumRef.current.y *= 0.94; // friction damping
          momentumRef.current.x *= 0.94;
        } else if (isAutoRotating) {
          bottleGroup.rotation.y += 0.012; // turntable continuous rotation
        }

        // Gentle floating hovering oscillation
        bottleGroup.position.y = -0.15 + Math.sin(floatClock) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Handle Container Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Wireframe mode
  useEffect(() => {
    if (plasticMeshRef.current) {
      plasticMeshRef.current.material.wireframe = isWireframe;
    }
    if (waterMeshRef.current) {
      waterMeshRef.current.visible = !isWireframe && waterFilled;
    }
  }, [isWireframe, waterFilled]);

  // Update Water visibility
  useEffect(() => {
    if (waterMeshRef.current) {
      waterMeshRef.current.visible = waterFilled && !isWireframe;
    }
  }, [waterFilled, isWireframe]);

  // Update Crushed scale animation
  useEffect(() => {
    if (bottleGroupRef.current) {
      if (bottleCrushed) {
        bottleGroupRef.current.scale.set(1.15, 0.45, 1.2);
        bottleGroupRef.current.rotation.z = 0.15;
      } else {
        bottleGroupRef.current.scale.set(1, 1, 1);
        bottleGroupRef.current.rotation.z = 0;
      }
    }
  }, [bottleCrushed]);

  const resetRotation = () => {
    if (bottleGroupRef.current) {
      bottleGroupRef.current.rotation.set(0, 0, 0);
      momentumRef.current = { x: 0, y: 0.01 };
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none py-2">
      
      {/* 3D Model Control Toolbar */}
      <div className="mb-2 inline-flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md z-30">
        <button
          type="button"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isAutoRotating
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Putar botol otomatis 360°"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>{isAutoRotating ? 'Auto-Spin ON' : 'Putar 360°'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsWireframe(!isWireframe)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isWireframe
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
          }`}
          title="Mode Wireframe Poligon 3D"
        >
          <Scan className="w-3.5 h-3.5 text-purple-400" />
          <span>Wireframe 3D</span>
        </button>

        <button
          type="button"
          onClick={() => setWaterFilled(!waterFilled)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            waterFilled
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-cyan-600 hover:bg-cyan-50'
          }`}
          title="Kosongkan air sebelum dipilah ke bank sampah"
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>{waterFilled ? 'Ada Air' : 'Kosong'}</span>
        </button>

        <button
          type="button"
          onClick={() => setBottleCrushed(!bottleCrushed)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            bottleCrushed
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50'
          }`}
          title="Simulasi remas botol untuk menghemat ruang tempat sampah"
        >
          {bottleCrushed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          <span>{bottleCrushed ? 'Buka Normal' : 'Remas Botol'}</span>
        </button>

        <button
          type="button"
          onClick={resetRotation}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          title="Reset Sudut Pandang"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full max-w-[440px] sm:max-w-[480px] h-[480px] sm:h-[530px] flex items-center justify-center">
        
        {/* Atmospheric Backlight Glow */}
        <div className="absolute w-80 h-80 rounded-full bg-radial from-cyan-400/25 via-emerald-300/15 to-transparent blur-3xl pointer-events-none" />

        {/* The Real Three.js Canvas Mount */}
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
        />

        {/* Floating Holographic Info HUD Card (Interactive) */}
        <div className="absolute -left-4 sm:-left-10 top-24 z-20 max-w-[190px] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-200/90 pointer-events-auto transition-transform hover:scale-105">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span className="font-extrabold text-[11px] uppercase tracking-wide">PET Kode 1</span>
          </div>
          <p className="text-[10px] text-slate-600 leading-tight">
            Material Polyethylene Terephthalate murni. 100% dapat didaur ulang menjadi serat tekstil & botol baru.
          </p>
          <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200">
            Nilai Jual: Rp 3.500/kg
          </span>
        </div>

        {/* Floating Eco Metrics (Right) */}
        <div className="absolute -right-4 sm:-right-10 bottom-24 z-20 max-w-[185px] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-200/90 pointer-events-auto transition-transform hover:scale-105">
          <div className="flex items-center gap-1.5 text-cyan-600 mb-1">
            <Droplets className="w-4 h-4 flex-shrink-0" />
            <span className="font-extrabold text-[11px] uppercase tracking-wide">Dampak Pemilahan</span>
          </div>
          <div className="text-[10px] text-slate-700 font-semibold space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Reduksi Emisi:</span>
              <span className="font-bold text-emerald-600">-82.5g CO2e</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Hemat Air:</span>
              <span className="font-bold text-cyan-600">3.0 Liter</span>
            </div>
            <div className="flex items-center justify-between pt-0.5 border-t border-slate-100">
              <span className="text-slate-500">Waktu Urai:</span>
              <span className="font-bold text-amber-600">450 Tahun</span>
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons Below 3D Bottle */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5 z-20">
        <Link
          to="/scan"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-700 hover:to-brand-700 text-white rounded-full text-xs font-bold shadow-md shadow-brand-500/20 transition-all hover:scale-105"
        >
          <Scan className="w-3.5 h-3.5" />
          <span>Pindai Sampah Botol Nyata</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          to="/ensiklopedia/botol-plastik-pet"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-xs font-semibold shadow-xs transition-all"
        >
          <Info className="w-3.5 h-3.5 text-brand-600" />
          <span>Panduan Daur Ulang PET</span>
        </Link>
      </div>

      {/* Drag & Rotation Tip */}
      <p className="text-[11px] text-slate-400 mt-2 font-medium flex items-center gap-1.5">
        <Compass className="w-3.5 h-3.5 text-brand-500" />
        <span>Tarik / Drag objek botol dengan mouse untuk memutar 360° ke segala arah</span>
      </p>

    </div>
  );
}
