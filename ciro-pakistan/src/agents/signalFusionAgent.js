// ── Agent 1: Signal Fusion Agent ──────────────────────────────────────────────
// Responsibilities: Ingest multi-source signals, handle noisy language,
// extract locations, detect contradictions, output normalized crisis signals.

export const SIGNAL_FUSION_AGENT = {
  id: 'agent_signal_fusion',
  name: 'Signal Fusion Agent',
  role: 'OBSERVER',
  icon: '🛰️',
  color: '#0a84ff',
  version: '1.0.0',

  // System prompt for Gemini 1.5 Pro
  system_prompt: `You are the Signal Fusion Agent for CIRO — Pakistan's Crisis Intelligence & Response Orchestrator.

Your role is to OBSERVE and FUSE multi-source crisis signals into structured intelligence reports.

CAPABILITIES:
- Parse social media posts in English, Urdu (Nastaliq script), and Roman Urdu
- Understand noisy, informal language such as:
  * "G-10 mein pani bhar gaya" → Flash flood in G-10 area
  * "Factory mein aag lag gayi" → Industrial fire
  * "Road totally blocked near DHA" → Traffic blockage
  * "Earthquake felt in Quetta" → Seismic event
- Extract geographic locations using Pakistan-specific knowledge:
  * Sector names (G-10, F-7, DHA, SITE Area, etc.)
  * City names, landmarks, motorway km markers
- Detect contradictions between signals (e.g., flood vs burst pipe)
- Assign initial severity and confidence scores

OUTPUT FORMAT: Always respond with valid JSON matching CrisisSignalReport schema.`,

  // User prompt template
  user_prompt_template: (signals) => `
Analyze the following ${signals.length} raw signals and produce a normalized CrisisSignalReport.

SIGNALS:
${signals.map((s, i) => `[${i + 1}] Source: ${s.source} | Language: ${s.language} | Time: ${s.timestamp}
Content: "${s.raw}"
Location hint: ${s.location_hint}
`).join('\n')}

Produce a structured JSON report with:
1. Signal groupings by geographic cluster
2. Extracted locations with coordinates
3. Initial crisis type hypotheses
4. Contradiction flags (if multiple signals conflict)
5. Confidence score (0-100) for each signal group
6. Overall severity estimate (1-5 scale)

Response in CrisisSignalReport JSON schema.`,

  // Expected output schema
  output_schema: {
    signal_groups: [{
      group_id: 'string',
      signals: ['signal_ids'],
      location: 'string',
      coordinates: { lat: 'number', lng: 'number' },
      crisis_hypothesis: 'FLOOD|FIRE|EARTHQUAKE|HEATWAVE|ACCIDENT|INFRASTRUCTURE|DISEASE|POWER',
      severity_estimate: '1-5',
      confidence: '0-100',
      contradiction_detected: 'boolean',
      contradiction_detail: 'string|null',
      normalized_summary: 'string',
      extracted_keywords: ['string'],
      language_detected: 'english|urdu|roman_urdu|mixed',
    }],
    total_signals_processed: 'number',
    contradictions_found: 'number',
    processing_time_ms: 'number',
    agent_id: 'agent_signal_fusion',
    timestamp: 'ISO string',
  },
};

// Simulate Agent 1 processing (offline mode)
export function runSignalFusionAgent(signals, onProgress) {
  return new Promise((resolve) => {
    const steps = [
      { step: 1, message: 'Ingesting raw signals from all sources...', progress: 15 },
      { step: 2, message: 'Parsing multilingual content (EN/UR/Roman Urdu)...', progress: 30 },
      { step: 3, message: 'Extracting geographic entities...', progress: 50 },
      { step: 4, message: 'Clustering signals by location proximity...', progress: 65 },
      { step: 5, message: 'Detecting contradictions and conflicts...', progress: 80 },
      { step: 6, message: 'Calculating confidence scores...', progress: 92 },
      { step: 7, message: 'Generating normalized CrisisSignalReport...', progress: 100 },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        onProgress && onProgress(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        resolve({
          agent: SIGNAL_FUSION_AGENT.id,
          status: 'COMPLETED',
          signal_groups: [
            {
              group_id: 'grp_001',
              signals: ['sig_001', 'sig_002'],
              location: 'G-10, Islamabad',
              coordinates: { lat: 33.6844, lng: 73.0474 },
              crisis_hypothesis: 'FLOOD',
              severity_estimate: 4,
              confidence: 91,
              contradiction_detected: false,
              contradiction_detail: null,
              normalized_summary: 'Flash flood reported in G-10 Islamabad. PMD confirms 85mm/hr rainfall. Multiple residents report water ingress in homes.',
              extracted_keywords: ['pani', 'flood', 'rainfall', 'G-10', 'water ingress'],
              language_detected: 'roman_urdu + english',
            },
            {
              group_id: 'grp_002',
              signals: ['sig_003', 'sig_004'],
              location: 'SITE Area, Karachi',
              coordinates: { lat: 24.8841, lng: 67.0229 },
              crisis_hypothesis: 'FIRE',
              severity_estimate: 5,
              confidence: 96,
              contradiction_detected: false,
              contradiction_detail: null,
              normalized_summary: 'Industrial fire at SITE Area Factory Block-C. Toxic smoke spreading. Multiple casualties. Field report confirmed.',
              extracted_keywords: ['aag', 'fire', 'factory', 'SITE', 'smoke', 'casualties'],
              language_detected: 'roman_urdu + english',
            },
            {
              group_id: 'grp_003',
              signals: ['sig_005', 'sig_006'],
              location: 'Quetta, Balochistan',
              coordinates: { lat: 30.2010, lng: 67.0109 },
              crisis_hypothesis: 'EARTHQUAKE',
              severity_estimate: 3,
              confidence: 98,
              contradiction_detected: false,
              contradiction_detail: null,
              normalized_summary: 'M4.2 earthquake 15km NW of Quetta. Seismic sensors + 1200 social media confirmations.',
              extracted_keywords: ['earthquake', 'Quetta', 'M4.2', 'shaking', 'seismic'],
              language_detected: 'english',
            },
            {
              group_id: 'grp_004',
              signals: ['sig_007'],
              location: 'Lahore, Punjab',
              coordinates: { lat: 31.5204, lng: 74.3587 },
              crisis_hypothesis: 'HEATWAVE',
              severity_estimate: 4,
              confidence: 99,
              contradiction_detected: false,
              contradiction_detail: null,
              normalized_summary: 'Extreme heatwave: 44°C, heat index 49°C. PMD 3-day warning.',
              extracted_keywords: ['heatwave', 'Lahore', '44°C', 'heat index', 'PMD'],
              language_detected: 'english',
            },
            {
              group_id: 'grp_005',
              signals: ['sig_008', 'sig_009'],
              location: 'M2 Motorway km 220',
              coordinates: { lat: 32.6340, lng: 73.2097 },
              crisis_hypothesis: 'ACCIDENT',
              severity_estimate: 3,
              confidence: 87,
              contradiction_detected: false,
              contradiction_detail: null,
              normalized_summary: 'Multi-vehicle accident on M2. Total blockage. 800+ vehicles affected. Injured persons.',
              extracted_keywords: ['accident', 'motorway', 'M2', 'blocked', 'injured'],
              language_detected: 'english + urdu',
            },
            {
              group_id: 'grp_006',
              signals: ['sig_010', 'sig_011'],
              location: 'F-7/2, Islamabad',
              coordinates: { lat: 33.7215, lng: 73.0565 },
              crisis_hypothesis: 'INFRASTRUCTURE',
              severity_estimate: 2,
              confidence: 97,
              contradiction_detected: true,
              contradiction_detail: 'Initial signal (sig_010) suggested flood. Expert WASA report (sig_011) confirms burst water main. Reclassification required.',
              normalized_summary: 'Water on road in F-7/2 initially reported as flood. WASA engineer confirmed 24-inch burst water main.',
              extracted_keywords: ['pani', 'burst', 'WASA', 'pipe', 'F-7'],
              language_detected: 'roman_urdu + english',
            },
          ],
          total_signals_processed: signals.length,
          contradictions_found: 1,
          processing_time_ms: 1842,
          timestamp: new Date().toISOString(),
        });
      }
    }, 280);
  });
}
