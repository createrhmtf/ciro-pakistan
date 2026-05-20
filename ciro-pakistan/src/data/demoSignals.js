/** Challenge demo: G-10 / George Town urban flooding — multi-source bundle */
export const DEMO_SIGNALS = [
  {
    id: 'demo_social_1',
    source: 'twitter',
    raw: 'Flash flood happening at George Town for past 30 mins',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    location_hint: 'George Town, Karachi',
  },
  {
    id: 'demo_social_2',
    source: 'twitter',
    raw: 'G-10 mein pani bhar gaya hai, gaariyan phans gayi hain',
    timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
    location_hint: 'G-10, Islamabad',
  },
  {
    id: 'demo_weather_1',
    source: 'weather_api',
    raw: 'PMD Alert: Heavy rainfall 85mm/hr in Islamabad G-sector. Flash flood risk EXTREME.',
    timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
    location_hint: 'Islamabad',
  },
  {
    id: 'demo_traffic_1',
    source: 'traffic_api',
    raw: 'G-10 Main Boulevard — severe congestion. Speed 4km/h (normal 60km/h). Vehicles stranded.',
    timestamp: new Date(Date.now() - 29 * 60000).toISOString(),
    location_hint: 'G-10 Boulevard, Islamabad',
  },
];
