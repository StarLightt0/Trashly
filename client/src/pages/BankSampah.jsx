import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Search, 
  Filter, 
  Phone, 
  Clock, 
  ExternalLink, 
  Navigation, 
  Sparkles, 
  Recycle, 
  Coins, 
  Award, 
  Compass, 
  CheckCircle2, 
  Building2,
  X,
  Share2,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { dropPointAPI } from '../services/api';

const CITIES = ['all', 'Bandung', 'Jakarta', 'Surabaya'];

const WASTE_CATEGORIES = [
  'all',
  'Plastik',
  'Kardus',
  'Kertas',
  'Minyak Jelantah',
  'E-Waste',
  'Logam',
  'Kaca'
];

// Helper: Haversine straight-line & Urban Road Route Distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;

  // Urban Road Circuity Factor: In urban road networks (Bandung / Jabodetabek),
  // actual driving route distance is ~1.375x the straight-line Haversine distance
  // (e.g. 8.0 km straight line corresponds to ~11.0 km driving route)
  const roadKm = straightKm * 1.375;

  return {
    roadKm: roadKm.toFixed(1),
    straightKm: straightKm.toFixed(1)
  };
}

// Generate rich Google Maps Search or Direct Route URL
function getGoogleMapsDirectUrl(point, userLocation = null) {
  if (userLocation && userLocation.lat && userLocation.lng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${point.latitude},${point.longitude}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}&travelmode=driving`;
}

function getGoogleMapsPlaceUrl(point) {
  const query = encodeURIComponent(`${point.name}, ${point.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export default function BankSampah() {
  const [dropPoints, setDropPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);

  // 1. Fetch Drop Points from Backend
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = {};
        if (selectedCity !== 'all') params.city = selectedCity;
        if (selectedType !== 'all') params.type = selectedType;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const res = await dropPointAPI.getDropPoints(params);
        if (res.data.success) {
          setDropPoints(res.data.data);
          if (res.data.data.length > 0 && !selectedPoint) {
            setSelectedPoint(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Gagal mengambil titik bank sampah:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchData, 150);
    return () => clearTimeout(timer);
  }, [selectedCity, selectedType, searchQuery]);

  // 2. Initialize Leaflet Map once on Mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    const defaultLat = selectedPoint?.latitude || -6.9175;
    const defaultLng = selectedPoint?.longitude || 107.6191;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 12,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size after rendering to ensure full canvas coverage
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 3. Sync Markers with Drop Points and Selected Point
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (!dropPoints || dropPoints.length === 0) return;

    dropPoints.forEach((point) => {
      if (!point.latitude || !point.longitude) return;

      const isSelected = selectedPoint?.id === point.id;

      const customIcon = L.divIcon({
        className: 'trashly-pin',
        html: `
          <div style="
            width: ${isSelected ? '38px' : '30px'};
            height: ${isSelected ? '38px' : '30px'};
            background: ${isSelected ? '#15803d' : '#16a34a'};
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '16px' : '12px'};
            cursor: pointer;
            transition: all 0.2s ease-in-out;
          ">
            ♻️
          </div>
        `,
        iconSize: [isSelected ? 38 : 30, isSelected ? 38 : 30],
        iconAnchor: [isSelected ? 19 : 15, isSelected ? 19 : 15]
      });

      const marker = L.marker([point.latitude, point.longitude], {
        icon: customIcon
      }).addTo(map);

      const navUrl = getGoogleMapsDirectUrl(point, userLocation);
      const placeUrl = getGoogleMapsPlaceUrl(point);
      const distInfo = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, point.latitude, point.longitude) : null;

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 4px; min-width: 230px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${point.city}
            </span>
            ${distInfo ? `<span style="background: #eff6ff; color: #1d4ed8; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">🚗 ~${distInfo.roadKm} km</span>` : ''}
          </div>
          <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 3px; line-height: 1.3;">
            ${point.name}
          </strong>
          <p style="color: #64748b; margin: 0 0 5px 0; font-size: 11px;">${point.address}</p>
          <div style="color: #16a34a; font-weight: bold; margin-bottom: 8px; font-size: 11px;">
            ⏱️ ${point.opening_hours}
          </div>
          <div style="display: flex; gap: 6px;">
            <a href="${navUrl}" target="_blank" rel="noopener noreferrer" style="
              flex: 1;
              display: inline-block;
              text-align: center;
              background: #0f172a;
              color: #ffffff;
              padding: 6px 10px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              font-size: 11px;
            ">
              🧭 Rute Navigasi →
            </a>
            <a href="${placeUrl}" target="_blank" rel="noopener noreferrer" style="
              display: inline-block;
              text-align: center;
              background: #f1f5f9;
              color: #334155;
              padding: 6px 10px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              font-size: 11px;
            ">
              Profil Lokasi ↗
            </a>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedPoint(point);
      });

      markersRef.current[point.id] = marker;
    });

    if (selectedPoint?.latitude && selectedPoint?.longitude) {
      map.flyTo([selectedPoint.latitude, selectedPoint.longitude], 14, {
        duration: 1.0
      });
      if (markersRef.current[selectedPoint.id]) {
        markersRef.current[selectedPoint.id].openPopup();
      }
    }
  }, [dropPoints, selectedPoint]);

  // Handle Card Click -> Focus on Map
  const handleSelectPoint = (point) => {
    setSelectedPoint(point);
    if (mapInstanceRef.current && point.latitude && point.longitude) {
      mapInstanceRef.current.flyTo([point.latitude, point.longitude], 15, {
        duration: 1.0
      });
      if (markersRef.current[point.id]) {
        markersRef.current[point.id].openPopup();
      }
    }
  };

  // Detect Live Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolokasi tidak didukung oleh browser Anda.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocating(false);

        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          map.flyTo([latitude, longitude], 14, { duration: 1.2 });

          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          const userIcon = L.divIcon({
            className: 'user-marker',
            html: `
              <div style="
                width: 32px;
                height: 32px;
                background: #2563eb;
                border: 3px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(37,99,235,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
              ">
                📍
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('<strong style="font-size:12px;">📍 Lokasi Anda Saat Ini</strong>')
            .openPopup();
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocating(false);
        alert('Gagal mendeteksi lokasi otomatis. Pastikan izin GPS aktif di browser Anda.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Copy Address to Clipboard
  const handleCopyAddress = (id, address) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-brand-700 to-teal-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider shadow-sm">
            <Compass className="w-4 h-4 text-emerald-200" />
            Fitur Direktori Bank Sampah & Maps
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Direktori Bank Sampah Terdekat
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Cari titik bank sampah resmi untuk menyetorkan plastik, kardus, kaleng, minyak jelantah, dan e-waste. 
            Tukarkan sampah terpilah Anda menjadi saldo tabungan, sembako, atau tabungan emas!
          </p>
        </div>
      </div>

      {/* Search Bar & City/Category Filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        
        {/* Search input + Geolocation trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama bank sampah, jalan, kelurahan, atau kecamatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locating}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Navigation className={`w-4 h-4 text-emerald-600 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Mencari GPS...' : 'Titik Lokasi Saya'}</span>
          </button>
        </div>

        {/* Filter Badges: City & Waste Category */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          
          {/* City Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-400 font-bold shrink-0">Kota:</span>
            {CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCity === city
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {city === 'all' ? 'Semua Kota' : city}
              </button>
            ))}
          </div>

          {/* Waste Type Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-400 font-bold shrink-0">Material:</span>
            {WASTE_CATEGORIES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === type
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? 'Semua Material' : type}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Split View: Directory Cards List (5 Cols) vs Interactive Map (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Bank Sampah Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>Ditemukan <strong>{dropPoints.length}</strong> Lokasi Bank Sampah</span>
            <span>Status: Aktif Beroperasi</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-5 border border-slate-200 animate-pulse space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : dropPoints.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Lokasi Tidak Ditemukan</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Tidak ada titik bank sampah yang sesuai filter atau kata kunci Anda. Silakan coba reset filter kota atau material.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCity('all');
                  setSelectedType('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[660px] overflow-y-auto pr-1">
              {dropPoints.map((point) => {
                const isSelected = selectedPoint?.id === point.id;
                const acceptedList = Array.isArray(point.accepted_types)
                  ? point.accepted_types
                  : (typeof point.accepted_types === 'string' ? JSON.parse(point.accepted_types || '[]') : []);

                const distanceInfo = userLocation
                  ? calculateDistance(userLocation.lat, userLocation.lng, point.latitude, point.longitude)
                  : null;

                const directNavUrl = getGoogleMapsDirectUrl(point, userLocation);
                const placeInfoUrl = getGoogleMapsPlaceUrl(point);

                return (
                  <div
                    key={point.id}
                    onClick={() => handleSelectPoint(point)}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer space-y-3 relative overflow-hidden ${
                      isSelected
                        ? 'bg-emerald-50/70 border-brand-500 shadow-md ring-2 ring-brand-300'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Header: Name and City Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            {point.city}
                          </span>
                          {distanceInfo && (
                            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200 inline-flex items-center gap-1">
                              🚗 ~{distanceInfo.roadKm} km (Rute Jalan)
                              <span className="text-[9px] font-normal text-blue-600">({distanceInfo.straightKm} km lurus)</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-black text-slate-900 text-base leading-snug pt-0.5">
                          {point.name}
                        </h3>
                      </div>
                      <span className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                        <MapPin className="w-4 h-4 text-brand-600" />
                      </span>
                    </div>

                    {/* Address & Hours */}
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2 text-xs text-slate-500 leading-relaxed">
                        <span>{point.address}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyAddress(point.id, point.address);
                          }}
                          className="text-slate-400 hover:text-slate-700 p-1 shrink-0"
                          title="Salin Alamat"
                        >
                          {copiedId === point.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{point.opening_hours}</span>
                      </div>
                    </div>

                    {/* Accepted Waste Types Tags */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Material Diterima:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {acceptedList.slice(0, 4).map((type, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {type}
                          </span>
                        ))}
                        {acceptedList.length > 4 && (
                          <span className="text-[10px] font-bold text-slate-400 self-center">
                            +{acceptedList.length - 4} lainnya
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Incentive Reward Note */}
                    {point.incentive && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span><strong>Imbalan:</strong> {point.incentive}</span>
                      </div>
                    )}

                    {/* Action Links */}
                    <div className="pt-2 flex items-center gap-2 text-xs font-bold">
                      {point.contact_phone && (
                        <a
                          href={`tel:${point.contact_phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          <Phone className="w-3 h-3 text-brand-600" />
                          <span>Hubungi</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPoint(point);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                      >
                        <Compass className="w-3 h-3" />
                        <span>Fokuskan Peta</span>
                      </button>

                      <a
                        href={directNavUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white transition-colors ml-auto shadow-sm"
                        title="Buka rute live Google Maps"
                      >
                        <span>Rute Navigasi</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <a
                        href={placeInfoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        title="Lihat profil detail tempat di Google Maps"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-600" />
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Column: Leaflet Interactive Map Canvas (7 Cols) */}
        <div className="lg:col-span-7 sticky top-24 space-y-4">
          
          <div className="bg-white rounded-3xl p-3 border border-slate-200/90 shadow-md relative overflow-hidden">
            
            {/* The Actual Leaflet Map Canvas */}
            <div
              ref={mapContainerRef}
              className="w-full h-[540px] sm:h-[620px] rounded-2xl z-10 overflow-hidden bg-slate-100 shadow-inner"
              style={{ minHeight: '520px' }}
            />

            {/* Floating Map Legend Indicator */}
            <div className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 shadow-md flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{dropPoints.length} Titik Bank Sampah Terdata</span>
            </div>

            {/* Hint pill at bottom right */}
            <div className="absolute bottom-6 right-6 z-20 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-md pointer-events-none">
              Klik pin ♻️ pada peta untuk melihat info loket
            </div>

          </div>

          {/* Environmental Mission Card */}
          <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <div className="font-extrabold flex items-center gap-1.5">
              <Recycle className="w-4 h-4 text-emerald-600" />
              Mengapa Menyetorkan Sampah ke Bank Sampah?
            </div>
            <p className="leading-relaxed text-emerald-800">
              Sampah anorganik yang Anda setorkan ke Bank Sampah resmi terjamin masuk ke siklus daur ulang industri nasional dan tidak berakhir di TPA Sarimukti atau mencemari sungai. Anda juga mendapatkan nilai ekonomi tunai langsung atau konversi tabungan emas!
            </p>
          </div>

        </div>

      </div>

      {/* 4-Step Guide Section */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-900">
            Cara Menabung di Bank Sampah
          </h2>
          <p className="text-xs text-slate-500">
            Panduan 4 langkah praktis mengubah sampah rumah tangga menjadi tabungan nyata.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-black text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Pilah dari Rumah</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pisahkan sampah anorganik (botol plastik, kardus, kaleng, kertas arsip) dari sampah basah dapur.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-black text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Bersihkan & Keringkan</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bilas botol plastik dari sisa cairan manis dan pipihkan kardus agar bobot timbangan lebih murni.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-black text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Setor ke Bank Sampah</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bawa sampah ke titik bank sampah terdekat yang ada di peta untuk ditimbang oleh petugas loket.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-black text-sm flex items-center justify-center">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Cairkan Imbalan</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dapatkan buku tabungan lingkungan, uang tunai, saldo e-wallet, atau cetak emas batangan!
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

