import { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  Settings,
  Plane,
  X
} from 'lucide-react';

const PING_PRESETS = [
  { id: 'kangen', emoji: '💕', text: 'Kangen banget!' },
  { id: 'peluk', emoji: '🤗', text: 'Peluk jauh hangat!' },
  { id: 'semangat', emoji: '✨', text: 'Semangat hari ini ya!' },
  { id: 'mikirin', emoji: '💭', text: 'Lagi mikirin kamu terus' },
  { id: 'cium', emoji: '😘', text: 'Cium jauh buat kamu!' },
  { id: 'tidur', emoji: '🌙', text: 'Jangan lupa istirahat ya' }
];

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function App() {
  const [now, setNow] = useState(new Date());
  
  // TANGGAL JADIAN: 16 OKTOBER 2026
  const [anniversaryDate] = useState('2026-10-16');
  
  const [supabaseUrl] = useState('https://ntjpmjhvblcwqxarseba.supabase.co');
  const [roomCode] = useState('malang-bogor-1610');
  
  const [role, setRole] = useState<'me' | 'partner'>('me');
  const [lastPing, setLastPing] = useState<{ sender: string; text: string; time: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hitung Hari Jadian
  const daysTogether = useMemo(() => {
    const start = new Date(anniversaryDate).getTime();
    const current = now.getTime();
    const diff = Math.max(0, current - start);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [anniversaryDate, now]);

  // Hitung Jarak Malang (-7.9666, 112.6326) ke Bogor (-6.5971, 106.8060)
  const distanceKm = useMemo(() => calculateDistance(-7.9666, 112.6326, -6.5971, 106.8060), []);

  const handleSendPing = (presetText: string) => {
    const pingObj = {
      sender: role === 'me' ? 'Ridho' : 'Claudia',
      text: presetText,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setLastPing(pingObj);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-400 fill-rose-400 animate-pulse" />
            <h1 className="text-xl font-bold tracking-tight">Our Love Space</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRole(role === 'me' ? 'partner' : 'me')}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 border border-white/20 hover:bg-white/25 transition-all"
            >
              Peran: {role === 'me' ? 'Aku (Ridho)' : 'Dia (Claudia)'}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Counter Hari Jadian */}
        <div className="text-center space-y-1 bg-white/5 p-6 rounded-2xl border border-white/10">
          <p className="text-xs font-medium text-rose-300 uppercase tracking-widest">Kita telah bersama selama</p>
          <div className="text-5xl sm:text-6xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-400 to-indigo-300">
            {daysTogether} Hari
          </div>
          <p className="text-xs text-white/60">Sejak 16 Oktober 2026</p>
        </div>

        {/* Info Malang & Bogor */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-xs text-white/60">Aku (Ridho)</p>
            <p className="text-base font-bold text-cyan-300">Malang, ID</p>
            <p className="text-xs font-mono text-white/40">WIB (UTC+7)</p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-xs text-white/60">Dia (Claudia)</p>
            <p className="text-base font-bold text-emerald-300">Bogor, ID</p>
            <p className="text-xs font-mono text-white/40">WIB (UTC+7)</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-white/70 bg-white/5 py-2 px-4 rounded-full border border-white/10 w-fit mx-auto">
          <Plane className="w-4 h-4 text-rose-400" />
          <span>Jarak LDR Malang—Bogor: <strong className="text-white">{distanceKm} km</strong> (~12j perjalanan darat)</span>
        </div>

        {/* Fitur Ping Love */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-medium text-white/70">Kirim Sinyal Cinta (Ping Love):</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PING_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSendPing(preset.text)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:border-rose-300/40 border border-white/10 text-xs font-medium transition-all text-left flex items-center gap-1.5"
              >
                <span>{preset.emoji}</span>
                <span className="truncate">{preset.text}</span>
              </button>
            ))}
          </div>

          {lastPing && (
            <div className="bg-rose-500/20 border border-rose-300/40 p-3 rounded-xl text-xs text-rose-100 flex items-center justify-between animate-bounce">
              <span>💖 <strong>{lastPing.sender}</strong>: "{lastPing.text}"</span>
              <span className="text-[10px] text-white/60 font-mono">{lastPing.time}</span>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold">Pengaturan Room</h3>
              <button onClick={() => setShowSettings(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 block mb-1">Kode Room Pasangan</label>
                <input type="text" value={roomCode} disabled className="w-full bg-white/5 border border-white/10 p-2 rounded-xl font-mono text-white/50 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-white/60 block mb-1">Supabase Project URL</label>
                <input type="text" value={supabaseUrl} disabled className="w-full bg-white/5 border border-white/10 p-2 rounded-xl font-mono text-white/50 cursor-not-allowed" />
              </div>
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full bg-rose-500 py-2 rounded-xl font-bold text-xs">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}