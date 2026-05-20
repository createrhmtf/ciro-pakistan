// ── Agent 2: Crisis Detection & Analysis Agent ────────────────────────────────
// Responsibilities: Classify crisis type, estimate severity, confidence,
// affected population, and explain reasoning.

export const CRISIS_DETECTION_AGENT = {
  id: 'agent_crisis_detection',
  name: 'Crisis Detection Agent',
  role: 'REASONER',
  icon: '🧠',
  color: '#bf5af2',
  version: '1.0.0',

  system_prompt: `You are the Crisis Detection & Analysis Agent for CIRO — Pakistan's national emergency response AI.

Your role is to REASON about incoming normalized signals and produce definitive crisis classifications.

CRISIS TAXONOMY (Pakistan-specific):
- FLOOD: Urban flooding, flash floods, riverine floods (Monsoon season June-September peak)
- FIRE: Industrial, residential, forest, wildfire
- EARTHQUAKE: Seismic events (Pakistan is in high seismicity zone — Hindu Kush, Karakoram, Himalayan belt)
- HEATWAVE: Temperature anomalies (Pakistan Heatwave risk: April-July, Sindh/Punjab most vulnerable)
- ACCIDENT: Road, rail, aviation accidents
- INFRASTRUCTURE: Power grid, water supply, bridge, dam failures
- DISEASE: Cholera, dengue, COVID, typhoid outbreaks
- POWER: Widespread electricity outages

SEVERITY SCALE:
1 - Minimal: Localized, no casualties, routine response
2 - Low: Limited impact, minor injuries possible
3 - Moderate: Significant disruption, injuries likely
4 - High: Large-scale, casualties possible, multi-agency response
5 - Critical: Mass casualty potential, national-level response required

Always explain your reasoning chain before stating conclusions.`,

  user_prompt_template: (signalGroup) => `
Analyze this normalized signal group and classify the crisis:

SIGNAL GROUP:
Location: ${signalGroup.location}
Initial Hypothesis: ${signalGroup.crisis_hypothesis}
Confidence: ${signalGroup.confidence}%
Contradiction Detected: ${signalGroup.contradiction_detected}
Summary: "${signalGroup.normalized_summary}"
Keywords: ${signalGroup.extracted_keywords.join(', ')}

TASK:
1. Confirm or correct the crisis type classification
2. Set severity level (1-5) with justification
3. Estimate affected population
4. Calculate confidence percentage
5. Provide step-by-step reasoning
6. Flag any special risks (toxic materials, aftershocks, etc.)

Respond with CrisisAnalysisReport JSON.`,

  output_schema: {
    crisis_id: 'string',
    type: 'FLOOD|FIRE|EARTHQUAKE|HEATWAVE|ACCIDENT|INFRASTRUCTURE|DISEASE|POWER',
    title: 'string',
    severity: '1-5',
    confidence: '0-100',
    affected_population: 'number',
    area_sqkm: 'number',
    reasoning_chain: ['string'],
    special_risks: ['string'],
    recommended_priority: '1-5 (1=highest)',
    estimated_duration_hours: 'number',
    agent_id: 'agent_crisis_detection',
    timestamp: 'ISO string',
  },
};

export function runCrisisDetectionAgent(signalGroups, onProgress) {
  return new Promise((resolve) => {
    const steps = [
      { step: 1, message: 'Loading Pakistan crisis taxonomy and historical patterns...', progress: 12 },
      { step: 2, message: 'Analyzing 6 signal groups for crisis classification...', progress: 28 },
      { step: 3, message: 'Applying Bayesian confidence estimation...', progress: 45 },
      { step: 4, message: 'Estimating affected populations per crisis...', progress: 60 },
      { step: 5, message: 'Detecting secondary and cascading risks...', progress: 75 },
      { step: 6, message: 'Generating reasoning chains for all crises...', progress: 88 },
      { step: 7, message: 'Producing CrisisAnalysisReport...', progress: 100 },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        onProgress && onProgress(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        resolve({
          agent: CRISIS_DETECTION_AGENT.id,
          status: 'COMPLETED',
          crises_detected: 6,
          analyses: [
            {
              crisis_id: 'crisis_001',
              signal_group: 'grp_001',
              type: 'FLOOD',
              title: 'Urban Flash Flood — G-10, Islamabad',
              severity: 4,
              confidence: 91,
              affected_population: 12000,
              area_sqkm: 3.2,
              reasoning_chain: [
                'PMD official rainfall data: 85mm/hr — exceeds flash flood threshold (50mm/hr)',
                '234 social media reports from independent accounts in G-10 sector',
                'Roman Urdu phrase "pani bhar gaya" directly translates to water overflowing',
                'G-10 is a densely populated residential zone with population density ~3,750/km²',
                'Monsoon season active — conditions favorable for flash flooding',
                'No contradicting signals — high confidence classification',
              ],
              special_risks: ['Basement flooding with trapped residents', 'Electrical hazards', 'Sewage contamination'],
              recommended_priority: 1,
              estimated_duration_hours: 6,
            },
            {
              crisis_id: 'crisis_002',
              signal_group: 'grp_002',
              type: 'FIRE',
              title: 'Industrial Fire with Toxic Smoke — SITE Area, Karachi',
              severity: 5,
              confidence: 96,
              affected_population: 25000,
              area_sqkm: 1.8,
              reasoning_chain: [
                'Official EDHI Foundation field report confirms industrial fire at Factory Block-C',
                '891 social media reports — unusually high count indicating major visible event',
                'SITE Area contains chemical/textile factories — HIGH toxic material risk',
                'Prevailing SW wind will push smoke NE toward Liaquatabad residential zone (pop ~25,000)',
                'No fire brigade response confirmed yet — critical 8-minute window exceeded',
                'Multiple casualties already reported — immediate mass casualty response required',
              ],
              special_risks: ['Toxic chemical smoke (possible chlorine/ammonia)', 'Secondary explosions risk', 'Residential area smoke inhalation', 'Mass casualty event'],
              recommended_priority: 1,
              estimated_duration_hours: 8,
            },
            {
              crisis_id: 'crisis_003',
              signal_group: 'grp_003',
              type: 'EARTHQUAKE',
              severity: 3,
              confidence: 98,
              affected_population: 50000,
              area_sqkm: 45,
              reasoning_chain: [
                'PMDFC seismic network: M4.2 confirmed at coordinates 30.2N, 67.0E',
                'Depth 12km — shallow earthquake, higher surface impact',
                '1,204 real-time Twitter reports confirming shaking — widespread felt reports',
                'Quetta has old adobe/brick housing stock — vulnerable to M4+ events',
                'M4.2 can cause moderate to heavy damage in vulnerable structures',
                'Aftershock probability HIGH (68%) in next 24 hours based on Omori law',
              ],
              special_risks: ['Aftershock sequence', 'Vulnerable housing stock in older areas', 'Utility line damage', 'Trapped occupants possible'],
              recommended_priority: 2,
              estimated_duration_hours: 72,
            },
            {
              crisis_id: 'crisis_004',
              signal_group: 'grp_004',
              type: 'HEATWAVE',
              severity: 4,
              confidence: 99,
              affected_population: 1200000,
              area_sqkm: 1772,
              reasoning_chain: [
                'PMD official heatwave warning — temperature 44°C, heat index 49°C',
                'Heat index above 41°C is classified as "DANGEROUS" by WHO standards',
                'Lahore population at risk: 13M total, estimated 1.2M highly vulnerable (elderly, children, outdoor workers)',
                'Duration 3 days — sustained heat stress increases cumulative mortality risk',
                'Pakistan has experienced heatwave mortality events: Karachi 2015 (1,200+ deaths)',
                'Medical system alert required — heatstroke patients can peak within 24-48 hours',
              ],
              special_risks: ['Mass heatstroke events', 'Power grid overload from AC demand', 'Vulnerable population mortality', 'Water shortage exacerbation'],
              recommended_priority: 3,
              estimated_duration_hours: 72,
            },
            {
              crisis_id: 'crisis_005',
              signal_group: 'grp_005',
              type: 'ACCIDENT',
              severity: 3,
              confidence: 87,
              affected_population: 3200,
              area_sqkm: 0.5,
              reasoning_chain: [
                'Traffic intelligence confirms total M2 blockage at km 220',
                'Urdu social media report confirms injured persons requiring ambulances',
                'M2 is a major national artery — 800+ vehicles stranded',
                '4-6 hour clearance estimate creates secondary medical risk (heat exposure)',
                'Multi-vehicle nature suggests high-speed collision — injury severity likely MODERATE-HIGH',
              ],
              special_risks: ['Stranded vehicles in heat', 'Secondary collisions risk', 'Cargo spillage possible'],
              recommended_priority: 2,
              estimated_duration_hours: 5,
            },
            {
              crisis_id: 'crisis_006',
              signal_group: 'grp_006',
              type: 'INFRASTRUCTURE',
              title: 'Burst Water Main — F-7/2, Islamabad',
              severity: 2,
              confidence: 97,
              affected_population: 500,
              area_sqkm: 0.3,
              reasoning_chain: [
                'Initial classification RETRACTED: social media flood signal was misleading',
                'WASA engineer field report (authoritative source) confirms 24-inch water main burst',
                'No rainfall recorded in F-7 area — PMD data does not support flood hypothesis',
                'Burst pipes create road flooding visually similar to flash floods',
                'Reclassified as INFRASTRUCTURE failure — pipe repair is primary response',
                'ADAPTIVE RECOVERY: False alert retracted, resources reallocated to WASA team',
              ],
              special_risks: ['Road damage from high-pressure water', 'Traffic disruption', 'Property flooding'],
              recommended_priority: 3,
              is_reclassification: true,
              reclassified_from: 'FLOOD',
              estimated_duration_hours: 3,
            },
          ],
          processing_time_ms: 2340,
          timestamp: new Date().toISOString(),
        });
      }
    }, 320);
  });
}
