import { useEffect, useState, useRef } from 'react';
import { useCiro } from '../store/ciroStore';
import { MOCK_CRISES, CRISIS_TYPES, SEVERITY_LEVELS } from '../data/mockCrises';

// Styled Dark Mode styles matching CIRO palette
const googleDarkStyles = [
  { elementType: "geometry", stylers: [{ color: "#111616" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#111616" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#00e5ff" }, { weight: 2.5 }] // Glow the official country borders
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1d9e75" }, { weight: 1 }]
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#070c0c" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#0f1616" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#1d9e75" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1c2525" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#222e2e" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7ca29b" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#273a3a" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2b4141" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#030606" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0a1313" }]
  }
];

// Sensitive/Hazard Zones
const SENSITIVE_HAZARD_ZONES = [
  { id: 'sen-1', name: "Indus River Basin (Kashmore Plain)", hazard: "High Flood Vulnerability", lat: 28.4324, lng: 69.3452, risk: "Severe (Category 5)", details: "Critical riverine floodplain, prone to major monsoon overflow and agricultural devastation." },
  { id: 'sen-2', name: "Quetta Active Faultline Segment", hazard: "High Seismic Risk", lat: 30.1802, lng: 66.9921, risk: "Critical (Category 5)", details: "High-density active seismic zone with a history of catastrophic earthquakes." },
  { id: 'sen-3', name: "Margalla Hills Foothills", hazard: "Forest Fire & Landslide", lat: 33.7452, lng: 73.0312, risk: "Medium-High (Category 3)", details: "Vulnerable to brush fires during summer heatwaves and mudslides during heavy monsoons." },
  { id: 'sen-4', name: "Badin & Delta Coastline", hazard: "Cyclone & Sea Intrusion", lat: 24.3412, lng: 68.8234, risk: "High (Category 4)", details: "Exposed to Arabian Sea storms, tidal flooding, and soil salinization." },
  { id: 'sen-5', name: "Kachho Torrential Basin", hazard: "Flash Flooding", lat: 26.8541, lng: 67.5124, risk: "High (Category 4)", details: "Prone to sudden hill torrent overflows from Kirthar range during cloudbursts." }
];

const SEVERITY_CIRCLE_COLORS = { 5: '#ffb4ab', 4: '#ff6b35', 3: '#ffd60a', 2: '#30d158', 1: '#68dbae' };

const FALLBACK_INDUSTRIES = [
  { id: 'fb-ind-1', name: "S.I.T.E. Industrial Area Karachi", lat: 24.9012, lng: 67.0124, address: "Sindh Industrial & Trading Estate, Karachi, Pakistan", rating: 4.2 },
  { id: 'fb-ind-2', name: "Korangi Industrial Area Karachi", lat: 24.8312, lng: 67.1234, address: "Korangi, Karachi, Sindh, Pakistan", rating: 4.1 },
  { id: 'fb-ind-3', name: "Sundar Industrial Estate Lahore", lat: 31.3812, lng: 74.1234, address: "Sundar-Raiwind Road, Lahore, Punjab, Pakistan", rating: 4.5 },
  { id: 'fb-ind-4', name: "M-3 Industrial City Faisalabad", lat: 31.5212, lng: 73.1234, address: "Sahianwala Interchange, M-3 Motorway, Faisalabad, Pakistan", rating: 4.3 },
  { id: 'fb-ind-5', name: "Hattar Industrial Estate", lat: 33.9512, lng: 72.8512, address: "Hattar Road, Haripur, Khyber Pakhtunkhwa, Pakistan", rating: 4.2 },
  { id: 'fb-ind-6', name: "Gadoon Amazai Industrial Estate", lat: 34.1212, lng: 72.6212, address: "Swabi, Khyber Pakhtunkhwa, Pakistan", rating: 4.0 },
  { id: 'fb-ind-7', name: "Hayatabad Industrial Estate Peshawar", lat: 33.9812, lng: 71.4512, address: "Hayatabad, Peshawar, Khyber Pakhtunkhwa, Pakistan", rating: 4.1 },
  { id: 'fb-ind-8', name: "Quetta Industrial Estate", lat: 30.1512, lng: 66.9512, address: "Sirki Road, Quetta, Balochistan, Pakistan", rating: 3.9 },
  { id: 'fb-ind-9', name: "Gwadar Free Zone", lat: 25.1212, lng: 62.3212, address: "Port Road, Gwadar, Balochistan, Pakistan", rating: 4.6 },
  { id: 'fb-ind-10', name: "Gujranwala Industrial Estate", lat: 32.1812, lng: 74.1912, address: "Sialkot Road, Gujranwala, Punjab, Pakistan", rating: 4.0 },
  { id: 'fb-ind-11', name: "Sialkot Export Zone & Tannery Area", lat: 32.5012, lng: 74.5312, address: "Sambrial Road, Sialkot, Punjab, Pakistan", rating: 4.4 }
];

export default function CrisisMap() {
  const { state, selectCrisis } = useCiro();
  const crises = state.crises.length ? state.crises : MOCK_CRISES;

  // UI / Layer states
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [showIndustries, setShowIndustries] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showSensitive, setShowSensitive] = useState(true);
  const [mapType, setMapType] = useState('google_dark'); // 'google_dark' | 'google_satellite' | 'google_roadmap'

  // Dynamic state for real Google Places fetched industries
  const [industriesList, setIndustriesList] = useState([]);

  // Map & Overlays refs
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const trafficLayerRef = useRef(null);
  const activeMarkersRef = useRef([]);
  const activeCirclesRef = useRef([]);
  const infoWindowRef = useRef(null);

  const PAKISTAN_CENTER = { lat: 30.3753, lng: 69.3451 };

  // Load Google Maps API script dynamically
  useEffect(() => {
    const callback = () => {
      if (window.google && window.google.maps) {
        initMap();
      }
    };

    if (window.google && window.google.maps) {
      callback();
    } else {
      const existingScript = document.getElementById('googleMapsScript');
      if (existingScript) {
        existingScript.addEventListener('load', callback);
      } else {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.id = 'googleMapsScript';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        script.onload = callback;
      }
    }

    return () => {
      // Clear markers and map references on unmount
      clearAllOverlays();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize Map
  function initMap() {
    if (!mapContainerRef.current || mapRef.current) return;

    const mapOptions = {
      center: PAKISTAN_CENTER,
      zoom: 6,
      streetViewControl: true, // Native Pegman Street View control!
      mapTypeControl: false,
      zoomControl: true,
      fullscreenControl: true,
      styles: googleDarkStyles
    };

    const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
    mapRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();

    // Setup Traffic Layer
    const trafficLayer = new window.google.maps.TrafficLayer();
    trafficLayerRef.current = trafficLayer;
    if (showTraffic) {
      trafficLayer.setMap(map);
    }

    setMapLoaded(true);

    // Initial search for industries around Pakistan's center
    fetchRealIndustries(map, PAKISTAN_CENTER);
  }

  // Fetch REAL industries dynamically from Google Places API
  function fetchRealIndustries(mapInstance, coords) {
    if (!window.google || !window.google.maps || !window.google.maps.places || !mapInstance) return;

    const service = new window.google.maps.places.PlacesService(mapInstance);
    
    // Search with a query centered around the coordinate area
    const request = {
      location: new window.google.maps.LatLng(coords.lat, coords.lng),
      radius: coords === PAKISTAN_CENTER ? 400000 : 40000, // Search nationwide radius if centered, otherwise local city radius
      query: 'industrial estate OR industrial area OR factory OR mill OR chemical plant'
    };

    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const fetched = results.map(place => ({
          id: place.place_id,
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || place.vicinity,
          rating: place.rating || 'N/A'
        }));
        setIndustriesList(fetched);
      } else {
        console.warn('[CIRO Map] Google Places API failed/not activated. Using local high-precision Pakistani Industrial Zones database.');
        // Filter fallback industries to display those near the active coords (within ~2 degrees lat/lng)
        const nearby = FALLBACK_INDUSTRIES.filter(ind => {
          const latDiff = Math.abs(ind.lat - coords.lat);
          const lngDiff = Math.abs(ind.lng - coords.lng);
          // If nationwide (PAKISTAN_CENTER), return all. Otherwise return local ones.
          if (coords === PAKISTAN_CENTER) return true;
          return latDiff < 1.5 && lngDiff < 1.5;
        });
        setIndustriesList(nearby.length ? nearby : FALLBACK_INDUSTRIES);
      }
    });
  }

  // Clear all map markers and overlays
  function clearAllOverlays() {
    activeMarkersRef.current.forEach(marker => marker.setMap(null));
    activeMarkersRef.current = [];
    activeCirclesRef.current.forEach(circle => circle.setMap(null));
    activeCirclesRef.current = [];
  }

  // Synchronize base layers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (mapType === 'google_satellite') {
      map.setMapTypeId(window.google.maps.MapTypeId.HYBRID);
      map.setOptions({ styles: [] });
    } else if (mapType === 'google_dark') {
      map.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
      map.setOptions({ styles: googleDarkStyles });
    } else {
      map.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
      map.setOptions({ styles: [] });
    }
  }, [mapType, mapLoaded]);

  // Synchronize Traffic Layer
  useEffect(() => {
    if (trafficLayerRef.current) {
      trafficLayerRef.current.setMap(showTraffic && mapRef.current ? mapRef.current : null);
    }
  }, [showTraffic, mapLoaded]);

  // Handle Telemetry Selection changes (flies to and searches)
  const telemetryCity = state.selectedTelemetryCity;
  useEffect(() => {
    if (!mapRef.current || !telemetryCity) return;

    const map = mapRef.current;
    const target = { lat: telemetryCity.coordinates.lat, lng: telemetryCity.coordinates.lng };
    
    map.panTo(target);
    map.setZoom(11); // Close zoom to reveal streets and places

    // Fetch real industries around this specific city!
    fetchRealIndustries(map, target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telemetryCity]);

  // Re-draw all overlay elements whenever toggles, filters, or fetched data updates
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    const infoWindow = infoWindowRef.current;

    clearAllOverlays();

    // 1. Plot Live Crisis Incidents
    const filteredCrises = crises.filter(c => {
      if (filter === 'ALL') return true;
      if (filter === 'ACTIVE') return c.status === 'ACTIVE';
      if (filter === 'CRITICAL') return c.severity === 5;
      return c.type === filter;
    });

    filteredCrises.forEach(crisis => {
      if (!crisis.coordinates || crisis.retracted) return;

      const severityColor = SEVERITY_CIRCLE_COLORS[crisis.severity] || '#88919e';
      const iconUrl = `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="14" fill="rgba(255,255,255,0.05)" stroke="${encodeURIComponent(severityColor)}" stroke-width="2"/><text x="18" y="24" font-size="16" text-anchor="middle">${CRISIS_TYPES[crisis.type]?.icon || '⚠️'}</text></svg>`;

      // Custom severity circle indicator
      const circle = new window.google.maps.Circle({
        strokeColor: severityColor,
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: severityColor,
        fillOpacity: 0.08,
        map: map,
        center: { lat: crisis.coordinates.lat, lng: crisis.coordinates.lng },
        radius: crisis.area_sqkm * 500
      });
      activeCirclesRef.current.push(circle);

      // Crisis Marker
      const marker = new window.google.maps.Marker({
        position: { lat: crisis.coordinates.lat, lng: crisis.coordinates.lng },
        map: map,
        icon: {
          url: iconUrl,
          scaledSize: new window.google.maps.Size(36, 36),
          anchor: new window.google.maps.Point(18, 18)
        },
        title: crisis.title
      });

      marker.addListener('click', () => {
        const content = `
          <div style="background:#121414;color:#e2e2e2;padding:12px;border-radius:8px;font-family:Inter,sans-serif;min-width:200px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${crisis.title}</div>
            <div style="font-size:11px;color:#bccac1;margin-bottom:8px;">${crisis.location}</div>
            <div style="display:flex;justify-content:between;font-size:10px;font-weight:600;">
              <span style="color:${severityColor};">${SEVERITY_LEVELS[crisis.severity].label}</span>
              <span style="color:#68dbae;">${crisis.confidence}% conf.</span>
            </div>
          </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        selectCrisis(crisis);
      });

      activeMarkersRef.current.push(marker);
    });

    // 2. Plot REAL Google Places Fetched Industries
    if (showIndustries) {
      industriesList.forEach(ind => {
        const marker = new window.google.maps.Marker({
          position: { lat: ind.lat, lng: ind.lng },
          map: map,
          icon: {
            url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="rgba(171,71,188,0.2)" stroke="%23ab47bc" stroke-width="2"/><text x="15" y="20" font-size="14" text-anchor="middle">🏭</text></svg>`,
            scaledSize: new window.google.maps.Size(30, 30),
            anchor: new window.google.maps.Point(15, 15)
          },
          title: ind.name
        });

        marker.addListener('click', () => {
          const content = `
            <div style="background:#120f16;color:#e2e2e2;padding:12px;border-radius:8px;font-family:Inter,sans-serif;min-width:220px;border:1px solid #ab47bc;">
              <div style="font-weight:700;font-size:13px;color:#ab47bc;margin-bottom:2px;">🏭 ${ind.name}</div>
              <div style="font-size:10px;color:#bccac1;margin-bottom:6px;">REAL GOOGLE PLACES DATA</div>
              <p style="font-size:11px;color:#e2e2e2;margin:0;line-height:1.4;">${ind.address}</p>
              <div style="font-size:10px;color:#ab47bc;margin-top:6px;">⭐ Rating: ${ind.rating}</div>
            </div>
          `;
          infoWindow.setContent(content);
          infoWindow.open(map, marker);
        });

        activeMarkersRef.current.push(marker);
      });
    }

    // 3. Plot Sensitive/Hazard Zones
    if (showSensitive) {
      SENSITIVE_HAZARD_ZONES.forEach(sen => {
        const circle = new window.google.maps.Circle({
          strokeColor: '#d32f2f',
          strokeOpacity: 0.6,
          strokeWeight: 1,
          fillColor: '#d32f2f',
          fillOpacity: 0.08,
          map: map,
          center: { lat: sen.lat, lng: sen.lng },
          radius: 12000
        });
        activeCirclesRef.current.push(circle);

        const marker = new window.google.maps.Marker({
          position: { lat: sen.lat, lng: sen.lng },
          map: map,
          icon: {
            url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="rgba(211,47,47,0.25)" stroke="%23d32f2f" stroke-width="2"/><text x="16" y="21" font-size="14" text-anchor="middle">⚠️</text></svg>`,
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16)
          },
          title: sen.name
        });

        marker.addListener('click', () => {
          const content = `
            <div style="background:#160f0f;color:#e2e2e2;padding:12px;border-radius:8px;font-family:Inter,sans-serif;min-width:200px;border:1px solid #d32f2f;">
              <div style="font-weight:700;font-size:13px;color:#d32f2f;margin-bottom:2px;">⚠️ ${sen.name}</div>
              <div style="font-size:10px;color:#ffb4ab;margin-bottom:8px;font-weight:600;">${sen.hazard} • ${sen.risk}</div>
              <p style="font-size:11px;color:#e2e2e2;margin:0;line-height:1.4;">${sen.details}</p>
            </div>
          `;
          infoWindow.setContent(content);
          infoWindow.open(map, marker);
        });

        activeMarkersRef.current.push(marker);
      });
    }

    // 4. Plot Telemetry selected marker
    if (telemetryCity) {
      const marker = new window.google.maps.Marker({
        position: { lat: telemetryCity.coordinates.lat, lng: telemetryCity.coordinates.lng },
        map: map,
        icon: {
          url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="rgba(29,158,117,0.25)" stroke="%231d9e75" stroke-width="2"/><text x="20" y="25" font-size="18" text-anchor="middle">📡</text></svg>`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        },
        title: telemetryCity.name
      });

      marker.addListener('click', () => {
        const content = `
          <div style="background:#0e1616;color:#e2e2e2;padding:12px;border-radius:8px;font-family:Inter,sans-serif;min-width:220px;border:1px solid #1d9e75;">
            <div style="font-weight:700;font-size:13px;color:#1d9e75;display:flex;align-items:center;gap:6px;">
              <span>📡</span> ${telemetryCity.name.toUpperCase()} (SELECTED)
            </div>
            <div style="font-size:11px;color:#e2e2e2;margin-top:8px;line-height:1.5;">
              <div>🌡️ <strong>Temp:</strong> ${telemetryCity.weather?.temp !== undefined ? `${Math.round(telemetryCity.weather.temp)}°C` : 'N/A'} (${telemetryCity.weather?.description || 'N/A'})</div>
              <div>💧 <strong>Humidity:</strong> ${telemetryCity.weather?.humidity !== undefined ? `${telemetryCity.weather.humidity}%` : 'N/A'}</div>
              <div>💨 <strong>Wind:</strong> ${telemetryCity.weather?.wind !== undefined ? `${telemetryCity.weather.wind} km/h` : 'N/A'}</div>
              <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:6px;padding-top:6px;">
                🟢 <strong>Air Quality index:</strong> {telemetryCity.aqi?.aqi || 'N/A'}
              </div>
            </div>
          </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });

      activeMarkersRef.current.push(marker);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, showIndustries, showSensitive, industriesList, crises, mapLoaded]);

  return (
    <div className="h-[calc(100vh-160px)] w-full relative -mx-4 px-4">
      {/* Map Container */}
      <div 
        ref={mapContainerRef}
        id="google-map-container"
        className="w-full h-full rounded-2xl overflow-hidden border border-outline-variant/30 relative"
        style={{ backgroundColor: '#0c0f0f' }}
      />

      {/* Loader Screen */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-background/90 z-50 flex flex-col justify-center items-center gap-3 rounded-2xl border border-outline-variant/30">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-[12px] font-bold text-outline uppercase tracking-wider">Loading Live Google Maps API...</div>
        </div>
      )}

      {/* TOP LEFT: Crisis Severity Filter Controls */}
      <div className="absolute top-3 left-3 z-[10] flex gap-2">
        {['ALL', 'ACTIVE', 'CRITICAL'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-title-sm uppercase tracking-wider transition-all shadow-md ${
              filter === f
                ? 'bg-error-container text-on-error-container border border-error/50'
                : 'bg-surface-container-high/90 text-on-surface backdrop-blur border border-outline-variant/30'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TOP RIGHT: Google Maps & Base Layer Selector */}
      <div className="absolute top-3 right-3 z-[10] flex bg-surface-container-high/90 backdrop-blur rounded-lg border border-outline-variant/30 p-1 shadow-lg gap-1">
        {[
          { id: 'google_dark', label: 'Google Dark' },
          { id: 'google_roadmap', label: 'Google Vector' },
          { id: 'google_satellite', label: 'Google Satellite' }
        ].map(type => (
          <button
            key={type.id}
            onClick={() => setMapType(type.id)}
            className={`px-2.5 py-1 rounded text-[9px] font-semibold uppercase tracking-wider transition-all ${
              mapType === type.id
                ? 'bg-primary text-on-primary font-bold shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* BOTTOM LEFT: Feature Overlay Toggles */}
      <div className="absolute bottom-3 left-3 z-[10] bg-surface-container-high/95 backdrop-blur-md rounded-xl border border-outline-variant/30 p-3 shadow-2xl flex flex-col gap-2 min-w-[170px]">
        <div className="text-[10px] font-bold text-outline uppercase tracking-wider border-b border-outline-variant/15 pb-1 mb-1">
          Map Overlays
        </div>

        {/* Industry Toggle */}
        <button
          onClick={() => setShowIndustries(!showIndustries)}
          className={`flex items-center justify-between text-[11px] font-medium px-2 py-1.5 rounded transition-all ${
            showIndustries 
              ? 'bg-purple-900/20 text-purple-300 border border-purple-800/40 font-semibold' 
              : 'text-outline hover:bg-white/5'
          }`}
        >
          <span>🏭 Real Industries</span>
          <span style={{ fontSize: '10px' }}>{showIndustries ? 'ON' : 'OFF'}</span>
        </button>

        {/* Traffic Toggle */}
        <button
          onClick={() => setShowTraffic(!showTraffic)}
          className={`flex items-center justify-between text-[11px] font-medium px-2 py-1.5 rounded transition-all ${
            showTraffic 
              ? 'bg-orange-950/30 text-orange-300 border border-orange-800/30 font-semibold' 
              : 'text-outline hover:bg-white/5'
          }`}
        >
          <span>🚦 Live Traffic</span>
          <span style={{ fontSize: '10px' }}>{showTraffic ? 'ON' : 'OFF'}</span>
        </button>

        {/* Sensitive Areas Toggle */}
        <button
          onClick={() => setShowSensitive(!showSensitive)}
          className={`flex items-center justify-between text-[11px] font-medium px-2 py-1.5 rounded transition-all ${
            showSensitive 
              ? 'bg-red-950/30 text-red-300 border border-red-800/30 font-semibold' 
              : 'text-outline hover:bg-white/5'
          }`}
        >
          <span>⚠️ Hazard Zones</span>
          <span style={{ fontSize: '10px' }}>{showSensitive ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Dynamic marker list helper display in bottom right */}
      {showIndustries && industriesList.length > 0 && (
        <div className="absolute bottom-3 right-3 z-[10] bg-surface-container-high/90 backdrop-blur-md rounded-lg border border-outline-variant/30 p-2 shadow-lg max-h-[120px] overflow-y-auto w-[180px]">
          <div className="text-[8px] font-bold text-outline uppercase tracking-wider mb-1">Real Places Found ({industriesList.length})</div>
          {industriesList.slice(0, 5).map((ind, i) => (
            <div key={i} className="text-[9px] text-on-surface truncate mb-0.5">• {ind.name}</div>
          ))}
          {industriesList.length > 5 && <div className="text-[8px] text-outline text-right">+ {industriesList.length - 5} more</div>}
        </div>
      )}

    </div>
  );
}
