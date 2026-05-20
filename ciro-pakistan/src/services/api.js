import axios from 'axios';

// Set standard base URL fallback for local development and production environment overrides
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Check system health
  getHealth: async () => {
    const res = await api.get('/api/health');
    return res.data;
  },

  // Fetch real-time weather parameters
  getWeather: async (city) => {
    const res = await api.get(`/api/weather/${city}`);
    return res.data;
  },

  // Fetch real-time air quality (AQI) indices
  getEnvironment: async (city) => {
    const res = await api.get(`/api/environment/${city}`);
    return res.data;
  },

  // Calculate live route steps and travel times
  getRoute: async (originLat, originLng, destLat, destLng) => {
    const res = await api.get('/api/route', {
      params: {
        origin_lat: originLat,
        origin_lng: originLng,
        dest_lat: destLat,
        dest_lng: destLng,
      },
    });
    return res.data;
  },

  // Calculate geocoded routes using address strings
  getRouteByAddress: async (originAddress, destAddress) => {
    const res = await api.get('/api/route', {
      params: {
        origin_address: originAddress,
        dest_address: destAddress,
      },
    });
    return res.data;
  },

  // Execute complete multi-agent reasoning simulation
  analyzeCrisis: async (signals) => {
    const res = await api.post('/api/analyze-crisis', { signals });
    return res.data;
  },

  // Retrieve active database crisis documents
  getCrisisHistory: async () => {
    const res = await api.get('/api/crisis-history');
    return res.data;
  },

  // Retrieve active stakeholder alert warnings
  getAlerts: async () => {
    const res = await api.get('/api/alerts');
    return res.data;
  },

  // Retrieve active execution traces of the OODA agent workflow
  getAgentTraces: async () => {
    const res = await api.get('/api/agent-traces');
    return res.data;
  },

  getMockSignals: async () => {
    const res = await api.get('/api/mock-signals');
    return res.data;
  },

  getSignals: async () => {
    const res = await api.get('/api/signals');
    return res.data;
  },

  getSimulation: async () => {
    const res = await api.get('/api/simulation');
    return res.data;
  },

  ingestSignal: async (signal) => {
    const res = await api.post('/api/ingest-signal', signal);
    return res.data;
  },
};

export function connectRealtime(onMessage) {
  const wsBase = API_BASE_URL.replace(/^http/, 'ws');
  const ws = new WebSocket(`${wsBase}/api/ws`);
  ws.onmessage = (event) => {
    try {
      onMessage(JSON.parse(event.data));
    } catch {
      /* ignore */
    }
  };
  return () => ws.close();
}

export default api;
