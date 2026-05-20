// ── Mock Resources ────────────────────────────────────────────────────────────
// Available emergency resources and their allocation status

export const RESOURCE_TYPES = {
  AMBULANCE: { label: 'Ambulance', icon: '🚑', color: '#30d158' },
  RESCUE_TEAM: { label: 'Rescue Team', icon: '🦺', color: '#ff6b35' },
  FIRE_BRIGADE: { label: 'Fire Brigade', icon: '🚒', color: '#ff2d55' },
  HOSPITAL: { label: 'Hospital Bed', icon: '🏥', color: '#0a84ff' },
  TRAFFIC_POLICE: { label: 'Traffic Police', icon: '🚔', color: '#ffd60a' },
  WATER_TANKER: { label: 'Water Tanker', icon: '🚰', color: '#64d2ff' },
  HELICOPTER: { label: 'Helicopter', icon: '🚁', color: '#bf5af2' },
  WASA_TEAM: { label: 'WASA Team', icon: '🔧', color: '#32d74b' },
};

export const RESOURCE_INVENTORY = {
  AMBULANCE: { total: 45, available: 18, deployed: 27 },
  RESCUE_TEAM: { total: 30, available: 8, deployed: 22 },
  FIRE_BRIGADE: { total: 20, available: 5, deployed: 15 },
  HOSPITAL: { total: 2400, available: 640, deployed: 1760 },
  TRAFFIC_POLICE: { total: 200, available: 80, deployed: 120 },
  WATER_TANKER: { total: 35, available: 12, deployed: 23 },
  HELICOPTER: { total: 8, available: 3, deployed: 5 },
  WASA_TEAM: { total: 25, available: 10, deployed: 15 },
};

export const RESOURCE_ALLOCATIONS = [
  // Crisis 001 — G-10 Flood
  {
    id: 'alloc_001',
    crisis_id: 'crisis_001',
    resources: [
      { type: 'RESCUE_TEAM', count: 6, status: 'DEPLOYED', eta_min: 8 },
      { type: 'WATER_TANKER', count: 3, status: 'DEPLOYED', eta_min: 12 },
      { type: 'AMBULANCE', count: 4, status: 'DEPLOYED', eta_min: 6 },
    ],
    agencies_notified: ['NDMA', 'Islamabad Capital Police', 'CDA', 'RESCUE 1122'],
    response_center: 'Islamabad Emergency Operations Center',
    dispatched_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  // Crisis 002 — SITE Fire
  {
    id: 'alloc_002',
    crisis_id: 'crisis_002',
    resources: [
      { type: 'FIRE_BRIGADE', count: 8, status: 'DEPLOYED', eta_min: 4 },
      { type: 'AMBULANCE', count: 10, status: 'DEPLOYED', eta_min: 5 },
      { type: 'RESCUE_TEAM', count: 5, status: 'DEPLOYED', eta_min: 7 },
      { type: 'HELICOPTER', count: 1, status: 'DEPLOYED', eta_min: 15 },
    ],
    agencies_notified: ['KDA', 'Karachi Fire Brigade', 'Aga Khan Hospital', 'Edhi Foundation', 'Pakistan Army'],
    response_center: 'Karachi Emergency Management Cell',
    dispatched_at: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  // Crisis 003 — Quetta Earthquake
  {
    id: 'alloc_003',
    crisis_id: 'crisis_003',
    resources: [
      { type: 'RESCUE_TEAM', count: 8, status: 'DEPLOYED', eta_min: 20 },
      { type: 'AMBULANCE', count: 6, status: 'DEPLOYED', eta_min: 15 },
      { type: 'HELICOPTER', count: 2, status: 'DEPLOYED', eta_min: 30 },
    ],
    agencies_notified: ['PDMA Balochistan', 'Pakistan Army Corps Quetta', 'CMH Quetta'],
    response_center: 'PDMA Balochistan HQ',
    dispatched_at: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  // Crisis 004 — Lahore Heatwave
  {
    id: 'alloc_004',
    crisis_id: 'crisis_004',
    resources: [
      { type: 'WATER_TANKER', count: 15, status: 'DEPLOYED', eta_min: 30 },
      { type: 'AMBULANCE', count: 8, status: 'ON_STANDBY', eta_min: 0 },
      { type: 'HOSPITAL', count: 200, status: 'RESERVED', eta_min: 0 },
    ],
    agencies_notified: ['PDMA Punjab', 'LDA', 'Lahore General Hospital', 'Sheikh Zayed Hospital', 'PHSA'],
    response_center: 'Punjab PDMA Emergency Cell',
    dispatched_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  // Crisis 005 — M2 Accident
  {
    id: 'alloc_005',
    crisis_id: 'crisis_005',
    resources: [
      { type: 'AMBULANCE', count: 5, status: 'DEPLOYED', eta_min: 10 },
      { type: 'TRAFFIC_POLICE', count: 20, status: 'DEPLOYED', eta_min: 8 },
      { type: 'RESCUE_TEAM', count: 3, status: 'DEPLOYED', eta_min: 12 },
    ],
    agencies_notified: ['NHA', 'Punjab Highway Police', 'RESCUE 1122 Motorway', 'DHQ Gujranwala'],
    response_center: 'NHA Motorway Operations',
    dispatched_at: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  // Crisis 006b — Adaptive: Infrastructure (burst pipe)
  {
    id: 'alloc_006b',
    crisis_id: 'crisis_006b',
    resources: [
      { type: 'WASA_TEAM', count: 4, status: 'DEPLOYED', eta_min: 5 },
      { type: 'TRAFFIC_POLICE', count: 6, status: 'DEPLOYED', eta_min: 3 },
    ],
    agencies_notified: ['WASA Islamabad', 'CDA Roads Division', 'Islamabad Capital Police'],
    response_center: 'WASA Islamabad Control Room',
    dispatched_at: new Date(Date.now() - 0.5 * 60000).toISOString(),
    adapted_from: 'alloc_006',
    adaptation_note: 'Rescue boats and flood teams recalled. WASA pipe repair team deployed instead.',
  },
];
