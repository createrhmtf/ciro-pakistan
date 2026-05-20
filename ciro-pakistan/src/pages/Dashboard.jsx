import { useState, useEffect } from 'react';
import { useCiro } from '../store/ciroStore';
import { MOCK_CRISES, SEVERITY_LEVELS } from '../data/mockCrises';
import { useNavigate } from 'react-router-dom';
import PageScroller from '../components/common/PageScroller';
import WorkflowControl from '../components/WorkflowControl';
import { apiService } from '../services/api';

const SECTIONS = [
  { id: 'section-status', label: 'Status', icon: 'monitoring' },
  { id: 'section-ongoing', label: 'Ongoing Crises', icon: 'warning' },
  { id: 'section-actions', label: 'Actions', icon: 'bolt' },
  { id: 'section-weather-selector', label: 'Live Met Check', icon: 'thermostat' },
  { id: 'section-intel', label: 'Intelligence', icon: 'analytics' },
];

const PAKISTAN_CITIES = [
  'Islamabad',
  'Karachi',
  'Lahore',
  'Peshawar',
  'Quetta',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Sialkot',
  'Hyderabad',
  'Gujranwala',
  'Sargodha',
  'Bahawalpur',
  'Sukkur',
  'Larkana',
  'Sheikhupura',
  'Muzaffarabad',
  'Gilgit',
  'Gwadar',
  'Murree',
  'Abbottabad',
  'Chaman',
  'Naran'
];

function getAQIColor(aqi) {
  if (aqi <= 50) return 'text-[#30d158]';
  if (aqi <= 100) return 'text-[#ffd60a]';
  if (aqi <= 150) return 'text-[#ff9500]';
  return 'text-[#ff3b30]';
}

function getAQIDesc(aqi) {
  if (aqi <= 50) return 'Healthy air';
  if (aqi <= 100) return 'Moderate air';
  if (aqi <= 150) return 'Mild pollution';
  return 'Hazardous air';
}

const CITY_COORDINATES = {
  'Islamabad': { lat: 33.6844, lng: 73.0479 },
  'Karachi': { lat: 24.8607, lng: 67.0011 },
  'Lahore': { lat: 31.5204, lng: 74.3587 },
  'Peshawar': { lat: 34.0151, lng: 71.5249 },
  'Quetta': { lat: 30.1798, lng: 66.9750 },
  'Rawalpindi': { lat: 33.5651, lng: 73.0169 },
  'Faisalabad': { lat: 31.4504, lng: 73.1350 },
  'Multan': { lat: 30.1575, lng: 71.5249 },
  'Sialkot': { lat: 32.4945, lng: 74.5229 },
  'Hyderabad': { lat: 25.3960, lng: 68.3578 },
  'Gujranwala': { lat: 32.1877, lng: 74.1945 },
  'Sargodha': { lat: 32.0836, lng: 72.6711 },
  'Bahawalpur': { lat: 29.3544, lng: 71.6911 },
  'Sukkur': { lat: 27.7244, lng: 68.8228 },
  'Larkana': { lat: 27.5589, lng: 68.2099 },
  'Sheikhupura': { lat: 31.7130, lng: 73.9783 },
  'Muzaffarabad': { lat: 34.3700, lng: 73.4711 },
  'Gilgit': { lat: 35.8819, lng: 74.4643 },
  'Gwadar': { lat: 25.1216, lng: 62.3254 },
  'Murree': { lat: 33.9070, lng: 73.3943 },
  'Abbottabad': { lat: 34.1688, lng: 73.2215 },
  'Chaman': { lat: 30.9213, lng: 66.4597 },
  'Naran': { lat: 34.9048, lng: 73.6521 }
};

export default function Dashboard() {
  const { state, setTelemetryCity } = useCiro();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('Islamabad');
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLiveDataForCity = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const weather = await apiService.getWeather(city);
      const aqi = await apiService.getEnvironment(city);
      setLiveData({ weather, aqi });
      
      // Update global telemetry city context
      setTelemetryCity({
        name: city,
        weather,
        aqi,
        coordinates: CITY_COORDINATES[city] || { lat: 30.3753, lng: 69.3451 }
      });
    } catch (err) {
      console.error('Failed to load telemetry for selected city:', err);
      setError('Could not connect to live telemetry server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLiveDataForCity('Islamabad');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCityChange = (city) => {
    setSelectedCity(city);
    fetchLiveDataForCity(city);
  };

  const crises = state.crises.length ? state.crises : MOCK_CRISES;
  
  const activeCrises = crises.filter(c => c.status === 'ACTIVE' || c.status === 'MONITORING');
  const criticalCrises = activeCrises.filter(c => c.severity >= 4);

  return (
    <div className="relative pb-8">
      <div className="pr-10">
        <WorkflowControl />

        {/* Status Summary Row */}
        <section id="section-status" className="scroll-mt-20 grid grid-cols-3 gap-3 mt-section-margin">
          {/* Active Crises */}
          <div className="bg-surface-container border border-error/20 p-3 rounded-lg flex flex-col items-center justify-center text-center">
            <span className="text-label-muted font-label-muted text-outline mb-1 text-[11px] uppercase tracking-tighter">Active Crises</span>
            <span className="font-headline-lg text-error text-3xl font-extrabold">{activeCrises.length}</span>
            <div className="w-full h-1 bg-error/10 mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-error" style={{ width: `${Math.min(activeCrises.length * 20, 100)}%` }}></div>
            </div>
          </div>

          {/* Signals Today */}
          <div className="bg-surface-container border border-secondary/20 p-3 rounded-lg flex flex-col items-center justify-center text-center">
            <span className="text-label-muted font-label-muted text-outline mb-1 text-[11px] uppercase tracking-tighter">Signals Today</span>
            <span className="font-headline-lg text-secondary text-3xl font-extrabold">247</span>
            <div className="w-full h-1 bg-secondary/10 mt-2 rounded-full overflow-hidden">
              <div className="w-full h-full bg-secondary"></div>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-surface-container border border-primary/20 p-3 rounded-lg flex flex-col items-center justify-center text-center">
            <span className="text-label-muted font-label-muted text-outline mb-1 text-[11px] uppercase tracking-tighter">Avg Response</span>
            <span className="font-headline-lg text-primary text-3xl font-extrabold">28s</span>
            <div className="w-full h-1 bg-primary/10 mt-2 rounded-full overflow-hidden">
              <div className="w-4/5 h-full bg-primary"></div>
            </div>
          </div>
        </section>

        {/* Active Crisis Stack */}
        <section id="section-ongoing" className="scroll-mt-20 mt-section-margin space-y-stack-gap">
          <h2 className="font-title-sm text-title-sm text-on-surface flex items-center gap-2">
            <span className="w-1.5 h-4 bg-error rounded-full"></span>
            Ongoing Situations
          </h2>

          {criticalCrises.slice(0, 2).map((crisis) => {
            const sevInfo = SEVERITY_LEVELS[crisis.severity];
            // Determine card border color based on severity
            const borderColorClass = crisis.severity === 5 ? 'border-l-error' : 'border-l-secondary';
            const badgeBgClass = crisis.severity === 5 ? 'bg-error' : 'bg-secondary';
            const badgeTextClass = crisis.severity === 5 ? 'text-on-error' : 'text-on-secondary';
            const fillClass = crisis.severity === 5 ? 'bg-primary' : 'bg-primary';

            return (
              <div key={crisis.id} className={`bg-surface-container border-l-4 ${borderColorClass} border-y border-r border-outline-variant/30 rounded-r-lg overflow-hidden`}>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-on-surface font-bold text-lg leading-none">{crisis.title}</h3>
                      <div className="flex items-center gap-1 mt-1 text-outline">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                        <span className="font-data-mono text-[11px] uppercase">{crisis.location}</span>
                      </div>
                    </div>
                    <span className={`${badgeBgClass} ${badgeTextClass} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest`}>
                      {sevInfo.label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-[10px] text-outline uppercase font-bold block mb-1">Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className={`h-full ${fillClass}`} style={{ width: `${crisis.confidence}%` }}></div>
                        </div>
                        <span className="font-data-mono text-[12px] text-primary">{crisis.confidence}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-outline uppercase font-bold block mb-1">Status</span>
                      <span className="font-data-mono text-[12px] text-on-surface uppercase">{crisis.status}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate('/map')}
                      className="flex-1 border border-primary text-primary font-bold py-2 rounded-lg text-sm active:scale-95 transition-transform"
                    >
                      VIEW MAP
                    </button>
                    <button className={`flex-1 ${badgeBgClass} ${badgeTextClass} font-bold py-2 rounded-lg text-sm active:scale-95 transition-transform`}>
                      DEPLOY RESPONSE
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Recent Actions Section */}
        <section id="section-actions" className="scroll-mt-20 mt-section-margin">
          <h2 className="font-title-sm text-title-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-primary rounded-full"></span>
            Automated Actions
          </h2>
          <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
            <div className="flex-none bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>alt_route</span>
              <span className="text-primary font-bold text-sm whitespace-nowrap">Traffic rerouted ✓</span>
            </div>
            <div className="flex-none bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              <span className="text-primary font-bold text-sm whitespace-nowrap">Alert sent ✓</span>
            </div>
            <div className="flex-none bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
              <span className="text-primary font-bold text-sm whitespace-nowrap">Ticket created ✓</span>
            </div>
          </div>
        </section>

        {/* Live Weather & Environment Check Selector Section */}
        <section id="section-weather-selector" className="scroll-mt-20 mt-section-margin">
          <h2 className="font-title-sm text-title-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-primary rounded-full"></span>
            Live Regional Telemetry Check
          </h2>
          <div className="bg-surface-container border border-outline-variant/30 rounded-lg p-4 shadow-lg space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-outline uppercase tracking-wider">Select Pakistan Region</label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/50 text-on-surface text-sm rounded-lg px-3 py-2.5 outline-none focus:border-primary/50 transition-colors duration-200 appearance-none font-semibold cursor-pointer"
                >
                  {PAKISTAN_CITIES.map((city) => (
                    <option key={city} value={city} className="bg-surface-container-high text-on-surface">
                      {city}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-outline">
                  <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[11px] text-outline uppercase font-semibold tracking-wider">Fetching live data...</span>
              </div>
            ) : error ? (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3 text-center">
                <span className="text-[12px] text-error font-medium">{error}</span>
              </div>
            ) : (
              liveData && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Weather Telemetry Card */}
                  <div className="bg-surface-container-high border border-outline-variant/20 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-[#F59E0B] text-lg">cloudy_snowing</span>
                        <span className="text-[10px] text-outline font-bold uppercase tracking-wider">Weather Status</span>
                      </div>
                      <span className="font-data-mono text-3xl font-extrabold text-on-surface">{Math.round(liveData.weather.temp)}°C</span>
                      <p className="text-[11px] text-on-surface-variant font-medium mt-1 uppercase tracking-wide capitalize">{liveData.weather.description}</p>
                    </div>
                    <div className="border-t border-outline-variant/10 pt-2 mt-3 flex flex-col gap-1 text-[10px] text-outline font-semibold">
                      <div className="flex justify-between">
                        <span>RAIN PRECIP:</span>
                        <span className="text-on-surface font-bold">{(liveData.weather.precipitation_mm || liveData.weather.rain?.['1h'] || 0.0)} mm/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HUMIDITY:</span>
                        <span className="text-on-surface font-bold">{liveData.weather.humidity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>WIND:</span>
                        <span className="text-on-surface font-bold">{liveData.weather.wind} km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* AQI Telemetry Card */}
                  <div className="bg-surface-container-high border border-outline-variant/20 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-primary text-lg">nature_people</span>
                        <span className="text-[10px] text-outline font-bold uppercase tracking-wider">Air Quality (AQI)</span>
                      </div>
                      <span className={`font-data-mono text-3xl font-extrabold ${getAQIColor(liveData.aqi.aqi)}`}>{liveData.aqi.aqi}</span>
                      <p className="text-[11px] text-on-surface-variant font-medium mt-1 uppercase tracking-wide">{getAQIDesc(liveData.aqi.aqi)}</p>
                    </div>
                    <div className="border-t border-outline-variant/10 pt-2 mt-3 flex flex-col gap-1 text-[10px] text-outline font-semibold">
                      <div className="flex justify-between">
                        <span>PM2.5 POLLUTANT:</span>
                        <span className="text-on-surface font-bold">{liveData.aqi.pm25} µg/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SOURCE:</span>
                        <span className="text-on-surface font-bold uppercase">{liveData.aqi.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Live Status:</span>
                        <span className={`font-bold ${liveData.aqi.aqi > 150 ? 'text-error' : 'text-primary'}`}>
                          {liveData.aqi.aqi > 150 ? 'ALERT' : 'STABLE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Intelligence Chip / Status Details */}
        <section id="section-intel" className="scroll-mt-20 mt-section-margin">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-surface-container-highest rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-on-surface-variant leading-tight">
                  AI monitoring system detecting unusual seismic activity in Northern sector. Recommendation: Escalated watch state.
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="bg-surface-variant text-on-surface-variant text-[9px] font-data-mono px-2 py-0.5 rounded uppercase tracking-tighter">AI-GEN-04</span>
                  <span className="bg-surface-variant text-on-surface-variant text-[9px] font-data-mono px-2 py-0.5 rounded uppercase tracking-tighter">SIG-STABLE</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <PageScroller sections={SECTIONS} />
    </div>
  );
}
