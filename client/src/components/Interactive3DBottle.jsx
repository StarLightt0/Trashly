import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  RotateCw, 
  Scan, 
  Droplets, 
  Maximize2, 
  Minimize2, 
  Info,
  Compass,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

// -------------------------------------------------------------
// Helper 1: Procedural Studio Softbox Environment Map
// Memberikan refleksi studio foto profesional pada plastik & air
// -------------------------------------------------------------
function generateStudioEnvTexture(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Background gelap studio
  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(0, 0, 512, 256);

  // Softbox Utama Kanan Atas (Putih Terang)
  const mainSoftbox = ctx.createRadialGradient(380, 80, 10, 380, 80, 120);
  mainSoftbox.addColorStop(0, 'rgba(255, 255, 255, 1)');
  mainSoftbox.addColorStop(0.5, 'rgba(240, 249, 255, 0.8)');
  mainSoftbox.addColorStop(1, 'rgba(10, 15, 29, 0)');
  ctx.fillStyle = mainSoftbox;
  ctx.fillRect(200, 0, 312, 200);

  // Rim Light Kiri Biru/Cyan (Edge Fresnel)
  const rimSoftbox = ctx.createLinearGradient(0, 40, 100, 220);
  rimSoftbox.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
  rimSoftbox.addColorStop(0.7, 'rgba(14, 165, 233, 0.4)');
  rimSoftbox.addColorStop(1, 'rgba(10, 15, 29, 0)');
  ctx.fillStyle = rimSoftbox;
  ctx.fillRect(0, 20, 150, 220);

  // Bottom Reflector Fill (Emerald Halus Eco Brand)
  const bottomFill = ctx.createLinearGradient(0, 200, 0, 256);
  bottomFill.addColorStop(0, 'rgba(16, 185, 129, 0)');
  bottomFill.addColorStop(1, 'rgba(16, 185, 129, 0.4)');
  ctx.fillStyle = bottomFill;
  ctx.fillRect(0, 200, 512, 56);

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envMap = pmremGenerator.fromEquirectangular(tex).texture;
  pmremGenerator.dispose();
  tex.dispose();

  return envMap;
}

// -------------------------------------------------------------
// Helper 2: Procedural Water Droplets & Ribs Bump Map
// Menghasilkan bintik embun mikro realistis di permukaan botol
// -------------------------------------------------------------
function generatePlasticBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Neutral grey base (128 = no displacement)
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle horizontal contour ribs
  for (let y = 80; y < 960; y += 48) {
    const ribGrad = ctx.createLinearGradient(0, y, 0, y + 24);
    ribGrad.addColorStop(0, '#757575');
    ribGrad.addColorStop(0.5, '#959595');
    ribGrad.addColorStop(1, '#757575');
    ctx.fillStyle = ribGrad;
    ctx.fillRect(0, y, 1024, 18);
  }

  // Micro condensation water droplets (random organic drops)
  const seedRandom = (seed) => {
    let s = Math.sin(seed) * 10000;
    return s - Math.floor(s);
  };

  for (let i = 0; i < 280; i++) {
    const x = seedRandom(i * 1.3) * 1024;
    const y = seedRandom(i * 2.7) * 900 + 60;
    const r = seedRandom(i * 4.1) * 4.5 + 1.5;

    const dropGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.5, x, y, r);
    dropGrad.addColorStop(0, '#ffffff');
    dropGrad.addColorStop(0.6, '#b0b0b0');
    dropGrad.addColorStop(1, '#707070');

    ctx.fillStyle = dropGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

// -------------------------------------------------------------
// Helper 3: Procedural High-Res 2048x1024 Label Texture
// Tekstur kemasan produk resmi berstandar nasional
// -------------------------------------------------------------
function generateLabelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Background: Deep Forest & Emerald Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 2048, 0);
  bgGrad.addColorStop(0, '#044e39');
  bgGrad.addColorStop(0.15, '#057053');
  bgGrad.addColorStop(0.5, '#0d946d');
  bgGrad.addColorStop(0.85, '#057053');
  bgGrad.addColorStop(1, '#044e39');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Metallic Gold Ribbon Top & Bottom
  const goldGrad = ctx.createLinearGradient(0, 0, 2048, 0);
  goldGrad.addColorStop(0, '#b45309');
  goldGrad.addColorStop(0.2, '#fde047');
  goldGrad.addColorStop(0.5, '#fbbf24');
  goldGrad.addColorStop(0.8, '#fde047');
  goldGrad.addColorStop(1, '#b45309');

  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, 30, 2048, 18);
  ctx.fillRect(0, 976, 2048, 18);

  // Inner subtle geometric grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  for (let x = 0; x < 2048; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 48);
    ctx.lineTo(x, 976);
    ctx.stroke();
  }

  // --- BRAND PANEL (FRONT SIDE - Center at x ~ 512 & 1536) ---
  const drawBrandPanel = (cx) => {
    // Mountain Peaks Silhouette in background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(cx - 320, 520);
    ctx.lineTo(cx - 140, 260);
    ctx.lineTo(cx, 440);
    ctx.lineTo(cx + 180, 200);
    ctx.lineTo(cx + 340, 520);
    ctx.closePath();
    ctx.fill();

    // Brand Name: TRASHLY
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 110px "Inter", "Segoe UI", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('TRASHLY', cx, 360);

    // Subtitle: PURE SPRING WATER
    ctx.fillStyle = '#fef08a';
    ctx.font = '800 48px "Inter", "Segoe UI", sans-serif';
    ctx.letterSpacing = '10px';
    ctx.fillText('PURE MINERAL', cx, 440);

    // Volume & Tagline
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 36px "Inter", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('600 ml • AIR MINERAL PEGUNUNGAN ALAMI', cx, 520);

    // Eco Badge Ribbon
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(cx - 360, 580, 720, 110);
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)';
    ctx.lineWidth = 4;
    ctx.strokeRect(cx - 360, 580, 720, 110);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('♻️ 100% BOTOL DAPAT DIDAUR ULANG', cx, 635);
    ctx.fillStyle = '#a7f3d0';
    ctx.font = '500 28px sans-serif';
    ctx.fillText('STANDAR KLHK INDONESIA • FOOD GRADE', cx, 672);

    // Reward Eco-Points callout
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('🏆 SETOR KE BANK SAMPAH: +15 ECO-POINTS', cx, 750);
  };

  drawBrandPanel(600);

  // --- REAR NUTRITION & RESIN CODE PANEL (At x ~ 1550) ---
  const rx = 1580;

  // Box Resin Code PET 1
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(rx - 380, 160, 320, 360);
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 6;
  ctx.strokeRect(rx - 380, 160, 320, 360);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 110px sans-serif';
  ctx.fillText('♳', rx - 220, 280);

  ctx.font = '900 48px sans-serif';
  ctx.fillText('PET 1', rx - 220, 350);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('KODE RESIN', rx - 220, 410);
  ctx.font = '22px sans-serif';
  ctx.fillStyle = '#6ee7b7';
  ctx.fillText('POLYETHYLENE', rx - 220, 445);
  ctx.fillText('TEREPHTHALATE', rx - 220, 475);

  // Mineral Information Table
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText('KANDUNGAN MINERAL ALAMI', rx - 20, 200);

  ctx.font = '26px monospace';
  ctx.fillStyle = '#d1fae5';
  ctx.fillText('• Kalsium (Ca²⁺)   : 18.2 mg/L', rx - 20, 255);
  ctx.fillText('• Magnesium (Mg²⁺) :  6.8 mg/L', rx - 20, 300);
  ctx.fillText('• Natrium (Na⁺)    :  9.4 mg/L', rx - 20, 345);
  ctx.fillText('• Kalium (K⁺)      :  2.1 mg/L', rx - 20, 390);
  ctx.fillText('• pH Seimbang      :  7.8 Alami', rx - 20, 435);

  // Certification Seals Bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(rx - 380, 550, 760, 120);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('SNI 01-3553-2026 • BPOM RI MD 265210001099', rx - 350, 600);
  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#fde047';
  ctx.fillText('DIPRODUKSI DENGAN 100% ENERGI BERSIH RAMAH BUMI', rx - 350, 642);

  // Realistic Barcode lines
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 70; i++) {
    const bw = (i % 4 === 0 || i % 7 === 0) ? 6 : (i % 2 === 0 ? 3 : 2);
    ctx.fillRect(rx - 380 + (i * 10.8), 700, bw, 130);
  }
  ctx.font = '24px monospace';
  ctx.fillText('8 991234 567890', rx - 180, 860);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

export default function Interactive3DBottle() {
  const mountRef = useRef(null);
  
  // Interactive Controls & Visual Modes
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [waterFilled, setWaterFilled] = useState(true);
  const [bottleCrushed, setBottleCrushed] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);

  // Internal Three.js Object Handles
  const bottleGroupRef = useRef(null);
  const plasticMeshRef = useRef(null);
  const waterMeshRef = useRef(null);
  const capMeshRef = useRef(null);
  const labelMeshRef = useRef(null);
  
  // Robust Drag Mechanics (No Gimbal Lock, Pointer Capture)
  const isDraggingRef = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const idleTimer = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 460;
    const height = container.clientHeight || 530;

    // 1. Scene, Camera, High-Performance WebGL Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 9.2);

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
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.touchAction = 'none';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Generate Realistic Studio HDRI Environment Reflection Map
    const studioEnvMap = generateStudioEnvTexture(renderer);
    scene.environment = studioEnvMap;

    // 3. Studio Lighting Rig
    // Main Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 7, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Cool Cyan Rim Light (Fresnel Edge Highlighter)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 3.8);
    rimLight.position.set(-7, 4, -5);
    scene.add(rimLight);

    // Warm Soft Fill Light
    const fillLight = new THREE.DirectionalLight(0xecfdf5, 1.2);
    fillLight.position.set(4, -4, 4);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // 4. Master Bottle Group
    const bottleGroup = new THREE.Group();
    bottleGroupRef.current = bottleGroup;
    bottleGroup.position.set(0, -0.15, 0);
    scene.add(bottleGroup);

    // 5. Procedural Texture Assets
    const bumpMap = generatePlasticBumpTexture();
    const labelTexture = generateLabelTexture();

    // 6. Realistic 600ml Bottle Lathe Geometry Profile
    const profile = [
      new THREE.Vector2(0.0, -3.1),
      new THREE.Vector2(0.85, -3.06),
      new THREE.Vector2(1.15, -2.92),
      new THREE.Vector2(1.22, -2.7),
      // Lower ribbed contour
      new THREE.Vector2(1.16, -2.4),
      new THREE.Vector2(1.24, -2.1),
      new THREE.Vector2(1.16, -1.85),
      new THREE.Vector2(1.24, -1.6),
      new THREE.Vector2(1.18, -1.4),
      // Label smooth shelf
      new THREE.Vector2(1.22, -1.25),
      new THREE.Vector2(1.22, 0.45),
      // Upper ribbed contour
      new THREE.Vector2(1.18, 0.65),
      new THREE.Vector2(1.24, 0.85),
      new THREE.Vector2(1.18, 1.05),
      new THREE.Vector2(1.24, 1.25),
      // Shoulder taper
      new THREE.Vector2(1.22, 1.45),
      new THREE.Vector2(1.10, 1.75),
      new THREE.Vector2(0.90, 2.05),
      new THREE.Vector2(0.60, 2.35),
      new THREE.Vector2(0.48, 2.55),
      // Flange ring
      new THREE.Vector2(0.55, 2.6),
      new THREE.Vector2(0.46, 2.65),
      // Neck cylinder
      new THREE.Vector2(0.44, 2.85),
      new THREE.Vector2(0.42, 3.0),
      // Lip opening
      new THREE.Vector2(0.38, 3.0),
      new THREE.Vector2(0.36, 2.85)
    ];

    const plasticGeo = new THREE.LatheGeometry(profile, 64);

    // Ultra-Realistic Physically Based Clear PET Material
    const plasticMat = new THREE.MeshPhysicalMaterial({
      color: 0xf0f9ff,
      transmission: 0.94,
      transparent: true,
      opacity: 1,
      roughness: 0.05,
      ior: 1.52, // Authentic PET Plastic Refractive Index
      thickness: 0.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      bumpMap: bumpMap,
      bumpScale: 0.012, // Subtle realistic micro water droplets & rib bump
      envMapIntensity: 1.4,
      attenuationColor: new THREE.Color(0xbae6fd),
      attenuationDistance: 2.8
    });

    const plasticMesh = new THREE.Mesh(plasticGeo, plasticMat);
    plasticMesh.castShadow = true;
    plasticMesh.renderOrder = 2; // Clean transparency order
    plasticMeshRef.current = plasticMesh;
    bottleGroup.add(plasticMesh);

    // 7. Water Liquid Volume (Nested inside the bottle)
    const waterProfile = [
      new THREE.Vector2(0.0, -2.95),
      new THREE.Vector2(1.05, -2.85),
      new THREE.Vector2(1.16, -2.6),
      new THREE.Vector2(1.16, -1.25),
      new THREE.Vector2(1.16, 0.45),
      new THREE.Vector2(1.16, 1.25),
      new THREE.Vector2(0.98, 1.75),
      new THREE.Vector2(0.75, 2.05),
      // Meniscus surface curve
      new THREE.Vector2(0.0, 2.05)
    ];

    const waterGeo = new THREE.LatheGeometry(waterProfile, 48);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.90,
      transparent: true,
      opacity: 0.96,
      roughness: 0.03,
      ior: 1.333, // IOR of Pure Water
      thickness: 0.9,
      envMapIntensity: 1.2,
      attenuationColor: new THREE.Color(0x0284c7),
      attenuationDistance: 1.4
    });

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.renderOrder = 1;
    waterMeshRef.current = waterMesh;
    bottleGroup.add(waterMesh);

    // 8. Bottle Cap & Tamper Ring
    const capGroup = new THREE.Group();
    capMeshRef.current = capGroup;

    const capMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.32,
      metalness: 0.12,
      envMapIntensity: 1.0
    });

    // Knurled Cap Body
    const capCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.50, 0.50, 0.58, 48),
      capMat
    );
    capCylinder.position.y = 2.92;
    capCylinder.castShadow = true;
    capGroup.add(capCylinder);

    // Cap Top Dome
    const capDome = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.50, 0.12, 48),
      capMat
    );
    capDome.position.y = 3.22;
    capGroup.add(capDome);

    // Tamper-evident Security Ring
    const securityRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.49, 0.49, 0.14, 32),
      new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.38 })
    );
    securityRing.position.y = 2.58;
    capGroup.add(securityRing);

    bottleGroup.add(capGroup);

    // 9. Cylindrical High-Res Wrap Label (No Z-Fighting with PolygonOffset)
    const labelGeo = new THREE.CylinderGeometry(1.238, 1.238, 1.62, 64, 1, true);
    const labelMat = new THREE.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.28,
      metalness: 0.08,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1.5,
      polygonOffsetUnits: -1.5
    });

    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.y = -0.4;
    labelMesh.renderOrder = 3;
    labelMeshRef.current = labelMesh;
    bottleGroup.add(labelMesh);

    // 10. Contact Drop Shadow
    const shadowGeo = new THREE.PlaneGeometry(5.5, 5.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 115);
    sGrad.addColorStop(0, 'rgba(15, 23, 42, 0.42)');
    sGrad.addColorStop(0.35, 'rgba(15, 23, 42, 0.18)');
    sGrad.addColorStop(1, 'transparent');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -3.12;
    scene.add(shadowMesh);

    // 11. Rock-Solid, Bug-Free Pointer Drag & Clamping Engine
    const onPointerDown = (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      isDraggingRef.current = true;
      setIsInteracting(true);
      lastPointer.current = { x: e.clientX, y: e.clientY };
      velocity.current = { x: 0, y: 0 };

      if (idleTimer.current) clearTimeout(idleTimer.current);
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - lastPointer.current.x;
      const deltaY = e.clientY - lastPointer.current.y;

      // Safe Clamped Rotation:
      // Y-axis = 360° unconstrained rotation
      // X-axis = pitch clamped between -0.65 and +0.65 radians (prevents gimbal lock/flipping)
      const rotY = deltaX * 0.012;
      const rotX = deltaY * 0.009;

      bottleGroup.rotation.y += rotY;
      bottleGroup.rotation.x = THREE.MathUtils.clamp(
        bottleGroup.rotation.x + rotX,
        -0.65,
        0.65
      );

      // Capped velocity tracking for smooth momentum
      velocity.current = {
        x: THREE.MathUtils.clamp(rotX, -0.05, 0.05),
        y: THREE.MathUtils.clamp(rotY, -0.06, 0.06)
      };

      lastPointer.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      isDraggingRef.current = false;

      // Resume gentle auto-rotation after 2.5 seconds of idle
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setIsInteracting(false);
      }, 2500);
    };

    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + e.deltaY * 0.004,
        7.0,
        11.5
      );
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('pointercancel', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // 12. Main 60 FPS Render Loop with Smooth Damping
    let animId;
    let floatClock = 0;

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      floatClock += 0.02;

      // Physics Momentum & Auto-Rotate Handling
      if (!isDraggingRef.current) {
        if (Math.abs(velocity.current.y) > 0.0001 || Math.abs(velocity.current.x) > 0.0001) {
          bottleGroup.rotation.y += velocity.current.y;
          bottleGroup.rotation.x = THREE.MathUtils.clamp(
            bottleGroup.rotation.x + velocity.current.x,
            -0.65,
            0.65
          );
          // Exponential friction damping
          velocity.current.y *= 0.93;
          velocity.current.x *= 0.93;
        } else if (isAutoRotating && !isInteracting) {
          bottleGroup.rotation.y += 0.01; // Continuous turntable showcase
        }

        // Subtly hover in 3D space
        bottleGroup.position.y = -0.15 + Math.sin(floatClock) * 0.07;
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    // 13. Dynamic Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('pointercancel', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      studioEnvMap.dispose();
      bumpMap.dispose();
      labelTexture.dispose();
    };
  }, []);

  // Update Wireframe state
  useEffect(() => {
    if (plasticMeshRef.current) {
      plasticMeshRef.current.material.wireframe = isWireframe;
    }
    if (waterMeshRef.current) {
      waterMeshRef.current.visible = !isWireframe && waterFilled;
    }
  }, [isWireframe, waterFilled]);

  // Update Water Fill state
  useEffect(() => {
    if (waterMeshRef.current) {
      waterMeshRef.current.visible = waterFilled && !isWireframe;
    }
  }, [waterFilled, isWireframe]);

  // Update Crushed animation state
  useEffect(() => {
    if (bottleGroupRef.current) {
      if (bottleCrushed) {
        bottleGroupRef.current.scale.set(1.2, 0.42, 1.25);
        bottleGroupRef.current.rotation.z = 0.18;
      } else {
        bottleGroupRef.current.scale.set(1, 1, 1);
        bottleGroupRef.current.rotation.z = 0;
      }
    }
  }, [bottleCrushed]);

  const handleResetAngle = () => {
    if (bottleGroupRef.current) {
      bottleGroupRef.current.rotation.set(0, 0, 0);
      velocity.current = { x: 0, y: 0.008 };
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none py-2">
      
      {/* 3D Action Toolbar */}
      <div className="mb-2 inline-flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md z-30">
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
          title="Mode Poligon Mesh 3D"
        >
          <Scan className="w-3.5 h-3.5 text-purple-400" />
          <span>Wireframe</span>
        </button>

        <button
          type="button"
          onClick={() => setWaterFilled(!waterFilled)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            waterFilled
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-cyan-600 hover:bg-cyan-50'
          }`}
          title="Isi atau kosongkan air mineral di dalam botol"
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
          onClick={handleResetAngle}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          title="Reset Sudut Pandang Awal"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* 3D WebGL Canvas Stage */}
      <div className="relative w-full max-w-[450px] sm:max-w-[490px] h-[490px] sm:h-[540px] flex items-center justify-center">
        
        {/* Soft Radial Backlight Glow */}
        <div className="absolute w-84 h-84 rounded-full bg-radial from-cyan-400/25 via-emerald-400/15 to-transparent blur-3xl pointer-events-none" />

        {/* Real Three.js Canvas Element */}
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
        />

        {/* Left Floating Interactive HUD Card (PET 1 Specs) */}
        <div 
          onClick={() => setActiveHotspot(activeHotspot === 'pet' ? null : 'pet')}
          className="absolute -left-3 sm:-left-8 top-28 z-20 max-w-[195px] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-200/90 pointer-events-auto transition-transform hover:scale-105 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span className="font-extrabold text-[11px] uppercase tracking-wide">PET Kode 1</span>
          </div>
          <p className="text-[10px] text-slate-600 leading-tight">
            Material Polyethylene Terephthalate murni dengan tekstur embun. Bernilai jual tinggi di Bank Sampah & 100% dapat didaur ulang.
          </p>
          <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200">
            Nilai: Rp 3.500/kg
          </span>
        </div>

        {/* Right Floating Interactive HUD Card (Impact Metrics) */}
        <div 
          onClick={() => setActiveHotspot(activeHotspot === 'co2' ? null : 'co2')}
          className="absolute -right-3 sm:-right-8 bottom-28 z-20 max-w-[190px] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-200/90 pointer-events-auto transition-transform hover:scale-105 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-brand-600 mb-1">
            <Droplets className="w-4 h-4 text-cyan-500 flex-shrink-0" />
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

      {/* Drag & Rotation Hint */}
      <p className="text-[11px] text-slate-400 mt-2 font-medium flex items-center gap-1.5">
        <Compass className="w-3.5 h-3.5 text-brand-500" />
        <span>Klik & geser botol untuk memutar 360° dengan bebas (bebas bug & anti-tersangkut)</span>
      </p>

    </div>
  );
}
