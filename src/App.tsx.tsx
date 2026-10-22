import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Heart,
  Sparkles,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Wind,
  Droplets,
  MapPin,
  Calendar,
  Settings,
  RefreshCw,
  Edit3,
  Check,
  X,
  Send,
  Navigation,
  Sliders,
  Plane,
  Compass,
  Key,
  Wifi,
  WifiOff,
  Thermometer,
  Clock,
  ArrowRightLeft,
  Radio,
  Zap,
  BellRing,
  Users,
  Activity,
  MessageSquareHeart
} from 'lucide-react';

const SUPABASE_CDN_URL =
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

function loadSupabaseCreateClient() {
  return new Promise((resolve, reject) => {
    if (
      typeof window !== 'undefined' &&
      window.supabase &&
      typeof window.supabase.createClient === 'function'
    ) {
      resolve(window.supabase.createClient);
      return;
    }

    if (typeof document === 'undefined') {
      reject(new Error('Browser environment required'));
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${SUPABASE_CDN_URL}"]`
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.supabase?.createClient) {
          resolve(window.supabase.createClient);
        } else {
          reject(new Error('Supabase SDK gagal diinisialisasi'));
        }
      });
      existingScript.addEventListener('error', () =>
        reject(new Error('Gagal memuat script Supabase dari CDN'))
      );
      return;
    }

    const script = document.createElement('script');
    script.src = SUPABASE_CDN_URL;
    script.async = true;
    script.onload = () => {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        resolve(window.supabase.createClient);
      } else {
        reject(new Error('Supabase SDK tidak ditemukan di window'));
      }
    };
    script.onerror = () =>
      reject(new Error('Gagal mengunduh Supabase SDK dari CDN'));
    document.head.appendChild(script);
  });
}

const CITY_PRESETS = [
  {
    name: 'Malang, ID',
    lat: -7.9666,
    lon: 112.6326,
    tzOffset: 7,
    weather: 'rainy',
    temp: 24,
    feelsLike: 25,
    humidity: 84,
    windSpeed: 8
  },
  {
    name: 'Jakarta, ID',
    lat: -6.2088,
    lon: 106.8456,
    tzOffset: 7,
    weather: 'sunny',
    temp: 32,
    feelsLike: 35,
    humidity: 70,
    windSpeed: 12
  },
  {
    name: 'Bandung, ID',
    lat: -6.9175,
    lon: 107.6191,
    tzOffset: 7,
    weather: 'cloudy',
    temp: 23,
    feelsLike: 23,
    humidity: 78,
    windSpeed: 9
  },
  {
    name: 'Bali, ID',
    lat: -8.4095,
    lon: 115.1889,
    tzOffset: 8,
    weather: 'sunny',
    temp: 30,
    feelsLike: 33,
    humidity: 74,
    windSpeed: 15
  },
  {
    name: 'Tokyo, JP',
    lat: 35.6762,
    lon: 139.6503,
    tzOffset: 9,
    weather: 'cloudy',
    temp: 16,
    feelsLike: 15,
    humidity: 60,
    windSpeed: 14
  },
  {
    name: 'Seoul, KR',
    lat: 37.5665,
    lon: 126.978,
    tzOffset: 9,
    weather: 'sunny',
    temp: 14,
    feelsLike: 13,
    humidity: 55,
    windSpeed: 11
  },
  {
    name: 'Singapore, SG',
    lat: 1.3521,
    lon: 103.8198,
    tzOffset: 8,
    weather: 'stormy',
    temp: 29,
    feelsLike: 33,
    humidity: 82,
    windSpeed: 13
  },
  {
    name: 'Sydney, AU',
    lat: -33.8688,
    lon: 151.2093,
    tzOffset: 10,
    weather: 'windy',
    temp: 21,
    feelsLike: 20,
    humidity: 64,
    windSpeed: 24
  },
  {
    name: 'London, UK',
    lat: 51.5072,
    lon: -0.1276,
    tzOffset: 1,
    weather: 'rainy',
    temp: 13,
    feelsLike: 11,
    humidity: 86,
    windSpeed: 18
  },
  {
    name: 'New York, US',
    lat: 40.7128,
    lon: -74.006,
    tzOffset: -4,
    weather: 'sunny',
    temp: 19,
    feelsLike: 18,
    humidity: 58,
    windSpeed: 16
  }
];

const WEATHER_CATALOG = {
  sunny: {
    label: 'Cerah Berkilau',
    accent: 'from-amber-400/25 to-orange-500/10',
    iconColor: 'text-amber-300'
  },
  cloudy: {
    label: 'Berawan Teduh',
    accent: 'from-slate-300/25 to-blue-400/10',
    iconColor: 'text-slate-200'
  },
  rainy: {
    label: 'Hujan Rintik',
    accent: 'from-sky-400/25 to-indigo-500/15',
    iconColor: 'text-sky-300'
  },
  stormy: {
    label: 'Hujan Petir',
    accent: 'from-purple-500/25 to-indigo-600/15',
    iconColor: 'text-purple-300'
  },
  snowy: {
    label: 'Bersalju Dingin',
    accent: 'from-cyan-200/25 to-blue-300/15',
    iconColor: 'text-cyan-200'
  },
  windy: {
    label: 'Semilir Berangin',
    accent: 'from-teal-300/25 to-emerald-500/10',
    iconColor: 'text-teal-200'
  }
};

const WALLPAPER_THEMES = [
  {
    id: 'aurora_night',
    name: 'Aurora Borealis',
    bgClass: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-rose-950',
    orb1: 'bg-fuchsia-500/30',
    orb2: 'bg-cyan-400/25',
    orb3: 'bg-rose-500/30'
  },
  {
    id: 'sunset_bliss',
    name: 'Senja Romantis',
    bgClass: 'bg-gradient-to-br from-rose-950 via-purple-950 to-amber-950',
    orb1: 'bg-orange-400/30',
    orb2: 'bg-pink-500/30',
    orb3: 'bg-purple-500/25'
  },
  {
    id: 'midnight_ocean',
    name: 'Samudra Malam',
    bgClass: 'bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-950',
    orb1: 'bg-sky-400/25',
    orb2: 'bg-teal-400/25',
    orb3: 'bg-indigo-500/30'
  },
  {
    id: 'sakura_dream',
    name: 'Mimpi Sakura',
    bgClass: 'bg-gradient-to-br from-pink-950 via-fuchsia-950 to-slate-950',
    orb1: 'bg-pink-400/35',
    orb2: 'bg-rose-300/25',
    orb3: 'bg-violet-500/30'
  }
];

const MOOD_PRESETS = [
  { emoji: '🥺', text: 'Lagi kangen kamu banget' },
  { emoji: '💻', text: 'Fokus kerja dulu ya' },
  { emoji: '☕', text: 'Ngopi santai sore' },
  { emoji: '🎧', text: 'Dengerin playlist kita' },
  { emoji: '🍜', text: 'Lagi makan enak!' },
  { emoji: '😴', text: 'Ngantuk berat, siap tidur' },
  { emoji: '🌧️', text: 'Menikmati suara hujan' },
  { emoji: '✈️', text: 'Nggak sabar nunggu ketemu!' }
];

const PING_LOVE_PRESETS = [
  { id: 'kangen', emoji: '💕', text: 'Kangen banget!' },
  { id: 'peluk', emoji: '🤗', text: 'Peluk jauh hangat!' },
  { id: 'semangat', emoji: '✨', text: 'Semangat hari ini ya!' },
  { id: 'mikirin', emoji: '💭', text: 'Lagi mikirin kamu terus' },
  { id: 'cium', emoji: '😘', text: 'Cium jauh buat kamu!' },
  { id: 'tidur', emoji: '🌙', text: 'Jangan lupa istirahat ya' }
];

const HEART_PARTICLE_STYLES = [
  { color: 'text-rose-400 fill-rose-400', glow: 'rgba(251,113,133,0.85)' },
  { color: 'text-pink-400 fill-pink-400', glow: 'rgba(244,114,182,0.85)' },
  { color: 'text-fuchsia-400 fill-fuchsia-400', glow: 'rgba(232,121,249,0.85)' },
  { color: 'text-amber-300 fill-amber-300', glow: 'rgba(252,211,77,0.85)' },
  { color: 'text-red-400 fill-red-400', glow: 'rgba(248,113,113,0.85)' }
];

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Menghitung jarak garis lurus di permukaan bumi menggunakan Haversine Formula
 * d = 2 * R * arcsin(sqrt(sin^2(dLat/2) + cos(lat1)*cos(lat2)*sin^2(dLon/2)))
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  if (
    Number.isNaN(nLat1) ||
    Number.isNaN(nLon1) ||
    Number.isNaN(nLat2) ||
    Number.isNaN(nLon2)
  ) {
    return 0;
  }

  const EARTH_RADIUS_KM = 6371;
  const dLat = toRadians(nLat2 - nLat1);
  const dLon = toRadians(nLon2 - nLon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(nLat1)) *
      Math.cos(toRadians(nLat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function estimateTravelTime(distanceKm) {
  if (distanceKm < 5) {
    return { mode: 'Dekat Sekali', label: '~10 menit jalan/berkendara' };
  }
  if (distanceKm < 120) {
    const mins = Math.max(15, Math.round((distanceKm / 50) * 60));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return {
      mode: 'Perjalanan Darat',
      label: h > 0 ? `~${h}j ${m}m darat` : `~${m} menit darat`
    };
  }
  const flightHours = distanceKm / 800 + 0.6;
  const hours = Math.floor(flightHours);
  const minutes = Math.round((flightHours - hours) * 60);
  return {
    mode: 'Penerbangan',
    label: `~${hours}j ${minutes}m terbang`
  };
}

function formatCoordinateLabel(lat, lon) {
  const nLat = Number(lat) || 0;
  const nLon = Number(lon) || 0;
  const latDir = nLat >= 0 ? 'LU' : 'LS';
  const lonDir = nLon >= 0 ? 'BT' : 'BB';
  return `${Math.abs(nLat).toFixed(2)}°${latDir}, ${Math.abs(nLon).toFixed(2)}°${lonDir}`;
}

function toLocalIsoString(dateObj) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(
    dateObj.getDate()
  )}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
}

function getCityDate(now, utcOffsetHours) {
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcTime + utcOffsetHours * 3600000);
}

function getTimeOfDayMeta(hour) {
  if (hour >= 5 && hour < 11) {
    return {
      period: 'Pagi',
      isDay: true,
      badgeBg: 'bg-amber-400/20 text-amber-200 border-amber-300/30'
    };
  }
  if (hour >= 11 && hour < 15) {
    return {
      period: 'Siang',
      isDay: true,
      badgeBg: 'bg-sky-400/20 text-sky-200 border-sky-300/30'
    };
  }
  if (hour >= 15 && hour < 18) {
    return {
      period: 'Senja',
      isDay: true,
      badgeBg: 'bg-orange-400/20 text-orange-200 border-orange-300/30'
    };
  }
  return {
    period: 'Malam',
    isDay: false,
    badgeBg: 'bg-indigo-400/20 text-indigo-200 border-indigo-300/30'
  };
}

function mapOpenWeatherToInternal(weatherId = 800, windSpeedMs = 0) {
  if (weatherId >= 200 && weatherId < 300) return 'stormy';
  if (weatherId >= 300 && weatherId < 600) return 'rainy';
  if (weatherId >= 600 && weatherId < 700) return 'snowy';
  if (weatherId >= 700 && weatherId < 800) return 'windy';
  if (weatherId === 800) {
    return windSpeedMs > 7.5 ? 'windy' : 'sunny';
  }
  return 'cloudy';
}

function simulateSmartWeather(lat, lon, tzOffset) {
  const cityNow = getCityDate(new Date(), tzOffset);
  const hour = cityNow.getHours();
  const absLat = Math.abs(Number(lat) || 0);

  let baseTemp = 30 - absLat * 0.42;
  const diurnalDelta = Math.sin(((hour - 6) / 24) * 2 * Math.PI) * 3.5;
  const temp = Math.round(baseTemp + diurnalDelta);
  const feelsLike = Math.round(temp + (absLat < 15 ? 2 : -1));
  const humidity = Math.min(
    94,
    Math.max(48, Math.round(78 - absLat * 0.35 + (hour < 6 ? 8 : 0)))
  );
  const windSpeed = Math.max(
    5,
    Math.round(9 + ((Math.abs(Math.round(lon)) + hour) % 12))
  );

  let weather = 'sunny';
  if (absLat > 55 && temp <= 2) {
    weather = 'snowy';
  } else if (absLat < 12 && hour >= 14 && hour <= 19) {
    weather = 'rainy';
  } else if (windSpeed >= 19) {
    weather = 'windy';
  } else if (hour % 3 === 0) {
    weather = 'cloudy';
  }

  return {
    weather,
    temp,
    feelsLike,
    humidity,
    windSpeed,
    weatherDesc: WEATHER_CATALOG[weather].label,
    source: 'simulation'
  };
}

function WeatherGlyph({ type, isDay, className = 'w-8 h-8' }) {
  switch (type) {
    case 'sunny':
      return isDay ? (
        <Sun
          className={`${className} text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.6)]`}
        />
      ) : (
        <Moon
          className={`${className} text-indigo-200 drop-shadow-[0_0_12px_rgba(199,210,254,0.6)]`}
        />
      );
    case 'cloudy':
      return (
        <Cloud
          className={`${className} text-slate-200 drop-shadow-[0_0_10px_rgba(226,232,240,0.4)]`}
        />
      );
    case 'rainy':
      return (
        <CloudRain
          className={`${className} text-sky-300 drop-shadow-[0_0_12px_rgba(125,211,252,0.5)]`}
        />
      );
    case 'stormy':
      return (
        <CloudLightning
          className={`${className} text-purple-300 drop-shadow-[0_0_12px_rgba(216,180,254,0.6)]`}
        />
      );
    case 'snowy':
      return (
        <Snowflake
          className={`${className} text-cyan-200 drop-shadow-[0_0_12px_rgba(165,243,252,0.6)]`}
        />
      );
    case 'windy':
      return <Wind className={`${className} text-teal-200`} />;
    default:
      return <Sun className={`${className} text-amber-300`} />;
  }
}

function useAnimatedCounter(targetValue, duration = 1500, replayKey = 0) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrameId;
    const startTime = performance.now();
    const safeTarget = Math.max(0, Math.floor(targetValue));

    const updateFrame = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.round(easedProgress * safeTarget));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateFrame);
      } else {
        setDisplayValue(safeTarget);
      }
    };

    animationFrameId = requestAnimationFrame(updateFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, duration, replayKey]);

  return displayValue;
}

function LocationGlassCard({
  roleLabel,
  isCurrentDeviceRole,
  isPulsing,
  lastPingReceived,
  person,
  otherPerson,
  now,
  use24Hour,
  onUpdatePerson,
  onSendHeart,
  onRefreshSingleWeather,
  isFetchingWeather
}) {
  const [showWeatherMenu, setShowWeatherMenu] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showMoodEditor, setShowMoodEditor] = useState(false);
  const [customMoodInput, setCustomMoodInput] = useState(person.moodText);

  const cityDate = useMemo(
    () => getCityDate(now, person.tzOffset),
    [now, person.tzOffset]
  );

  const hour = cityDate.getHours();
  const minute = cityDate.getMinutes();
  const second = cityDate.getSeconds();
  const timeMeta = getTimeOfDayMeta(hour);
  const weatherInfo = WEATHER_CATALOG[person.weather] || WEATHER_CATALOG.sunny;

  const formattedTime = useMemo(() => {
    const pad = (n) => String(n).padStart(2, '0');
    if (use24Hour) {
      return {
        main: `${pad(hour)}:${pad(minute)}`,
        sec: pad(second),
        ampm: ''
      };
    }
    const period = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return {
      main: `${pad(h12)}:${pad(minute)}`,
      sec: pad(second),
      ampm: period
    };
  }, [hour, minute, second, use24Hour]);

  const formattedDate = useMemo(() => {
    return cityDate.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }, [cityDate]);

  const tzDiff = person.tzOffset - otherPerson.tzOffset;
  const tzDiffLabel =
    tzDiff === 0
      ? 'Zona waktu sama'
      : tzDiff > 0
      ? `+${tzDiff} jam dari ${otherPerson.nickname}`
      : `${tzDiff} jam dari ${otherPerson.nickname}`;

  const handleSelectCityPreset = (preset) => {
    onUpdatePerson(
      {
        ...person,
        cityName: preset.name,
        lat: preset.lat,
        lon: preset.lon,
        tzOffset: preset.tzOffset,
        weather: preset.weather,
        temp: preset.temp,
        feelsLike: preset.feelsLike,
        humidity: preset.humidity,
        windSpeed: preset.windSpeed,
        weatherDesc: WEATHER_CATALOG[preset.weather]?.label || 'Cerah'
      },
      true
    );
    setShowCityMenu(false);
  };

  const handleSaveCustomMood = (e) => {
    e.preventDefault();
    if (customMoodInput.trim()) {
      onUpdatePerson({
        ...person,
        moodText: customMoodInput.trim()
      });
    }
    setShowMoodEditor(false);
  };

  return (
    <div
      className={`relative group rounded-3xl bg-white/[0.08] hover:bg-white/[0.11] backdrop-blur-2xl border transition-all duration-500 flex flex-col justify-between overflow-visible p-5 sm:p-6 ${
        isPulsing
          ? 'border-rose-400/90 shadow-[0_0_55px_rgba(244,63,94,0.55)] scale-[1.015] ring-2 ring-rose-300/60'
          : 'border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
      }`}
    >
      {/* Efek Gelombang Cincin saat menerima atau mengirim Ping Love */}
      {isPulsing && (
        <div className="pointer-events-none absolute -inset-1 rounded-[1.7rem] border-2 border-rose-400/70 animate-ping opacity-40" />
      )}

      {/* Glow Ambient halus di sudut kartu sesuai cuaca */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br ${weatherInfo.accent} opacity-60 transition-all duration-700`}
      />

      {/* Efek titik-titik hujan halus jika cuaca hujan/petir */}
      {(person.weather === 'rainy' || person.weather === 'stormy') && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl opacity-25">
          <div className="absolute top-2 left-1/4 w-0.5 h-3 bg-blue-200 rounded-full animate-bounce" />
          <div className="absolute top-8 left-2/3 w-0.5 h-4 bg-blue-200 rounded-full animate-pulse" />
          <div className="absolute bottom-12 left-1/3 w-0.5 h-3 bg-blue-200 rounded-full animate-bounce" />
        </div>
      )}

      {/* Bagian Atas: Label Peran ("Aku" / "Dia"), Kota, Koordinat & Tombol Ping */}
      <div className="relative z-20 flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/15 text-white/90 border border-white/20 shadow-sm">
              {roleLabel}
            </span>
            {isCurrentDeviceRole && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/30 text-rose-100 border border-rose-300/35 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
                Layar Aktif
              </span>
            )}
            <span className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-1.5">
              <span>{person.avatar}</span>
              <span>{person.nickname}</span>
            </span>
          </div>

          {/* Baris Kota & Koordinat Lat/Lon */}
          <div className="relative mt-1.5 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setShowCityMenu((prev) => !prev);
                setShowWeatherMenu(false);
              }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/85 hover:text-white transition-colors py-0.5 px-2 -ml-2 rounded-lg hover:bg-white/10"
              title="Klik untuk ganti lokasi kota & koordinat"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span className="font-medium underline decoration-white/30 decoration-dotted underline-offset-4">
                {person.cityName}
              </span>
            </button>

            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/25 border border-white/10 text-[10px] font-mono text-cyan-200/90"
              title="Koordinat Latitude & Longitude untuk perhitungan Haversine"
            >
              <Compass className="w-2.5 h-2.5 text-cyan-300" />
              {formatCoordinateLabel(person.lat, person.lon)}
            </span>

            {/* Popover Pemilih Kota & Koordinat Cepat */}
            {showCityMenu && (
              <div className="absolute left-0 top-8 z-40 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/25 p-2 shadow-2xl text-xs">
                <div className="flex items-center justify-between px-2 py-1 text-white/60 border-b border-white/10 mb-1">
                  <span>Pilih Kota & Koordinat GPS</span>
                  <button
                    type="button"
                    onClick={() => setShowCityMenu(false)}
                    className="text-white/50 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
                  {CITY_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectCityPreset(preset)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/15 text-left text-white/90 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-[10px] font-mono text-white/50">
                          {preset.lat.toFixed(2)}, {preset.lon.toFixed(2)}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-300">
                        UTC{preset.tzOffset >= 0 ? `+${preset.tzOffset}` : preset.tzOffset}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Badge Siang/Malam + Tombol Ping Love Instan dari Kartu */}
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${timeMeta.badgeBg}`}
          >
            {timeMeta.isDay ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
            <span>{timeMeta.period}</span>
          </span>

          <button
            type="button"
            onClick={onSendHeart}
            title={`Ping Love instan dari ${person.nickname} ke ${otherPerson.nickname}`}
            className="relative px-3 py-2 rounded-2xl bg-gradient-to-br from-rose-500/30 to-pink-500/20 hover:from-rose-500/50 hover:to-pink-500/40 border border-rose-300/35 hover:border-rose-200/60 text-rose-100 hover:text-white transition-all active:scale-90 shadow-md group/heart flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4 fill-rose-400 text-rose-300 group-hover/heart:scale-125 transition-transform" />
            <span className="text-[11px] font-semibold tracking-wide">Ping</span>
          </button>
        </div>
      </div>

      {/* Badge Riwayat Ping Terakhir di Kartu */}
      {lastPingReceived && (
        <div className="relative z-20 mt-3 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-300/30 flex items-center justify-between gap-2 text-[11px] text-rose-100">
          <div className="flex items-center gap-1.5 truncate">
            <span>{lastPingReceived.emoji}</span>
            <span className="font-medium truncate">
              Ping dari {lastPingReceived.senderName}: "{lastPingReceived.text}"
            </span>
          </div>
          <span className="font-mono text-[10px] text-rose-200/80 shrink-0">
            {lastPingReceived.timeLabel}
          </span>
        </div>
      )}

      {/* Bagian Tengah: Jam Lokal Real-Time & Cuaca OpenWeatherMap */}
      <div className="relative z-20 my-5 flex items-center justify-between gap-3">
        {/* Jam Digital Besar */}
        <div>
          <div className="flex items-baseline gap-1 font-mono tracking-tight text-white">
            <span className="text-4xl sm:text-5xl font-bold drop-shadow-sm">
              {formattedTime.main}
            </span>
            <span className="text-base sm:text-lg font-medium text-white/60">
              :{formattedTime.sec}
            </span>
            {formattedTime.ampm && (
              <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-white/15 text-white/80">
                {formattedTime.ampm}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
            <Calendar className="w-3.5 h-3.5 text-white/50" />
            <span>{formattedDate}</span>
            <span className="text-white/40">•</span>
            <span className="font-mono text-[11px] text-white/60">
              UTC{person.tzOffset >= 0 ? `+${person.tzOffset}` : person.tzOffset}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-white/55">{tzDiffLabel}</div>
        </div>

        {/* Kartu Mini Cuaca */}
        <div className="relative">
          <div className="flex flex-col items-end p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRefreshSingleWeather}
                title="Sinkronkan ulang cuaca lokasi ini"
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isFetchingWeather ? 'animate-spin text-cyan-300' : ''}`}
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowWeatherMenu((prev) => !prev);
                  setShowCityMenu(false);
                }}
                className="flex items-center gap-2"
                title="Klik untuk ubah cuaca manual atau lihat detail"
              >
                <WeatherGlyph
                  type={person.weather}
                  isDay={timeMeta.isDay}
                  className="w-7 h-7 sm:w-8 sm:h-8"
                />
                <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {person.temp}°C
                </span>
              </button>
            </div>

            <span className="mt-1 text-[11px] text-white/85 font-medium capitalize">
              {person.weatherDesc || weatherInfo.label}
            </span>

            <div className="mt-1 flex items-center gap-2 text-[10px] text-white/65">
              <span
                className="inline-flex items-center gap-0.5"
                title="Suhu terasa (Feels Like)"
              >
                <Thermometer className="w-3 h-3 text-rose-300" />
                {person.feelsLike ?? person.temp}°
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Droplets className="w-3 h-3 text-sky-300" />
                {person.humidity}%
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Wind className="w-3 h-3 text-teal-200" />
                {person.windSpeed}km/j
              </span>
            </div>
          </div>

          {/* Popover Override Cuaca Manual */}
          {showWeatherMenu && (
            <div className="absolute right-0 top-28 z-40 w-56 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/25 p-3 shadow-2xl text-xs space-y-2.5">
              <div className="flex items-center justify-between text-white/70 font-medium">
                <span>Ubah Cuaca Manual</span>
                <button
                  type="button"
                  onClick={() => setShowWeatherMenu(false)}
                  className="text-white/50 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(WEATHER_CATALOG).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onUpdatePerson({
                        ...person,
                        weather: key,
                        weatherDesc: item.label
                      });
                      setShowWeatherMenu(false);
                    }}
                    className={`px-2 py-1.5 rounded-xl text-left transition-all flex items-center gap-1.5 ${
                      person.weather === key
                        ? 'bg-white/25 text-white font-semibold border border-white/30'
                        : 'hover:bg-white/10 text-white/75'
                    }`}
                  >
                    <WeatherGlyph
                      type={key}
                      isDay={timeMeta.isDay}
                      className="w-4 h-4 shrink-0"
                    />
                    <span className="truncate text-[11px]">
                      {item.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
              <div className="pt-1 border-t border-white/10">
                <div className="flex justify-between text-[11px] text-white/70 mb-1">
                  <span>Suhu Udara</span>
                  <span className="font-mono font-semibold text-white">
                    {person.temp}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="42"
                  value={person.temp}
                  onChange={(e) =>
                    onUpdatePerson({
                      ...person,
                      temp: Number(e.target.value),
                      feelsLike: Number(e.target.value) + 1
                    })
                  }
                  className="w-full accent-rose-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bagian Bawah: Status / Mood Pasangan */}
      <div className="relative z-20 pt-3 border-t border-white/15 flex items-center justify-between gap-2 text-xs">
        {!showMoodEditor ? (
          <>
            <button
              type="button"
              onClick={() => {
                setCustomMoodInput(person.moodText);
                setShowMoodEditor(true);
              }}
              className="flex items-center gap-2 text-left text-white/85 hover:text-white group/mood truncate py-1 px-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors max-w-full"
              title="Klik untuk mengganti status mood"
            >
              <span className="text-base shrink-0">{person.moodEmoji}</span>
              <span className="truncate italic text-white/85">
                "{person.moodText}"
              </span>
              <Edit3 className="w-3 h-3 text-white/40 opacity-0 group-hover/mood:opacity-100 transition-opacity shrink-0" />
            </button>
          </>
        ) : (
          <div className="w-full space-y-2 bg-slate-900/80 p-2.5 rounded-2xl border border-white/20">
            <div className="flex flex-wrap gap-1">
              {MOOD_PRESETS.map((preset) => (
                <button
                  key={preset.text}
                  type="button"
                  onClick={() => {
                    onUpdatePerson({
                      ...person,
                      moodEmoji: preset.emoji,
                      moodText: preset.text
                    });
                    setShowMoodEditor(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-white/90 flex items-center gap-1 transition-colors"
                >
                  <span>{preset.emoji}</span>
                  <span className="truncate max-w-[115px]">{preset.text}</span>
                </button>
              ))}
            </div>
            <form
              onSubmit={handleSaveCustomMood}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={customMoodInput}
                onChange={(e) => setCustomMoodInput(e.target.value)}
                placeholder="Tulis status singkat..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-2.5 py-1 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-300"
              />
              <button
                type="submit"
                className="p-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowMoodEditor(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [now, setNow] = useState(() => new Date());

  // State Tanggal Jadian (Count-Up)
  const [anniversaryDate, setAnniversaryDate] = useState('2024-02-14T19:00');
  const [relationshipTitle, setRelationshipTitle] = useState(
    'Perjalanan Cerita Kita'
  );

  // State Countdown Hari Menuju Pertemuan Berikutnya (Reunion Countdown)
  const [meetupDate, setMeetupDate] = useState(() => {
    const future = new Date(Date.now() + 18 * 86400000 + 5 * 3600000);
    return toLocalIsoString(future);
  });
  const [meetupStartDate, setMeetupStartDate] = useState(() => {
    const past = new Date(Date.now() - 12 * 86400000);
    return toLocalIsoString(past);
  });
  const [meetupTitle, setMeetupTitle] = useState(
    'Ketemu & Liburan Bareng di Malang'
  );
  const [meetupLocationNote, setMeetupLocationNote] = useState(
    'Stasiun Malang Kota Baru • 15:30 WIB'
  );

  // State Integrasi OpenWeatherMap API
  const [owmApiKey, setOwmApiKey] = useState('');
  const [autoSyncTimezone, setAutoSyncTimezone] = useState(true);
  const [weatherApiStatus, setWeatherApiStatus] = useState({
    mode: 'simulation',
    lastSync: null,
    message: 'Mode Simulasi Cerdas (Masukkan API Key untuk data live OWM)'
  });
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  // State Integrasi Supabase Realtime ('Ping Love')
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [roomCode, setRoomCode] = useState('malang-tokyo-1402');
  const [activeRole, setActiveRole] = useState('me');
  const [selectedPingPreset, setSelectedPingPreset] = useState(
    PING_LOVE_PRESETS[0]
  );
  const [realtimeStatus, setRealtimeStatus] = useState({
    mode: 'broadcast_fallback',
    label: 'Multi-Tab Realtime Ready',
    detail:
      'Aktif via BroadcastChannel lokal (Isi Supabase URL & Key untuk lintas perangkat global)'
  });

  const [lovePingCount, setLovePingCount] = useState(14);
  const [pingHistory, setPingHistory] = useState([
    {
      id: 'init-1',
      senderRole: 'partner',
      senderName: 'Dia (Raka)',
      receiverName: 'Aku (Nadia)',
      emoji: '💕',
      text: 'Kangen banget!',
      timeLabel: 'Baru saja',
      via: 'Realtime Channel'
    }
  ]);
  const [cardPulseState, setCardPulseState] = useState({
    me: false,
    partner: false
  });

  const supabaseChannelRef = useRef(null);
  const supabaseClientRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const processedPingIdsRef = useRef(new Set());

  const [countTrigger, setCountTrigger] = useState(0);
  const [themeId, setThemeId] = useState('aurora_night');
  const [use24Hour, setUse24Hour] = useState(true);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [floatingHearts, setFloatingHearts] = useState([]);
  const [pokeNotification, setPokeNotification] = useState(null);

  const [mePerson, setMePerson] = useState({
    nickname: 'Nadia',
    avatar: '🌸',
    cityName: 'Malang, ID',
    lat: -7.9666,
    lon: 112.6326,
    tzOffset: 7,
    weather: 'rainy',
    weatherDesc: 'Hujan Rintik',
    temp: 24,
    feelsLike: 25,
    humidity: 84,
    windSpeed: 8,
    moodEmoji: '☕',
    moodText: 'Ngopi sambil dengerin hujan'
  });

  const [partnerPerson, setPartnerPerson] = useState({
    nickname: 'Raka',
    avatar: '🚀',
    cityName: 'Tokyo, JP',
    lat: 35.6762,
    lon: 139.6503,
    tzOffset: 9,
    weather: 'cloudy',
    weatherDesc: 'Berawan Teduh',
    temp: 16,
    feelsLike: 15,
    humidity: 60,
    windSpeed: 14,
    moodEmoji: '🥺',
    moodText: 'Lagi kangen kamu banget'
  });

  // Interval 1 detik untuk jam lokal, count-up jadian, dan countdown pertemuan
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeatherForLocation = useCallback(
    async (personObj, apiKeyToUse) => {
      const cleanKey = (apiKeyToUse ?? owmApiKey).trim();
      const lat = Number(personObj.lat) || 0;
      const lon = Number(personObj.lon) || 0;

      if (!cleanKey) {
        const sim = simulateSmartWeather(lat, lon, personObj.tzOffset);
        return {
          ...personObj,
          weather: sim.weather,
          weatherDesc: sim.weatherDesc,
          temp: sim.temp,
          feelsLike: sim.feelsLike,
          humidity: sim.humidity,
          windSpeed: sim.windSpeed
        };
      }

      const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=id&appid=${encodeURIComponent(
        cleanKey
      )}`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();

      const weatherConditionId = data?.weather?.[0]?.id ?? 800;
      const windSpeedMs = data?.wind?.speed ?? 0;
      const mappedWeather = mapOpenWeatherToInternal(
        weatherConditionId,
        windSpeedMs
      );
      const rawDesc =
        data?.weather?.[0]?.description || WEATHER_CATALOG[mappedWeather].label;

      const apiTzOffsetHours =
        typeof data?.timezone === 'number'
          ? Math.round((data.timezone / 3600) * 2) / 2
          : personObj.tzOffset;

      return {
        ...personObj,
        cityName: data?.name
          ? `${data.name}${data?.sys?.country ? `, ${data.sys.country}` : ''}`
          : personObj.cityName,
        tzOffset: autoSyncTimezone ? apiTzOffsetHours : personObj.tzOffset,
        weather: mappedWeather,
        weatherDesc: rawDesc,
        temp: Math.round(data?.main?.temp ?? personObj.temp),
        feelsLike: Math.round(data?.main?.feels_like ?? personObj.temp),
        humidity: Math.round(data?.main?.humidity ?? personObj.humidity),
        windSpeed: Math.max(1, Math.round(windSpeedMs * 3.6))
      };
    },
    [owmApiKey, autoSyncTimezone]
  );

  const syncAllWeather = useCallback(
    async (overrideKey) => {
      const activeKey = (overrideKey ?? owmApiKey).trim();
      setIsFetchingWeather(true);

      try {
        const [updatedMe, updatedPartner] = await Promise.all([
          fetchWeatherForLocation(mePerson, activeKey),
          fetchWeatherForLocation(partnerPerson, activeKey)
        ]);

        setMePerson(updatedMe);
        setPartnerPerson(updatedPartner);

        const syncTimeStr = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        });

        if (activeKey) {
          setWeatherApiStatus({
            mode: 'live',
            lastSync: syncTimeStr,
            message: `Terhubung ke OpenWeatherMap API (${syncTimeStr})`
          });
        } else {
          setWeatherApiStatus({
            mode: 'simulation',
            lastSync: syncTimeStr,
            message: `Simulasi cuaca cerdas berdasarkan koordinat (${syncTimeStr})`
          });
        }
      } catch {
        const simMe = simulateSmartWeather(
          mePerson.lat,
          mePerson.lon,
          mePerson.tzOffset
        );
        const simPartner = simulateSmartWeather(
          partnerPerson.lat,
          partnerPerson.lon,
          partnerPerson.tzOffset
        );

        setMePerson((prev) => ({
          ...prev,
          weather: simMe.weather,
          weatherDesc: simMe.weatherDesc,
          temp: simMe.temp,
          feelsLike: simMe.feelsLike,
          humidity: simMe.humidity,
          windSpeed: simMe.windSpeed
        }));
        setPartnerPerson((prev) => ({
          ...prev,
          weather: simPartner.weather,
          weatherDesc: simPartner.weatherDesc,
          temp: simPartner.temp,
          feelsLike: simPartner.feelsLike,
          humidity: simPartner.humidity,
          windSpeed: simPartner.windSpeed
        }));

        setWeatherApiStatus({
          mode: 'error',
          lastSync: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          message:
            'API Key tidak valid/limit tercapai. Beralih otomatis ke Simulasi Cerdas.'
        });
      } finally {
        setIsFetchingWeather(false);
      }
    },
    [owmApiKey, mePerson, partnerPerson, fetchWeatherForLocation]
  );

  const handleUpdateMePerson = useCallback(
    async (nextMe, shouldSyncWeather = false) => {
      setMePerson(nextMe);
      if (shouldSyncWeather) {
        setIsFetchingWeather(true);
        try {
          const synced = await fetchWeatherForLocation(nextMe, owmApiKey);
          setMePerson(synced);
        } catch {
          // Gunakan data simulasi lokal bila gagal
        } finally {
          setIsFetchingWeather(false);
        }
      }
    },
    [fetchWeatherForLocation, owmApiKey]
  );

  const handleUpdatePartnerPerson = useCallback(
    async (nextPartner, shouldSyncWeather = false) => {
      setPartnerPerson(nextPartner);
      if (shouldSyncWeather) {
        setIsFetchingWeather(true);
        try {
          const synced = await fetchWeatherForLocation(nextPartner, owmApiKey);
          setPartnerPerson(synced);
        } catch {
          // Gunakan data simulasi lokal bila gagal
        } finally {
          setIsFetchingWeather(false);
        }
      }
    },
    [fetchWeatherForLocation, owmApiKey]
  );

  const relationshipStats = useMemo(() => {
    const start = new Date(anniversaryDate);
    const diffMs = Math.max(0, now.getTime() - start.getTime());

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const remainingDays = (totalDays % 365) % 30;

    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    const milestones = [
      10, 30, 50, 100, 200, 300, 365, 500, 730, 1000, 1095, 1460, 1825, 2000,
      2500, 3650
    ];
    const nextMilestone =
      milestones.find((m) => m > totalDays) ||
      Math.ceil((totalDays + 1) / 500) * 500;
    const prevMilestone =
      [...milestones].reverse().find((m) => m <= totalDays) || 0;

    const progressPercent =
      nextMilestone > prevMilestone
        ? Math.min(
            100,
            Math.max(
              4,
              Math.round(
                ((totalDays - prevMilestone) /
                  (nextMilestone - prevMilestone)) *
                  100
              )
            )
          )
        : 100;

    return {
      totalDays,
      totalHours,
      years,
      months,
      remainingDays,
      hours,
      minutes,
      seconds,
      nextMilestone,
      daysToMilestone: nextMilestone - totalDays,
      progressPercent
    };
  }, [anniversaryDate, now]);

  const animatedDays = useAnimatedCounter(
    relationshipStats.totalDays,
    1600,
    countTrigger
  );

  const meetupCountdown = useMemo(() => {
    const targetTime = new Date(meetupDate).getTime();
    const startPlanTime = new Date(meetupStartDate).getTime();
    const currentTime = now.getTime();

    if (Number.isNaN(targetTime)) {
      return {
        isReached: false,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        progressPercent: 0,
        formattedTargetDate: 'Belum diatur'
      };
    }

    const diffMs = targetTime - currentTime;
    const isReached = diffMs <= 0;
    const safeDiff = Math.max(0, diffMs);

    const totalSeconds = Math.floor(safeDiff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let progressPercent = 100;
    if (!isReached && !Number.isNaN(startPlanTime) && targetTime > startPlanTime) {
      const totalSpan = targetTime - startPlanTime;
      const elapsed = currentTime - startPlanTime;
      progressPercent = Math.min(
        100,
        Math.max(5, Math.round((elapsed / totalSpan) * 100))
      );
    }

    const formattedTargetDate = new Date(meetupDate).toLocaleDateString(
      'id-ID',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );

    return {
      isReached,
      days,
      hours,
      minutes,
      seconds,
      progressPercent,
      formattedTargetDate
    };
  }, [meetupDate, meetupStartDate, now]);

  const haversineDistanceKm = useMemo(() => {
    return calculateHaversineDistance(
      mePerson.lat,
      mePerson.lon,
      partnerPerson.lat,
      partnerPerson.lon
    );
  }, [mePerson.lat, mePerson.lon, partnerPerson.lat, partnerPerson.lon]);

  const travelEstimate = useMemo(
    () => estimateTravelTime(haversineDistanceKm),
    [haversineDistanceKm]
  );

  const activeTheme =
    WALLPAPER_THEMES.find((t) => t.id === themeId) || WALLPAPER_THEMES[0];

  const triggerInstantaneousLoveVisuals = useCallback(
    (payload) => {
      if (!payload || !payload.id) return;
      if (processedPingIdsRef.current.has(payload.id)) return;
      processedPingIdsRef.current.add(payload.id);

      const {
        senderRole = 'me',
        senderName = mePerson.nickname,
        receiverName = partnerPerson.nickname,
        emoji = '💕',
        text = 'Kangen banget!',
        distanceKm = haversineDistanceKm,
        via = 'Supabase Realtime'
      } = payload;

      const batchId = Date.now() + Math.random();
      const originBias = senderRole === 'me' ? 28 : 72;

      const newHearts = Array.from({ length: 26 }).map((_, idx) => {
        const styleMeta =
          HEART_PARTICLE_STYLES[idx % HEART_PARTICLE_STYLES.length];
        const isFromCardCluster = idx < 14;
        const startLeft = isFromCardCluster
          ? Math.max(8, Math.min(92, originBias + (Math.random() - 0.5) * 32))
          : 6 + Math.random() * 88;

        return {
          id: `${batchId}-${idx}`,
          left: startLeft,
          bottom: isFromCardCluster
            ? 22 + Math.random() * 18
            : 5 + Math.random() * 15,
          delay: idx * 45,
          duration: 1700 + Math.round(Math.random() * 1100),
          scale: 0.65 + Math.random() * 0.95,
          driftX: (Math.random() - 0.5) * 110,
          rotateDeg: Math.round((Math.random() - 0.5) * 50),
          colorClass: styleMeta.color,
          glowColor: styleMeta.glow,
          badgeEmoji: idx % 5 === 0 ? emoji : null
        };
      });

      setFloatingHearts((prev) => [...prev, ...newHearts]);
      setCardPulseState({ me: true, partner: true });

      const timeLabel = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      setLovePingCount((c) => c + 1);
      setPingHistory((prev) => [
        {
          id: payload.id,
          senderRole,
          senderName,
          receiverName,
          emoji,
          text,
          timeLabel,
          via
        },
        ...prev.slice(0, 5)
      ]);

      setPokeNotification({
        emoji,
        senderName,
        receiverName,
        text,
        distanceKm,
        via,
        timeLabel
      });

      setTimeout(() => {
        setCardPulseState({ me: false, partner: false });
      }, 1800);

      setTimeout(() => {
        setFloatingHearts((prev) =>
          prev.filter((h) => !newHearts.some((nh) => nh.id === h.id))
        );
      }, 2900);

      setTimeout(() => {
        setPokeNotification(null);
      }, 4200);
    },
    [mePerson.nickname, partnerPerson.nickname, haversineDistanceKm]
  );

  useEffect(() => {
    const cleanChannelName = `couple-room-${
      roomCode.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'default'
    }`;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(cleanChannelName);
        bc.onmessage = (event) => {
          if (event.data && event.data.type === 'ping_love') {
            triggerInstantaneousLoveVisuals({
              ...event.data.payload,
              via: 'Multi-Tab Broadcast'
            });
          }
        };
        broadcastChannelRef.current = bc;
      } catch {
        broadcastChannelRef.current = null;
      }
    }

    const trimmedUrl = supabaseUrl.trim();
    const trimmedKey = supabaseAnonKey.trim();

    if (!trimmedUrl || !trimmedKey) {
      setRealtimeStatus({
        mode: 'broadcast_fallback',
        label: 'Multi-Tab & Local Realtime',
        detail: `Channel "${cleanChannelName}" siap. Isi Supabase URL & Anon Key di Pengaturan untuk sinkronisasi lintas perangkat.`
      });
      return () => {
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.close();
          broadcastChannelRef.current = null;
        }
      };
    }

    let isUnmounted = false;
    setRealtimeStatus({
      mode: 'connecting',
      label: 'Menghubungkan Supabase...',
      detail: `Menyambungkan ke channel ${cleanChannelName}...`
    });

    loadSupabaseCreateClient()
      .then((createClientFn) => {
        if (isUnmounted) return;

        const client = createClientFn(trimmedUrl, trimmedKey, {
          realtime: {
            params: {
              eventsPerSecond: 20
            }
          }
        });
        supabaseClientRef.current = client;

        const channel = client.channel(cleanChannelName, {
          config: {
            broadcast: {
              self: true,
              ack: false
            }
          }
        });

        channel
          .on('broadcast', { event: 'ping_love' }, (message) => {
            if (isUnmounted) return;
            const incomingPayload = message?.payload || message;
            triggerInstantaneousLoveVisuals({
              ...incomingPayload,
              via: 'Supabase Realtime ⚡'
            });
          })
          .subscribe((status) => {
            if (isUnmounted) return;
            if (status === 'SUBSCRIBED') {
              setRealtimeStatus({
                mode: 'supabase_live',
                label: 'Supabase Realtime Live',
                detail: `Terhubung ke channel "${cleanChannelName}" secara real-time.`
              });
            } else if (
              status === 'CHANNEL_ERROR' ||
              status === 'TIMED_OUT' ||
              status === 'CLOSED'
            ) {
              setRealtimeStatus({
                mode: 'error',
                label: 'Fallback Realtime Aktif',
                detail:
                  'Gagal terhubung ke Supabase Realtime. Menggunakan mode instan lokal & multi-tab.'
              });
            }
          });

        supabaseChannelRef.current = channel;
      })
      .catch(() => {
        if (isUnmounted) return;
        setRealtimeStatus({
          mode: 'error',
          label: 'Fallback Realtime Aktif',
          detail:
            'Tidak dapat memuat atau menginisialisasi Supabase SDK. Tetap berjalan dengan mode instan lokal & multi-tab.'
        });
      });

    return () => {
      isUnmounted = true;
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
      if (supabaseChannelRef.current && supabaseClientRef.current) {
        try {
          supabaseClientRef.current.removeChannel(supabaseChannelRef.current);
        } catch {
          // Abaikan error saat cleanup
        }
        supabaseChannelRef.current = null;
      }
    };
  }, [
    supabaseUrl,
    supabaseAnonKey,
    roomCode,
    triggerInstantaneousLoveVisuals
  ]);

  const handleSendPingLove = useCallback(
    async ({
      fromRole = activeRole,
      customPreset = selectedPingPreset,
      isSimulatedPartner = false
    } = {}) => {
      const effectiveRole = isSimulatedPartner
        ? activeRole === 'me'
          ? 'partner'
          : 'me'
        : fromRole;

      const senderObj = effectiveRole === 'me' ? mePerson : partnerPerson;
      const receiverObj = effectiveRole === 'me' ? partnerPerson : mePerson;
      const presetToUse = customPreset || selectedPingPreset;

      const pingPayload = {
        id: `ping-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        senderRole: effectiveRole,
        senderName: senderObj.nickname,
        receiverName: receiverObj.nickname,
        emoji: presetToUse.emoji,
        text: presetToUse.text,
        distanceKm: haversineDistanceKm,
        timestamp: Date.now(),
        via:
          realtimeStatus.mode === 'supabase_live'
            ? 'Supabase Realtime ⚡'
            : isSimulatedPartner
            ? 'Simulasi Sinyal Pasangan 💓'
            : 'Realtime Broadcast ⚡'
      };

      triggerInstantaneousLoveVisuals(pingPayload);

      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage({
            type: 'ping_love',
            payload: pingPayload
          });
        } catch {
          // Abaikan bila channel tertutup
        }
      }

      if (
        supabaseChannelRef.current &&
        realtimeStatus.mode === 'supabase_live'
      ) {
        try {
          await supabaseChannelRef.current.send({
            type: 'broadcast',
            event: 'ping_love',
            payload: pingPayload
          });
        } catch {
          // Visual lokal tetap berjalan
        }
      }
    },
    [
      activeRole,
      selectedPingPreset,
      mePerson,
      partnerPerson,
      haversineDistanceKm,
      realtimeStatus.mode,
      triggerInstantaneousLoveVisuals
    ]
  );

  const handleSwapLocations = () => {
    const tempMe = { ...mePerson };
    setMePerson({ ...partnerPerson });
    setPartnerPerson(tempMe);
  };

  const formattedAnniversary = useMemo(() => {
    const d = new Date(anniversaryDate);
    if (Number.isNaN(d.getTime())) return 'Belum diatur';
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [anniversaryDate]);

  const latestPingForMe = useMemo(
    () => pingHistory.find((p) => p.senderRole === 'partner') || null,
    [pingHistory]
  );
  const latestPingForPartner = useMemo(
    () => pingHistory.find((p) => p.senderRole === 'me') || null,
    [pingHistory]
  );

  return (
    <div
      className={`relative min-h-screen w-full ${activeTheme.bgClass} text-white font-sans selection:bg-rose-400/40 overflow-x-hidden flex flex-col justify-between transition-colors duration-700`}
    >
      <style>{`
        @keyframes floatHeartUp {
          0% {
            opacity: 0;
            transform: translate3d(0, 24px, 0) scale(0.4) rotate(0deg);
          }
          15% {
            opacity: 1;
            transform: translate3d(calc(var(--drift-x, 20px) * 0.25), -25px, 0) scale(var(--heart-scale, 1)) rotate(calc(var(--heart-rot, 15deg) * 0.5));
          }
          75% {
            opacity: 0.95;
            transform: translate3d(calc(var(--drift-x, 20px) * 0.8), -220px, 0) scale(calc(var(--heart-scale, 1) * 1.1)) rotate(var(--heart-rot, 15deg));
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--drift-x, 20px), -340px, 0) scale(0.6) rotate(calc(var(--heart-rot, 15deg) * 1.4));
          }
        }
      `}</style>

      {/* Background Orbs untuk kedalaman efek Glassmorphism */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className={`absolute -top-24 -left-24 w-96 h-96 rounded-full ${activeTheme.orb1} blur-3xl animate-pulse`}
        />
        <div
          className={`absolute top-1/3 -right-28 w-[28rem] h-[28rem] rounded-full ${activeTheme.orb2} blur-3xl`}
        />
        <div
          className={`absolute -bottom-32 left-1/3 w-[26rem] h-[26rem] rounded-full ${activeTheme.orb3} blur-3xl`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Desktop Status Bar Minimalis */}
      <header className="relative z-30 w-full max-w-5xl mx-auto px-4 pt-4 sm:pt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-xl border shadow-sm text-xs font-medium transition-all ${
              realtimeStatus.mode === 'supabase_live'
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
                : realtimeStatus.mode === 'connecting'
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-100'
                : 'bg-white/10 border-white/15 text-white/90 hover:bg-white/15'
            }`}
            title={realtimeStatus.detail}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                realtimeStatus.mode === 'supabase_live'
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-rose-400 animate-pulse'
              }`}
            />
            <Radio className="w-3.5 h-3.5 text-rose-300" />
            <span>{realtimeStatus.label}</span>
            <span className="hidden sm:inline font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/25 text-white/70">
              #{roomCode}
            </span>
          </button>

          {/* Switcher Peran Perangkat ("Aku" vs "Dia") */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 text-[11px]">
            <span className="px-2 text-white/60 hidden md:inline">Perangkat:</span>
            <button
              type="button"
              onClick={() => setActiveRole('me')}
              className={`px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                activeRole === 'me'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Aku
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('partner')}
              className={`px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                activeRole === 'partner'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Dia
            </button>
          </div>

          {/* Status Koneksi OpenWeatherMap API */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl border text-[11px] font-medium transition-all ${
              weatherApiStatus.mode === 'live'
                ? 'bg-emerald-500/20 border-emerald-400/35 text-emerald-200'
                : weatherApiStatus.mode === 'error'
                ? 'bg-amber-500/20 border-amber-400/35 text-amber-200'
                : 'bg-white/10 border-white/15 text-white/75 hover:text-white'
            }`}
            title={weatherApiStatus.message}
          >
            {weatherApiStatus.mode === 'live' ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-white/60" />
            )}
            <span className="hidden sm:inline">
              {weatherApiStatus.mode === 'live'
                ? 'OWM API Live'
                : 'Cuaca: Simulasi'}
            </span>
          </button>
        </div>

        {/* Kontrol Cepat Desktop */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/15">
            {WALLPAPER_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setThemeId(theme.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  themeId === theme.id
                    ? 'bg-white/25 text-white shadow-sm'
                    : 'text-white/65 hover:text-white'
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => syncAllWeather()}
            disabled={isFetchingWeather}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 text-xs font-medium text-white/90 transition-all flex items-center gap-1.5"
            title="Sinkronkan ulang cuaca kedua lokasi"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isFetchingWeather ? 'animate-spin text-cyan-300' : ''}`}
            />
            <span className="hidden sm:inline">Sync Cuaca</span>
          </button>

          <button
            type="button"
            onClick={() => setUse24Hour((prev) => !prev)}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 text-xs font-mono text-white/85 transition-colors"
            title="Ubah format 12 Jam / 24 Jam"
          >
            {use24Hour ? '24H' : '12H'}
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/20 text-xs font-medium text-white transition-all shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 text-rose-200" />
            <span>Pengaturan</span>
          </button>
        </div>
      </header>

      {}
      <main className="relative z-20 w-full max-w-4xl mx-auto px-4 py-5 sm:py-7 my-auto">
        {/* Notifikasi Melayang Saat Menerima / Mengirim Sinyal Ping Love */}
        {pokeNotification && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600/95 via-pink-600/95 to-fuchsia-600/95 backdrop-blur-2xl border border-white/40 text-white shadow-[0_20px_60px_rgba(244,63,94,0.6)] flex items-center justify-between gap-3 animate-bounce">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0 shadow-inner">
                {pokeNotification.emoji}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-rose-100">
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>{pokeNotification.via}</span>
                </div>
                <p className="text-xs sm:text-sm font-bold truncate">
                  {pokeNotification.senderName} → {pokeNotification.receiverName}
                </p>
                <p className="text-xs text-white/90 truncate">
                  "{pokeNotification.text}" (
                  {pokeNotification.distanceKm.toLocaleString('id-ID', {
                    maximumFractionDigits: 1
                  })}{' '}
                  km)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-black/25 px-2 py-1 rounded-lg text-white/80 shrink-0">
              {pokeNotification.timeLabel}
            </span>
          </div>
        )}

        {/* Partikel Floating Hearts Instantaneous di Layar */}
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          {floatingHearts.map((item) => (
            <div
              key={item.id}
              style={{
                left: `${item.left}%`,
                bottom: `${item.bottom}%`,
                animationName: 'floatHeartUp',
                animationDuration: `${item.duration}ms`,
                animationDelay: `${item.delay}ms`,
                animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                animationFillMode: 'forwards',
                '--drift-x': `${item.driftX}px`,
                '--heart-scale': item.scale,
                '--heart-rot': `${item.rotateDeg}deg`
              }}
              className="absolute opacity-0 flex flex-col items-center"
            >
              {item.badgeEmoji && (
                <span className="text-sm mb-0.5 drop-shadow">
                  {item.badgeEmoji}
                </span>
              )}
              <Heart
                style={{
                  filter: `drop-shadow(0 0 14px ${item.glowColor})`
                }}
                className={`w-7 h-7 sm:w-9 sm:h-9 ${item.colorClass}`}
              />
            </div>
          ))}
        </div>

        {/* Frame Utama Desktop Widget Glassmorphism */}
        <div className="relative rounded-[2.25rem] bg-white/[0.07] backdrop-blur-3xl border border-white/25 shadow-[0_32px_90px_rgba(0,0,0,0.45)] p-5 sm:p-8 space-y-6 overflow-visible">
          {/* Dekorasi Window Controls ala macOS Desktop Widget */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400/80 border border-rose-300/40" />
              <span className="w-3 h-3 rounded-full bg-amber-300/80 border border-amber-200/40" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80 border border-emerald-300/40" />
              <span className="ml-2 text-xs font-medium text-white/60 tracking-wide">
                {relationshipTitle}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/70">
              <span>Jadian: {formattedAnniversary}</span>
              <button
                type="button"
                onClick={() => setCountTrigger((c) => c + 1)}
                title="Ulangi animasi angka hari pacaran"
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all active:rotate-180"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {}
          <section className="relative rounded-3xl bg-gradient-to-b from-white/[0.10] to-white/[0.04] border border-white/20 p-5 sm:p-7 text-center overflow-hidden shadow-inner">
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-rose-400/25 blur-3xl rounded-full" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-300/30 text-rose-200 text-xs font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                <span>Kita Telah Bersama Selama</span>
              </div>

              <div
                onClick={() => setCountTrigger((c) => c + 1)}
                title="Klik untuk memutar ulang animasi angka"
                className="cursor-pointer select-none group flex items-baseline justify-center gap-2 sm:gap-3 my-1"
              >
                <span className="text-5xl sm:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-rose-100 to-pink-200 bg-clip-text text-transparent drop-shadow-[0_6px_25px_rgba(244,63,94,0.35)] font-mono transition-transform duration-300 group-hover:scale-105">
                  {animatedDays.toLocaleString('id-ID')}
                </span>
                <span className="text-xl sm:text-2xl font-semibold text-rose-200/90 tracking-wide">
                  Hari
                </span>
              </div>

              {showDetailedBreakdown && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {relationshipStats.years > 0 && (
                    <div className="px-3 py-1.5 rounded-2xl bg-white/10 border border-white/15 text-xs">
                      <span className="font-mono font-bold text-white text-sm">
                        {relationshipStats.years}
                      </span>{' '}
                      <span className="text-white/70">Tahun</span>
                    </div>
                  )}
                  {(relationshipStats.months > 0 ||
                    relationshipStats.years > 0) && (
                    <div className="px-3 py-1.5 rounded-2xl bg-white/10 border border-white/15 text-xs">
                      <span className="font-mono font-bold text-white text-sm">
                        {relationshipStats.months}
                      </span>{' '}
                      <span className="text-white/70">Bulan</span>
                    </div>
                  )}
                  <div className="px-3 py-1.5 rounded-2xl bg-white/10 border border-white/15 text-xs">
                    <span className="font-mono font-bold text-white text-sm">
                      {relationshipStats.remainingDays}
                    </span>{' '}
                    <span className="text-white/70">Hari</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-2xl bg-white/10 border border-white/15 text-xs font-mono">
                    <span className="font-bold text-rose-200">
                      {String(relationshipStats.hours).padStart(2, '0')}
                    </span>
                    <span className="text-white/50">j : </span>
                    <span className="font-bold text-rose-200">
                      {String(relationshipStats.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-white/50">m : </span>
                    <span className="font-bold text-rose-300">
                      {String(relationshipStats.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-white/50">d</span>
                  </div>
                </div>
              )}

              <div className="mt-5 w-full max-w-md">
                <div className="flex items-center justify-between text-[11px] text-white/70 mb-1.5">
                  <span>
                    Menuju milestone{' '}
                    <strong className="text-white font-mono">
                      {relationshipStats.nextMilestone} hari
                    </strong>
                  </span>
                  <span className="text-rose-200 font-medium">
                    {relationshipStats.daysToMilestone} hari lagi (
                    {relationshipStats.progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
                  <div
                    style={{ width: `${relationshipStats.progressPercent}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 transition-all duration-1000"
                  />
                </div>
              </div>
            </div>
          </section>

          {}
          <div className="rounded-3xl bg-gradient-to-r from-rose-500/[0.14] via-fuchsia-500/[0.12] to-indigo-500/[0.14] border border-white/20 p-4 sm:p-5 space-y-3.5 shadow-inner">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-300/25 text-cyan-200 font-medium">
                  <Compass className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Haversine</span>
                </span>

                <div className="flex items-center gap-1.5 text-white/90">
                  <span className="font-semibold text-white">
                    {mePerson.cityName}
                  </span>
                  <span className="text-white/40">↔</span>
                  <span className="font-semibold text-white">
                    {partnerPerson.cityName}
                  </span>
                </div>

                <span className="px-2.5 py-0.5 rounded-lg bg-white/10 font-mono font-bold text-rose-200 text-xs sm:text-sm border border-white/10">
                  {haversineDistanceKm.toLocaleString('id-ID', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}{' '}
                  km
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] text-white/70 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                  <Plane className="w-3 h-3 text-amber-300" />
                  <span>{travelEstimate.label}</span>
                </span>

                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] text-white/80 hover:text-white transition-all"
                  title="Tukar lokasi Aku dan Dia"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Tukar</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-300/30 text-rose-100">
                  <Activity className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
                  <span>Total Sinyal Cinta:</span>
                  <span className="font-mono font-bold text-white">
                    {lovePingCount}x
                  </span>
                </div>
              </div>
            </div>

            {/* Pemilih Pesan Kilat & Tombol Utama 'PING LOVE' */}
            <div className="pt-2 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <span className="text-[11px] text-white/60 font-medium shrink-0 flex items-center gap-1 mr-1">
                  <MessageSquareHeart className="w-3.5 h-3.5 text-rose-300" />
                  <span>Pesan Ping:</span>
                </span>
                {PING_LOVE_PRESETS.map((preset) => {
                  const isActive = selectedPingPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPingPreset(preset)}
                      className={`px-2.5 py-1 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1 border ${
                        isActive
                          ? 'bg-rose-500/40 border-rose-300/60 text-white font-semibold shadow-sm'
                          : 'bg-black/25 border-white/10 text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{preset.emoji}</span>
                      <span>{preset.text}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleSendPingLove({
                      isSimulatedPartner: true
                    })
                  }
                  className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-medium text-white/90 hover:text-white transition-all active:scale-95 flex items-center gap-1.5"
                  title="Simulasikan pasangan mengirim sinyal Ping Love ke layarmu"
                >
                  <BellRing className="w-3.5 h-3.5 text-amber-300" />
                  <span>Simulasi Terima Ping</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSendPingLove({
                      fromRole: activeRole,
                      customPreset: selectedPingPreset
                    })
                  }
                  className="relative group/ping px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-400 hover:via-pink-400 hover:to-fuchsia-400 text-white font-bold text-xs sm:text-sm shadow-[0_10px_30px_rgba(244,63,94,0.45)] hover:shadow-[0_12px_35px_rgba(244,63,94,0.7)] border border-white/30 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-white text-white animate-bounce" />
                  <span>Ping Love</span>
                  <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                </button>
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <LocationGlassCard
              roleLabel="AKU"
              isCurrentDeviceRole={activeRole === 'me'}
              isPulsing={cardPulseState.me}
              lastPingReceived={latestPingForMe}
              person={mePerson}
              otherPerson={partnerPerson}
              now={now}
              use24Hour={use24Hour}
              onUpdatePerson={handleUpdateMePerson}
              onSendHeart={() =>
                handleSendPingLove({
                  fromRole: 'me',
                  customPreset: selectedPingPreset
                })
              }
              onRefreshSingleWeather={() => handleUpdateMePerson(mePerson, true)}
              isFetchingWeather={isFetchingWeather}
            />

            <LocationGlassCard
              roleLabel="DIA"
              isCurrentDeviceRole={activeRole === 'partner'}
              isPulsing={cardPulseState.partner}
              lastPingReceived={latestPingForPartner}
              person={partnerPerson}
              otherPerson={mePerson}
              now={now}
              use24Hour={use24Hour}
              onUpdatePerson={handleUpdatePartnerPerson}
              onSendHeart={() =>
                handleSendPingLove({
                  fromRole: 'partner',
                  customPreset: selectedPingPreset
                })
              }
              onRefreshSingleWeather={() =>
                handleUpdatePartnerPerson(partnerPerson, true)
              }
              isFetchingWeather={isFetchingWeather}
            />
          </div>

          {}
          <section className="relative rounded-3xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-rose-500/15 border border-white/20 p-5 sm:p-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-medium">
                  <Plane className="w-3.5 h-3.5 text-amber-300" />
                  <span>Countdown Hari Menuju Pertemuan</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {meetupTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/75">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-300" />
                    {meetupCountdown.formattedTargetDate}
                  </span>
                  {meetupLocationNote && (
                    <>
                      <span className="text-white/40">•</span>
                      <span className="inline-flex items-center gap-1 text-cyan-200">
                        <Navigation className="w-3 h-3" />
                        {meetupLocationNote}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {!meetupCountdown.isReached ? (
                <div className="grid grid-cols-4 gap-2 sm:gap-3 shrink-0">
                  <div className="px-3 py-2.5 rounded-2xl bg-black/30 border border-white/15 text-center min-w-[64px]">
                    <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
                      {meetupCountdown.days}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/60">
                      Hari
                    </div>
                  </div>
                  <div className="px-3 py-2.5 rounded-2xl bg-black/30 border border-white/15 text-center min-w-[64px]">
                    <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
                      {String(meetupCountdown.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/60">
                      Jam
                    </div>
                  </div>
                  <div className="px-3 py-2.5 rounded-2xl bg-black/30 border border-white/15 text-center min-w-[64px]">
                    <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
                      {String(meetupCountdown.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/60">
                      Menit
                    </div>
                  </div>
                  <div className="px-3 py-2.5 rounded-2xl bg-rose-500/25 border border-rose-300/30 text-center min-w-[64px]">
                    <div className="text-xl sm:text-2xl font-extrabold font-mono text-rose-200">
                      {String(meetupCountdown.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-rose-200/80">
                      Detik
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 rounded-2xl bg-emerald-500/25 border border-emerald-300/40 text-emerald-100 text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
                  <span>Yeay! Waktu pertemuan kalian sudah tiba! ❤️</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] text-white/70 mb-1.5">
                <span>Progres penantian menuju hari pertemuan</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-amber-200 font-semibold">
                    {meetupCountdown.progressPercent}% terlewati
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="underline decoration-dotted hover:text-white"
                  >
                    Ubah Jadwal
                  </button>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden p-0.5 border border-white/10">
                <div
                  style={{ width: `${meetupCountdown.progressPercent}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-300 transition-all duration-1000"
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      {}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/25 shadow-2xl p-5 sm:p-6 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/15">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-rose-400" />
                <h2 className="text-base sm:text-lg font-bold">
                  Pengaturan Supabase Realtime, Cuaca & Jadwal Pasangan
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 text-xs sm:text-sm">
              {/* SEKSI 0: KONFIGURASI SUPABASE REALTIME ('PING LOVE' BROADCAST) */}
              <div className="rounded-2xl bg-rose-500/10 border border-rose-300/30 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-semibold text-rose-200">
                    <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>Supabase Realtime Broadcast ('Ping Love')</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/30 text-rose-200">
                    Channel: couple-room-{roomCode || 'default'}
                  </span>
                </div>

                <p className="text-xs text-white/75 leading-relaxed">
                  Hubungkan dua perangkat dari jaringan berbeda secara instan
                  menggunakan <strong>Supabase Realtime Broadcast</strong>. Tanpa
                  kredensial pun, fitur <em>Ping Love</em> tetap bekerja otomatis
                  antar-tab browser menggunakan <code>BroadcastChannel</code>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">
                      Kode Room Pasangan (Channel ID)
                    </label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      placeholder="contoh: malang-tokyo-1402"
                      className="w-full rounded-xl bg-black/40 border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">
                      Buka Widget Ini Sebagai Peran
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveRole('me')}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                          activeRole === 'me'
                            ? 'bg-rose-500/40 border-rose-300 text-white'
                            : 'bg-black/30 border-white/15 text-white/65'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Aku ({mePerson.nickname})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveRole('partner')}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                          activeRole === 'partner'
                            ? 'bg-sky-500/40 border-sky-300 text-white'
                            : 'bg-black/30 border-white/15 text-white/65'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Dia ({partnerPerson.nickname})</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">
                      Supabase Project URL (Opsional)
                    </label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full rounded-xl bg-black/40 border border-white/20 px-3 py-2 text-xs font-mono text-white placeholder-white/35 focus:outline-none focus:border-rose-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">
                      Supabase Anon Public Key (Opsional)
                    </label>
                    <input
                      type="password"
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full rounded-xl bg-black/40 border border-white/20 px-3 py-2 text-xs font-mono text-white placeholder-white/35 focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>
              </div>

              {/* SEKSI 1: INTEGRASI OPENWEATHERMAP API */}
              <div className="rounded-2xl bg-cyan-500/10 border border-cyan-300/25 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-cyan-200">
                    <Key className="w-4 h-4" />
                    <span>Integrasi OpenWeatherMap API</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-black/30 text-white/70">
                    {weatherApiStatus.mode === 'live'
                      ? 'Terhubung (Live)'
                      : 'Mode Simulasi Cerdas'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    value={owmApiKey}
                    onChange={(e) => setOwmApiKey(e.target.value)}
                    placeholder="Masukkan OpenWeatherMap API Key (opsional)..."
                    className="flex-1 rounded-xl bg-black/40 border border-white/20 px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-300 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => syncAllWeather(owmApiKey)}
                    disabled={isFetchingWeather}
                    className="px-4 py-2 rounded-xl bg-cyan-500/80 hover:bg-cyan-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isFetchingWeather ? 'animate-spin' : ''}`}
                    />
                    <span>Tes & Sync Cuaca</span>
                  </button>
                </div>
              </div>

              {/* SEKSI 2: TANGGAL JADIAN & COUNTDOWN PERTEMUAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15 space-y-3">
                  <div className="font-semibold text-rose-200">
                    1. Count-Up Hari Jadian
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/60 mb-1">
                      Judul Widget Hubungan
                    </label>
                    <input
                      type="text"
                      value={relationshipTitle}
                      onChange={(e) => setRelationshipTitle(e.target.value)}
                      className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/60 mb-1">
                      Tanggal & Waktu Jadian
                    </label>
                    <input
                      type="datetime-local"
                      value={anniversaryDate}
                      onChange={(e) => {
                        setAnniversaryDate(e.target.value);
                        setCountTrigger((c) => c + 1);
                      }}
                      className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15 space-y-3">
                  <div className="font-semibold text-amber-200">
                    2. Countdown Pertemuan Berikutnya
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/60 mb-1">
                      Agenda Pertemuan
                    </label>
                    <input
                      type="text"
                      value={meetupTitle}
                      onChange={(e) => setMeetupTitle(e.target.value)}
                      className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/60 mb-1">
                      Target Tanggal & Jam Ketemu
                    </label>
                    <input
                      type="datetime-local"
                      value={meetupDate}
                      onChange={(e) => setMeetupDate(e.target.value)}
                      className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/60 mb-1">
                      Catatan Lokasi Titik Temu
                    </label>
                    <input
                      type="text"
                      value={meetupLocationNote}
                      onChange={(e) => setMeetupLocationNote(e.target.value)}
                      className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SEKSI 3: PROFIL & KOORDINAT LAT/LON (HAVERSINE FORMULA) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15 space-y-2.5">
                  <div className="font-semibold text-rose-200 flex items-center justify-between">
                    <span>Kartu "AKU"</span>
                    <span className="text-[10px] font-mono text-white/50">
                      Haversine Point A
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] text-white/60">
                        Nama Panggilan
                      </label>
                      <input
                        type="text"
                        value={mePerson.nickname}
                        onChange={(e) =>
                          setMePerson({ ...mePerson, nickname: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/60">
                        Avatar
                      </label>
                      <input
                        type="text"
                        value={mePerson.avatar}
                        onChange={(e) =>
                          setMePerson({ ...mePerson, avatar: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-xs text-center text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-white/60">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={mePerson.lat}
                        onChange={(e) =>
                          setMePerson({
                            ...mePerson,
                            lat: parseFloat(e.target.value) || 0
                          })
                        }
                        className="mt-1 w-full rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-xs font-mono text-cyan-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/60">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={mePerson.lon}
                        onChange={(e) =>
                          setMePerson({
                            ...mePerson,
                            lon: parseFloat(e.target.value) || 0
                          })
                        }
                        className="mt-1 w-full rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-xs font-mono text-cyan-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15 space-y-2.5">
                  <div className="font-semibold text-sky-200 flex items-center justify-between">
                    <span>Kartu "DIA"</span>
                    <span className="text-[10px] font-mono text-white/50">
                      Haversine Point B
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] text-white/60">
                        Nama Panggilan
                      </label>
                      <input
                        type="text"
                        value={partnerPerson.nickname}
                        onChange={(e) =>
                          setPartnerPerson({
                            ...partnerPerson,
                            nickname: e.target.value
                          })
                        }
                        className="mt-1 w-full rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/60">
                        Avatar
                      </label>
                      <input
                        type="text"
                        value={partnerPerson.avatar}
                        onChange={(e) =>
                          setPartnerPerson({
                            ...partnerPerson,
                            avatar: e.target.value
                          })
                        }
                        className="mt-1 w-full rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-xs text-center text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-white/60">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={partnerPerson.lat}
                        onChange={(e) =>
                          setPartnerPerson({
                            ...partnerPerson,
                            lat: parseFloat(e.target.value) || 0
                          })
                        }
                        className="mt-1 w-full rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-xs font-mono text-cyan-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/60">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={partnerPerson.lon}
                        onChange={(e) =>
                          setPartnerPerson({
                            ...partnerPerson,
                            lon: parseFloat(e.target.value) || 0
                          })
                        }
                        className="mt-1 w-full rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-xs font-mono text-cyan-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-2 pt-4 border-t border-white/15">
              <div className="text-xs text-white/60 font-mono">
                Jarak Haversine Saat Ini:{' '}
                <strong className="text-rose-300">
                  {haversineDistanceKm.toLocaleString('id-ID', {
                    maximumFractionDigits: 2
                  })}{' '}
                  km
                </strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  syncAllWeather();
                  setIsSettingsOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white text-xs sm:text-sm font-semibold shadow-lg"
              >
                Simpan & Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Minimalis */}
      <footer className="relative z-20 pb-4 px-4 text-center text-[11px] text-white/50">
        Klik tombol <strong className="text-rose-200">Ping Love ❤️</strong> untuk
        mengirimkan animasi hati instan via Supabase Realtime • Klik nama kota,
        cuaca, atau status untuk mengedit langsung
      </footer>
    </div>
  );
}