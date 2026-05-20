// ── Mock Raw Signals ─────────────────────────────────────────────────────────
// Simulating multi-source signals: social media, weather API, traffic API, reports
// Includes English, Urdu, and Roman Urdu

export const MOCK_SIGNALS = [
  // Scenario A: Multi-Crisis
  {
    id: 'sig_001',
    source: 'twitter',
    language: 'roman_urdu',
    raw: 'G-10 mein pani bhar gaya, ghar ke andar ghus gaya paani!! Help karo koi',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    location_hint: 'G-10, Islamabad',
    coordinates: { lat: 33.6844, lng: 73.0474 },
    metadata: { username: '@IslamabadResident', retweets: 234, urgency_keywords: ['pani', 'help'] }
  },
  {
    id: 'sig_002',
    source: 'weather_api',
    language: 'english',
    raw: 'PMD Alert: Heavy rainfall 85mm/hr recorded in G-sector Islamabad. Flash flood risk EXTREME. Duration: ongoing.',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    location_hint: 'Islamabad',
    coordinates: { lat: 33.6844, lng: 73.0479 },
    metadata: { agency: 'PMD', rainfall_mm: 85, risk_level: 'EXTREME' }
  },
  {
    id: 'sig_003',
    source: 'twitter',
    language: 'roman_urdu',
    raw: 'SITE industrial area mein factory mein aag lag gayi bhai, bohot bari aag hai, fire brigade nahi aa rahi!!',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    location_hint: 'SITE Area, Karachi',
    coordinates: { lat: 24.8841, lng: 67.0229 },
    metadata: { username: '@KarachiAlert', retweets: 891, urgency_keywords: ['aag', 'fire', 'brigade'] }
  },
  {
    id: 'sig_004',
    source: 'emergency_report',
    language: 'english',
    raw: 'Emergency Report #2847: Industrial fire at SITE Area Factory Block-C. Multiple casualties reported. Toxic smoke spreading to residential zone.',
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
    location_hint: 'SITE Area, Karachi',
    coordinates: { lat: 24.8841, lng: 67.0229 },
    metadata: { report_id: 'ER-2847', reporter: 'EDHI Foundation', casualties_reported: 'multiple' }
  },
  {
    id: 'sig_005',
    source: 'seismic_api',
    language: 'english',
    raw: 'USGS/PMDFC: Earthquake M4.2 detected 15km NW of Quetta. Depth: 12km. Shaking intensity: MODERATE-STRONG.',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    location_hint: 'Quetta, Balochistan',
    coordinates: { lat: 30.2010, lng: 67.0109 },
    metadata: { magnitude: 4.2, depth_km: 12, agency: 'PMDFC-Seismic' }
  },
  {
    id: 'sig_006',
    source: 'twitter',
    language: 'english',
    raw: 'Earthquake felt in Quetta right now! Buildings shaking. People running out. Is anyone else feeling this?? #QuettaEarthquake',
    timestamp: new Date(Date.now() - 11 * 60000).toISOString(),
    location_hint: 'Quetta',
    coordinates: { lat: 30.2010, lng: 67.0109 },
    metadata: { username: '@QuettaCity', retweets: 1204 }
  },
  {
    id: 'sig_007',
    source: 'weather_api',
    language: 'english',
    raw: 'PMD Heatwave Warning: Lahore temperature 44°C. Heat index 49°C. Dangerous conditions for elderly and children. Duration: 3 days.',
    timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    location_hint: 'Lahore, Punjab',
    coordinates: { lat: 31.5204, lng: 74.3587 },
    metadata: { temperature_c: 44, heat_index_c: 49, duration_days: 3 }
  },
  {
    id: 'sig_008',
    source: 'traffic_api',
    language: 'english',
    raw: 'Traffic Intelligence System: M2 Motorway Lahore-Islamabad km 220 BLOCKED. Multi-vehicle accident. Estimated clearance: 4-6 hours. 800+ vehicles affected.',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    location_hint: 'M2 Motorway, Punjab',
    coordinates: { lat: 32.6340, lng: 73.2097 },
    metadata: { road: 'M2 Motorway', km: 220, vehicles_affected: 800 }
  },
  {
    id: 'sig_009',
    source: 'twitter',
    language: 'urdu',
    raw: 'ایم ٹو موٹروے پر بہت بڑا حادثہ ہوا ہے، ایمبولینس کی ضرورت ہے، لوگ زخمی ہیں',
    timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
    location_hint: 'M2 Motorway',
    coordinates: { lat: 32.6340, lng: 73.2097 },
    metadata: { username: '@PunjabiDriver', retweets: 456 }
  },

  // Scenario B: Adaptive Recovery — burst pipe misclassified as flood
  {
    id: 'sig_010',
    source: 'twitter',
    language: 'roman_urdu',
    raw: 'F-7 markaz mein pani aa gaya road pe, lagta hai flood aa raha hai!!',
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    location_hint: 'F-7, Islamabad',
    coordinates: { lat: 33.7215, lng: 73.0565 },
    metadata: { username: '@F7Resident', retweets: 89, scenario: 'adaptive' }
  },
  {
    id: 'sig_011',
    source: 'emergency_report',
    language: 'english',
    raw: 'WASA Engineer Report: Burst water main identified at F-7/2 junction. NOT flood. Pipe rupture diameter 24-inch. Repair team dispatched.',
    timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
    location_hint: 'F-7/2, Islamabad',
    coordinates: { lat: 33.7215, lng: 73.0565 },
    metadata: { agency: 'WASA Islamabad', pipe_diameter_inch: 24, scenario: 'adaptive', corrects: 'sig_010' }
  },
];

export const SIGNAL_SOURCES = {
  twitter: { label: 'Social Media', icon: '🐦', color: '#1da1f2' },
  weather_api: { label: 'Weather API', icon: '🌧️', color: '#0a84ff' },
  traffic_api: { label: 'Traffic API', icon: '🚦', color: '#ffd60a' },
  emergency_report: { label: 'Field Report', icon: '📋', color: '#30d158' },
  seismic_api: { label: 'Seismic API', icon: '🌍', color: '#bf5af2' },
};

export const LANGUAGE_LABELS = {
  english: { label: 'EN', color: '#0a84ff' },
  urdu: { label: 'UR', color: '#bf5af2' },
  roman_urdu: { label: 'RU', color: '#ff6b35' },
};
