import { useState, useEffect, useRef } from 'react';
import { useCiro } from '../store/ciroStore';
import { apiService } from '../services/api';
import PageScroller from '../components/common/PageScroller';

// ── Rich mock signals ───────────────────────────────────────────────
const STATIC_SIGNALS = [
  {
    id: 'sig-1',
    source: 'SOCIAL',
    type: 'FLOOD',
    content: '"G-10 mein pani bhar gaya, gaariyan phans gayi hain" — trending with 18 mentions/5min',
    confidence: 75,
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    location: { name: 'G-10, Islamabad' },
  },
  {
    id: 'sig-2',
    source: 'WEATHER',
    type: 'WEATHER',
    content: 'Heavy rainfall alert — 42mm/hr. Pakistan Met Office RED alert issued for Islamabad.',
    confidence: 95,
    timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
    location: { name: 'Islamabad' },
    live: true,
  },
  {
    id: 'sig-3',
    source: 'TRAFFIC',
    type: 'TRAFFIC',
    content: 'G-10 Main Boulevard — severe congestion detected. Speed 4km/h (normal: 60km/h).',
    confidence: 90,
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    location: { name: 'G-10 Boulevard' },
    live: true,
  },
  {
    id: 'sig-4',
    source: 'SENSOR',
    type: 'SENSOR',
    content: 'Seismic sensor array — microseismic activity (M1.2) detected. Within noise threshold.',
    confidence: 62,
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    location: { name: 'Margalla Zone' },
  },
  {
    id: 'sig-5',
    source: 'SOCIAL',
    type: 'NOISE',
    content: '"G-10 flooding is fake news, just water main burst" — single low-credibility post.',
    confidence: 30,
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    location: null,
    filtered: true,
  },
  {
    id: 'sig-6',
    source: 'SOCIAL',
    type: 'HEATWAVE',
    content: '"I-9 industrial area mein garmi ki waja se 3 workers behosh ho gaye" — 9 mentions.',
    confidence: 82,
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    location: { name: 'I-9 Industrial, Islamabad' },
  },
];


// Sections configured for right scroll navigation
const SECTIONS = [
  { id: 'section-intel-overview', label: 'Overview', icon: 'analytics' },
  { id: 'section-conflict', label: 'Conflicts', icon: 'warning' },
  { id: 'section-social',   label: 'Social Feed',   icon: 'public' },
  { id: 'section-weather',  label: 'Weather Radar',  icon: 'cloudy_snowing' },
  { id: 'section-traffic',  label: 'Traffic Control',  icon: 'directions_car' },
  { id: 'section-sensor',   label: 'Sensors Grid',   icon: 'sensors' },
  { id: 'section-noise',    label: 'Noise Filter',    icon: 'block' },
];

function SeismicWaveVisualizer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.strokeStyle = '#1d9e75';
      ctx.lineWidth = 1.75 * window.devicePixelRatio;
      ctx.shadowBlur = 8 * window.devicePixelRatio;
      ctx.shadowColor = 'rgba(29, 158, 117, 0.7)';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();
      
      for (let x = 0; x < width; x++) {
        const timeFactor = Date.now() * 0.003;
        const baseFreq = 0.006;
        
        let y = Math.sin(x * baseFreq - timeFactor) * (height * 0.12);
        y += Math.sin(x * baseFreq * 2.3 + timeFactor * 1.6) * (height * 0.06);
        y += (Math.random() - 0.5) * (height * 0.02);

        const spikeCycle = (Date.now() * 0.00015) % 6;
        if (spikeCycle > 4.2 && spikeCycle < 5.0) {
          const spikeCenter = width * 0.7;
          const distFromCenter = Math.abs(x - spikeCenter);
          const envelope = Math.max(0, 1 - distFromCenter / (width * 0.15));
          y += Math.sin(x * 0.06 - timeFactor * 4) * (height * 0.3) * envelope;
        }

        if (x === 0) {
          ctx.moveTo(x, centerY + y);
        } else {
          ctx.lineTo(x, centerY + y);
        }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full bg-surface-container-lowest animate-pulse" 
      style={{ display: 'block' }}
    />
  );
}

export default function EmergencyFeed() {
  const { state } = useCiro();
  const [liveWeather, setLiveWeather] = useState(null);

  // Merge live state signals with static mock signals
  const allSignals = state.signals.length ? [...state.signals, ...STATIC_SIGNALS] : STATIC_SIGNALS;
  const filtered = allSignals;

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const city = state.crises.length ? state.crises[0].location.split(',')[0].trim() : 'Islamabad';
        const data = await apiService.getWeather(city);
        if (data) {
          setLiveWeather(data);
        }
      } catch (err) {
        console.error("Failed to fetch weather for EmergencyFeed:", err);
      }
    };
    fetchWeather();
  }, [state.crises]);

  const precipitation = liveWeather?.precipitation_mm !== undefined ? liveWeather.precipitation_mm : (liveWeather?.rain?.['1h'] || 0.0);
  const displaysPrecipitation = precipitation || 42; // default fallback if 0
  const temp = liveWeather?.temp !== undefined ? Math.round(liveWeather.temp) : 25;
  const humidity = liveWeather?.humidity !== undefined ? liveWeather.humidity : 92;
  const wind = liveWeather?.wind !== undefined ? liveWeather.wind : 18;
  const weatherDesc = liveWeather?.description 
    ? `Live readings: ${liveWeather.description}. Temperature: ${temp}°C, Precipitation: ${precipitation}mm/hr.` 
    : 'Satellite tracking shows storm cell centering over Sector E, F, G corridors. Expect urban flooding.';
  const weatherTitle = liveWeather ? `Weather Intelligence — ${liveWeather.name}` : 'Islamabad Heavy Rainfall Core';

  return (
    <div className="relative">
      <div className="pr-10">
        {/* ── SECTION: OVERVIEW ────────────────────────────────────────── */}
        <section id="section-intel-overview" className="scroll-mt-20 mb-8">
          <header className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-bold">Crisis Intel Desk</h1>
              <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-primary tracking-widest">LIVE</span>
              </div>
            </div>
            <p className="text-on-surface-variant font-label-muted text-[12px]">
              {allSignals.length} signals ingested • {allSignals.filter(s => s.confidence >= 70).length} high-credibility
            </p>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Social', count: allSignals.filter(s=>s.source==='SOCIAL').length, color: 'text-blue-400', icon: 'public' },
              { label: 'Weather', count: allSignals.filter(s=>s.source==='WEATHER').length, color: 'text-[#F59E0B]', icon: 'cloudy_snowing' },
              { label: 'Traffic', count: allSignals.filter(s=>s.source==='TRAFFIC').length, color: 'text-primary', icon: 'directions_car' },
            ].map(stat => (
              <div key={stat.label} className="bg-surface-container rounded-lg p-3 flex flex-col items-center gap-1 border border-outline-variant/25 hover:border-primary/20 transition-all duration-300">
                <span className={`material-symbols-outlined text-[20px] ${stat.color}`}>{stat.icon}</span>
                <span className={`font-data-mono text-[20px] font-bold ${stat.color}`}>{stat.count}</span>
                <span className="font-label-muted text-[9px] text-on-surface-variant uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION: CONFLICT RESOLUTION ─────────────────────────────── */}
        <section id="section-conflict" className="scroll-mt-20 mb-8">
          <h2 className="font-title-sm text-title-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-error rounded-full animate-pulse"></span>
            Conflict Detection & Resolution
          </h2>

          <div className="bg-surface-container border border-outline-variant/35 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 p-3 rounded-lg mb-4">
              <span className="material-symbols-outlined text-[#F59E0B] mt-0.5 flex-shrink-0 animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <div>
                <p className="font-label-muted text-[12px] font-bold text-[#F59E0B] mb-0.5">DISCREPANCY ALERT</p>
                <p className="font-label-muted text-[11px] leading-tight text-on-surface-variant">
                  Conflicting ground truths detected regarding G-10 water levels. Social reports claim active flooding; official municipal line asserts simple main break clearing.
                </p>
              </div>
            </div>

            {/* Side by side validation */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Box 1 */}
              <div className="bg-surface-container-low border border-blue-500/20 p-2.5 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Crowd Source</span>
                  <span className="text-[10px] font-data-mono text-blue-400 font-semibold">Credibility: 75%</span>
                </div>
                <p className="text-[11px] italic text-on-surface-variant leading-snug">"Pani bohut khara ho gaya hai, gaariyan phans rahi hain..."</p>
              </div>
              {/* Box 2 */}
              <div className="bg-surface-container-low border border-[#F59E0B]/20 p-2.5 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-[#F59E0B] font-bold uppercase tracking-wider">Official Feed</span>
                  <span className="text-[10px] font-data-mono text-[#F59E0B] font-semibold">Credibility: 95%</span>
                </div>
                <p className="text-[11px] italic text-on-surface-variant leading-snug">"Road maintenance clears water main burst on G-10 route."</p>
              </div>
            </div>

            {/* AI Resolution progress gauge */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-data-mono text-on-surface-variant">
                <span>AI CREDIBILITY CONVERGENCE</span>
                <span className="text-primary font-bold">RESOLVED ✓</span>
              </div>
              <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
                <div className="bg-blue-400 h-full" style={{ width: '40%' }} title="Crowdsource weight"></div>
                <div className="bg-primary h-full border-x border-background" style={{ width: '50%' }} title="Official weight"></div>
                <div className="bg-outline h-full" style={{ width: '10%' }} title="Uncertainty margin"></div>
              </div>
              <p className="text-[9px] text-outline text-right uppercase font-semibold mt-1">Classification: FLOOD DETECTED (Muted severity)</p>
            </div>
          </div>
        </section>

        {/* ── SECTION: SOCIAL SIGNALS ──────────────────────────────────── */}
        <section id="section-social" className="scroll-mt-20 mb-8">
          <h2 className="font-title-sm text-title-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
            Social Media Ground Truths
          </h2>

          {/* Social Tag Cloud Visual */}
          <div className="flex flex-wrap gap-1.5 mb-4 bg-surface-container p-3 rounded-lg border border-outline-variant/20">
            {[
              { tag: '#G10Flooding', count: '18m', trend: 'up', color: 'text-error' },
              { tag: '#IslamabadRain', count: '42m', trend: 'up', color: 'text-primary' },
              { tag: '#MargallaLandslide', count: '3m', color: 'text-outline' },
              { tag: '#TrafficJam', count: '29m', trend: 'up', color: 'text-secondary' },
              { tag: '#GarmiKeWajaSe', count: '9m', color: 'text-outline' }
            ].map(hashtag => (
              <span key={hashtag.tag} className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded text-[10px] font-data-mono border border-outline-variant/30">
                <span className="text-on-surface font-semibold">{hashtag.tag}</span>
                <span className="text-outline">({hashtag.count})</span>
                {hashtag.trend && (
                  <span className={`material-symbols-outlined text-[10px] ${hashtag.color}`}>trending_up</span>
                )}
              </span>
            ))}
          </div>

          <div className="space-y-stack-gap">
            {filtered.filter(s => s.source === 'SOCIAL' && !s.filtered).map(signal => (
              <div key={signal.id} className="bg-surface-container border-l-4 border-blue-500 p-3.5 rounded-r-lg border-y border-r border-outline-variant/30">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400">public</span>
                    <span className="font-title-sm text-on-surface text-[13px] font-bold">Social Post ({signal.type})</span>
                  </div>
                  <span className="text-[10px] font-data-mono text-outline">
                    {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-on-surface text-[13px] leading-snug mb-3">{signal.content}</p>
                {signal.location && (
                  <span className="inline-flex items-center gap-1 bg-surface-container-low px-2.5 py-0.5 rounded-full text-[10px] text-primary border border-primary/20 uppercase font-semibold">
                    <span className="material-symbols-outlined text-[11px]">location_on</span>
                    {signal.location.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION: WEATHER RADAR ───────────────────────────────────── */}
        <section id="section-weather" className="scroll-mt-20 mb-8">
          <h2 className="font-title-sm text-title-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#F59E0B] rounded-full"></span>
            Met Weather Intelligence
          </h2>

          <div className="grid grid-cols-5 gap-3 bg-surface-container border border-outline-variant/30 rounded-lg p-4 mb-4">
            {/* Circular Gauge */}
            <div className="col-span-2 flex flex-col items-center justify-center border-r border-outline-variant/20 pr-2">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-surface-container-highest" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#F59E0B]" strokeDasharray={`${Math.min(displaysPrecipitation * 2, 100)}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="font-data-mono text-lg font-bold text-on-surface">{displaysPrecipitation}</span>
                  <span className="text-[8px] text-outline uppercase leading-none font-bold">mm/hr</span>
                </div>
              </div>
              <span className="text-[10px] text-outline font-bold mt-2 uppercase tracking-wide">PRECIPITATION</span>
            </div>

            {/* Detailed Data */}
            <div className="col-span-3 flex flex-col justify-between py-1">
              <div>
                <span className="bg-error/15 border border-error/30 text-error font-data-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold">
                  {precipitation > 20 ? 'PMD RED ALERT' : 'LIVE CONDITIONS'}
                </span>
                <p className="text-[12px] font-bold text-on-surface mt-2">{weatherTitle}</p>
                <p className="text-[11px] text-on-surface-variant leading-snug mt-1">{weatherDesc}</p>
              </div>
              <div className="flex gap-4 border-t border-outline-variant/10 pt-2 font-data-mono text-[10px] text-outline">
                <div>HUMIDITY: <span className="text-on-surface font-bold">{humidity}%</span></div>
                <div>WIND: <span className="text-on-surface font-bold">{wind}km/h</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-stack-gap">
            {filtered.filter(s => s.source === 'WEATHER').map(signal => (
              <div key={signal.id} className="bg-surface-container border-l-4 border-[#F59E0B] p-3 rounded-r-lg border-y border-r border-outline-variant/30">
                <p className="text-[11px] font-data-mono text-outline mb-1">WEATHER FEED • CONFIDENCE {signal.confidence}%</p>
                <p className="text-on-surface text-[13px] leading-snug">{signal.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION: TRAFFIC CONTROL ─────────────────────────────────── */}
        <section id="section-traffic" className="scroll-mt-20 mb-8">
          <h2 className="font-title-sm text-title-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-primary rounded-full"></span>
            Traffic Intelligence
          </h2>

          <div className="bg-surface-container border border-outline-variant/30 rounded-lg p-4 mb-4">
            {/* Speed Comparison Graph */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-[11px] font-data-mono text-outline mb-1.5">
                <span>G-10 MAIN BOULEVARD ROUTE SPEED</span>
                <span className="text-error font-bold">93% SPEED LOSS</span>
              </div>
              {/* Normal speed bar */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] text-on-surface-variant font-bold mb-0.5">
                    <span>NORMAL SPEED</span>
                    <span>60 km/h</span>
                  </div>
                  <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-outline rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                {/* Active speed bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-error font-bold mb-0.5">
                    <span>CURRENT CONGESTION SPEED</span>
                    <span>4 km/h</span>
                  </div>
                  <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-error rounded-full animate-pulse" style={{ width: '6.6%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="bg-primary/10 border border-primary/20 text-primary font-data-mono text-[9px] px-2 py-0.5 rounded uppercase">ROUTE BLOCK DETECTED</span>
              <span className="bg-secondary/10 border border-secondary/20 text-secondary font-data-mono text-[9px] px-2 py-0.5 rounded uppercase">REROUTING SIGNAL ISSUED</span>
            </div>
          </div>

          <div className="space-y-stack-gap">
            {filtered.filter(s => s.source === 'TRAFFIC').map(signal => (
              <div key={signal.id} className="bg-surface-container border-l-4 border-primary p-3 rounded-r-lg border-y border-r border-outline-variant/30">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-title-sm text-on-surface text-[13px] font-bold">Traffic Congestion</span>
                  <span className="text-[10px] font-data-mono text-primary font-bold">ACTIVE LOCK</span>
                </div>
                <p className="text-on-surface text-[13px] leading-snug">{signal.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION: SENSOR GRID ─────────────────────────────────────── */}
        <section id="section-sensor" className="scroll-mt-20 mb-8">
          <h2 className="font-title-sm text-title-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-outline rounded-full"></span>
            Telemetry &amp; Sensors
          </h2>

          <div className="bg-surface-container border border-outline-variant/30 rounded-lg p-4 mb-4">
            {/* Animated Waveform Visualizer */}
            <div className="mb-4">
              <p className="text-[11px] font-data-mono text-outline mb-2">LIVE SEISMIC SCAN (MARGALLA FAULTLINE)</p>
              <div className="h-16 bg-surface-container-lowest border border-outline-variant/20 rounded flex items-center justify-center overflow-hidden relative">
                <SeismicWaveVisualizer />
                <div className="absolute top-1 right-2 flex items-center gap-1 font-data-mono text-[9px] text-[#30d158]">
                  <span className="w-1.5 h-1.5 bg-[#30d158] rounded-full animate-ping"></span>
                  STABLE RANGE
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-data-mono text-outline">
              <div className="bg-surface-container-high p-2 rounded">
                MAGNITUDE: <span className="text-on-surface font-bold">M1.2</span>
              </div>
              <div className="bg-surface-container-high p-2 rounded">
                THRESHOLD: <span className="text-primary font-bold">NORMAL (SAFE)</span>
              </div>
            </div>
          </div>

          <div className="space-y-stack-gap">
            {filtered.filter(s => s.source === 'SENSOR').map(signal => (
              <div key={signal.id} className="bg-surface-container border-l-4 border-outline p-3 rounded-r-lg border-y border-r border-outline-variant/30">
                <p className="text-[11px] font-data-mono text-outline mb-1">GEOPHYSICAL SENSOR ARRAY</p>
                <p className="text-on-surface text-[13px] leading-snug">{signal.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION: NOISE FILTERING ─────────────────────────────────── */}
        <section id="section-noise" className="scroll-mt-20 mb-8">
          <h2 className="font-title-sm text-title-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-outline-variant rounded-full"></span>
            Low Credibility Noise Filter
          </h2>

          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-4 mb-4 font-data-mono">
            <div className="flex justify-between items-center text-[10px] text-outline border-b border-outline-variant/15 pb-2 mb-3">
              <span>FILTERED NOISE LOGS</span>
              <span className="text-error font-bold">AUTO_DROP = TRUE</span>
            </div>
            <div className="text-[10px] text-error space-y-1.5">
              <p className="leading-snug">[17:04:12] [WARN] Signal sig-5 blocked (Confidence 30% &lt; Threshold 40%)</p>
              <p className="leading-snug text-on-surface-variant">[17:04:12] [DATA] "G-10 flooding is fake news, just water main..."</p>
              <p className="leading-snug">[17:04:12] [REASON] Source verification failed: Single tweet source with zero retweets/replies.</p>
            </div>
          </div>

          <div className="space-y-stack-gap">
            {filtered.filter(s => s.filtered).map(signal => (
              <div key={signal.id} className="bg-surface-container border-l-4 border-outline-variant p-3 rounded-r-lg border-y border-r border-outline-variant/30 opacity-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-data-mono text-outline">FILTERED SIGNAL ({signal.source})</span>
                  <span className="text-[10px] font-data-mono text-error font-bold">CONFIDENCE {signal.confidence}%</span>
                </div>
                <p className="text-on-surface text-[13px] leading-snug">{signal.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Page scroller sidebar navigation */}
      <PageScroller sections={SECTIONS} />
    </div>
  );
}
