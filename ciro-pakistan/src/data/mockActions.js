// ── Mock Action Logs ──────────────────────────────────────────────────────────
// Output of Agent 4 — Action Execution & Simulation Agent

export const MOCK_ACTIONS = [
  // Crisis 002 — SITE Fire (highest priority, most actions)
  {
    id: 'act_001', crisis_id: 'crisis_002', type: 'DISPATCH',
    title: '8 Fire Brigades Dispatched',
    detail: 'All available Karachi fire units mobilized to SITE Area Factory Block-C. ETA: 4 minutes.',
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    status: 'COMPLETED', impact: 'critical',
    ticket: 'TKT-KHI-2024-0847',
  },
  {
    id: 'act_002', crisis_id: 'crisis_002', type: 'ALERT',
    title: 'Public Evacuation Alert Issued',
    detail: 'Emergency SMS + loudspeaker alert: "Evacuate 500m radius of SITE Factory Block-C immediately due to toxic smoke hazard."',
    timestamp: new Date(Date.now() - 2.8 * 60000).toISOString(),
    status: 'COMPLETED', impact: 'high',
    languages: ['Urdu', 'English'],
    alert_text_en: '⚠️ EMERGENCY: Evacuate SITE Area immediately. Toxic smoke hazard. Move upwind.',
    alert_text_ur: '⚠️ فوری انخلاء: سائٹ ایریا سے فوری طور پر نکلیں۔ زہریلا دھواں خطرناک ہے۔',
    ticket: 'TKT-KHI-2024-0848',
  },
  {
    id: 'act_003', crisis_id: 'crisis_002', type: 'NOTIFY',
    title: 'Aga Khan Hospital — Burn Unit Activated',
    detail: 'AKU Trauma Center alerted. 50 beds reserved for burn and smoke inhalation cases. HAZMAT decontamination unit on standby.',
    timestamp: new Date(Date.now() - 2.5 * 60000).toISOString(),
    status: 'COMPLETED', impact: 'high',
    ticket: 'TKT-KHI-2024-0849',
  },
  {
    id: 'act_004', crisis_id: 'crisis_002', type: 'REROUTE',
    title: 'Traffic Rerouted — SITE Area',
    detail: 'M-10 Motorway approach to SITE closed. 3 alternate routes activated via Manghopir Rd, Hub River Rd, and Northern Bypass.',
    timestamp: new Date(Date.now() - 2.2 * 60000).toISOString(),
    status: 'COMPLETED', impact: 'medium',
    reroute_paths: [
      { from: 'M-10 Motorway SITE Exit', to: 'Northern Bypass → SITE (alternate)', blocked: true },
    ],
    ticket: 'TKT-KHI-2024-0850',
  },

  // Crisis 001 — G-10 Flood
  {
    id: 'act_005', crisis_id: 'crisis_001', type: 'DISPATCH',
    title: '6 Rescue Teams + 3 Boats Deployed',
    detail: 'RESCUE 1122 Islamabad deployed 6 teams with 3 motorized rescue boats to G-10 Markaz and G-10/1.',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    status: 'COMPLETED', impact: 'critical',
    ticket: 'TKT-ISB-2024-1123',
  },
  {
    id: 'act_006', crisis_id: 'crisis_001', type: 'ALERT',
    title: 'Flood Warning Alert — G Sectors',
    detail: 'PMD + CDA joint alert issued for G-9, G-10, G-11 residents. Avoid basements and ground floors.',
    timestamp: new Date(Date.now() - 4.8 * 60000).toISOString(),
    status: 'COMPLETED', impact: 'high',
    alert_text_en: '🌊 FLOOD ALERT: G-10 Islamabad. Move to upper floors. Avoid roads. Call 1122.',
    alert_text_ur: '🌊 سیلاب انتباہ: جی-10 اسلام آباد۔ اوپری منزل پر جائیں۔ 1122 پر کال کریں۔',
    ticket: 'TKT-ISB-2024-1124',
  },

  // Crisis 003 — Quetta Earthquake
  {
    id: 'act_007', crisis_id: 'crisis_003', type: 'DISPATCH',
    title: 'NDMA Urban Search & Rescue Mobilized',
    detail: '8 USAR teams from Quetta + Mastung deployed. Structural engineers dispatched to assess building damage.',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    status: 'COMPLETED', impact: 'high',
    ticket: 'TKT-QTA-2024-0312',
  },
  {
    id: 'act_008', crisis_id: 'crisis_003', type: 'ALERT',
    title: 'Aftershock Warning Broadcast',
    detail: 'Public advisory: expect aftershocks. Stay outdoors. Avoid damaged structures. Emergency helpline 1700.',
    timestamp: new Date(Date.now() - 7.5 * 60000).toISOString(),
    status: 'COMPLETED', impact: 'medium',
    ticket: 'TKT-QTA-2024-0313',
  },

  // Crisis 005 — M2 Accident
  {
    id: 'act_009', crisis_id: 'crisis_005', type: 'REROUTE',
    title: 'M2 Motorway Closure & Diversion',
    detail: 'M2 closed at km 215-225. Traffic diverted via GT Road (N-5). Dynamic message signs activated.',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    status: 'COMPLETED', impact: 'medium',
    ticket: 'TKT-M2-2024-0044',
  },
  {
    id: 'act_010', crisis_id: 'crisis_005', type: 'DISPATCH',
    title: '5 Ambulances + RESCUE 1122 Deployed',
    detail: 'Medical teams en route to accident site. Jinnah Hospital Gujranwala trauma unit on alert.',
    timestamp: new Date(Date.now() - 9.5 * 60000).toISOString(),
    status: 'IN_PROGRESS', impact: 'high',
    ticket: 'TKT-M2-2024-0045',
  },

  // Adaptive Recovery — F-7 Reclassification
  {
    id: 'act_011', crisis_id: 'crisis_006', type: 'RETRACTION',
    title: '⚠️ ALERT RETRACTED — F-7 Not a Flood',
    detail: 'Earlier flood alert for F-7 has been RETRACTED. WASA engineer confirmed burst water main. Public notified of correction.',
    timestamp: new Date(Date.now() - 0.8 * 60000).toISOString(),
    status: 'COMPLETED', impact: 'system',
    alert_text_en: '✅ CORRECTION: F-7 flooding was a burst water main, NOT a flood. WASA repair underway. No evacuation needed.',
    alert_text_ur: '✅ تصحیح: ایف-7 میں پانی سیلاب نہیں، پائپ پھٹنے سے تھا۔ واسا مرمت کر رہی ہے۔',
    ticket: 'TKT-ISB-2024-1125',
    is_retraction: true,
  },
  {
    id: 'act_012', crisis_id: 'crisis_006b', type: 'DISPATCH',
    title: 'WASA Repair Team Deployed — F-7/2',
    detail: '4 WASA engineers with heavy equipment en route. 24-inch pipe rupture repair estimated 3 hours. Road closure in effect.',
    timestamp: new Date(Date.now() - 0.5 * 60000).toISOString(),
    status: 'IN_PROGRESS', impact: 'medium',
    ticket: 'TKT-ISB-2024-1126',
  },
];

export const ACTION_TYPES = {
  DISPATCH: { label: 'Dispatch', icon: '🚀', color: '#30d158' },
  ALERT: { label: 'Public Alert', icon: '📢', color: '#ff6b35' },
  NOTIFY: { label: 'Hospital Notify', icon: '🏥', color: '#0a84ff' },
  REROUTE: { label: 'Traffic Reroute', icon: '🔄', color: '#ffd60a' },
  SHELTER: { label: 'Shelter Activate', icon: '⛺', color: '#bf5af2' },
  RETRACTION: { label: 'Alert Retraction', icon: '↩️', color: '#ff2d55' },
};

// Simulation: Before vs After state
export const SIMULATION_SCENARIOS = {
  scenario_a: {
    id: 'scenario_a',
    name: 'Multi-Crisis Response',
    description: '5 simultaneous crises across Pakistan',
    before: {
      active_crises: 5,
      unresponded_alerts: 11,
      resources_idle: 89,
      estimated_casualties: 127,
      response_time_avg_min: 0,
      coverage_pct: 0,
    },
    after: {
      active_crises: 5,
      unresponded_alerts: 0,
      resources_idle: 18,
      estimated_casualties: 23,
      response_time_avg_min: 6.5,
      coverage_pct: 94,
      lives_saved: 104,
      alerts_issued: 8,
      resources_deployed: 71,
    },
    timeline_steps: [
      { time: '00:00', event: 'Signals ingested by Signal Fusion Agent', agent: 1 },
      { time: '00:45', event: '5 crises classified by Detection Agent', agent: 2 },
      { time: '01:20', event: 'Priority ranking + resource allocation completed', agent: 3 },
      { time: '02:10', event: 'Dispatch orders issued for all crises', agent: 4 },
      { time: '04:00', event: 'First responders on ground — Karachi fire scene', agent: 4 },
      { time: '06:30', event: 'Average response time target met', agent: 4 },
      { time: '08:00', event: 'Evacuation zones cleared — G-10 Flood', agent: 4 },
      { time: '12:00', event: 'All crises under active management', agent: 4 },
    ],
  },
  scenario_b: {
    id: 'scenario_b',
    name: 'Adaptive Recovery — F-7 Misclassification',
    description: 'System detects and corrects a false flood classification',
    before: {
      crisis_type: 'Flood',
      alert_status: 'ACTIVE',
      resources_wrongly_allocated: 3,
      public_panic_level: 'HIGH',
      correction_made: false,
    },
    after: {
      crisis_type: 'Infrastructure Failure (Burst Pipe)',
      alert_status: 'CORRECTED',
      resources_reallocated: true,
      resources_recalled: ['rescue_boats', 'flood_teams'],
      resources_deployed: ['wasa_team', 'traffic_police'],
      public_panic_level: 'LOW',
      correction_made: true,
      correction_time_min: 1.5,
    },
  },
};
