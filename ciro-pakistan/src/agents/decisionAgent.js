// ── Agent 3: Decision & Resource Allocation Agent ─────────────────────────────
// Responsibilities: Prioritize crises, allocate resources, generate response plan.

export const DECISION_AGENT = {
  id: 'agent_decision',
  name: 'Decision & Allocation Agent',
  role: 'DECIDER',
  icon: '⚙️',
  color: '#ff6b35',
  version: '1.0.0',

  system_prompt: `You are the Decision & Resource Allocation Agent for CIRO.

Your role is to DECIDE how to allocate Pakistan's limited emergency resources across simultaneous crises.

RESOURCE INVENTORY (National Emergency Pool):
- Ambulances: 45 total
- Rescue Teams: 30 total
- Fire Brigades: 20 total  
- Hospital Beds: 2400 total
- Traffic Police Units: 200 total
- Water Tankers: 35 total
- Helicopters: 8 total
- WASA Technical Teams: 25 total

DECISION PRINCIPLES:
1. Life Safety First — prioritize crises with highest mortality risk
2. Population Impact — weight by affected population size
3. Resource Efficiency — don't over-allocate to manageable incidents
4. Geographic distribution — consider travel times and regional capacity
5. Escalation readiness — reserve capacity for deteriorating situations
6. Adaptive reallocation — revise instantly when crisis reclassification occurs

PAKISTAN-SPECIFIC AGENCIES:
- NDMA (National Disaster Management Authority)
- PDMA (Provincial Disaster Management Authorities)
- RESCUE 1122 (Punjab/KPK)
- EDHI Foundation (national)
- Pakistan Army (for major disasters)
- Aga Khan Hospital, Shaukat Khanum, PIMS
- WASA, CDA, NHA, KDA

Always justify every allocation decision with explicit reasoning.`,

  user_prompt_template: (analyses) => `
Based on these ${analyses.length} confirmed crises, produce a ResourceAllocationPlan:

CRISES (sorted by detected severity):
${analyses.map(a => `Crisis: ${a.title}
  Type: ${a.type} | Severity: ${a.severity}/5 | Confidence: ${a.confidence}%
  Affected: ${a.affected_population?.toLocaleString()} people | Priority: ${a.recommended_priority}
`).join('\n')}

TASK:
1. Set final priority ranking (1=most urgent)
2. Allocate specific resource counts to each crisis
3. Identify which agencies to notify
4. Provide allocation justification
5. Flag resource shortfalls if any
6. Define escalation triggers

Respond with ResourceAllocationPlan JSON.`,
};

export function runDecisionAgent(analyses, onProgress) {
  return new Promise((resolve) => {
    const steps = [
      { step: 1, message: 'Loading resource inventory and availability...', progress: 10 },
      { step: 2, message: 'Computing priority scores (severity × population × confidence)...', progress: 25 },
      { step: 3, message: 'Ranking 6 simultaneous crises by urgency...', progress: 40 },
      { step: 4, message: 'Optimizing resource allocation across crisis sites...', progress: 55 },
      { step: 5, message: 'Checking for resource shortfalls...', progress: 70 },
      { step: 6, message: 'Identifying agencies and notification chains...', progress: 85 },
      { step: 7, message: 'Generating ResourceAllocationPlan...', progress: 100 },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        onProgress && onProgress(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        resolve({
          agent: DECISION_AGENT.id,
          status: 'COMPLETED',
          priority_ranking: [
            { rank: 1, crisis_id: 'crisis_002', score: 9.8, justification: 'Industrial fire with confirmed casualties + toxic smoke threat to 25,000 residents. Highest life safety risk.' },
            { rank: 2, crisis_id: 'crisis_001', score: 8.4, justification: 'Flash flood in densely populated G-10. 12,000 residents at risk of water trapping. Ongoing heavy rainfall.' },
            { rank: 3, crisis_id: 'crisis_003', score: 7.1, justification: 'M4.2 earthquake in Quetta. 50,000 affected. Aftershock risk requires sustained monitoring.' },
            { rank: 4, crisis_id: 'crisis_005', score: 6.2, justification: 'M2 accident with injuries. 800+ vehicles stranded in heat. Medical response time-critical.' },
            { rank: 5, crisis_id: 'crisis_004', score: 5.9, justification: 'Heatwave affecting 1.2M but gradual onset allows proactive response vs acute crises.' },
            { rank: 6, crisis_id: 'crisis_006b', score: 3.1, justification: 'Burst pipe — infrastructure failure. Low immediate life risk after false flood alert retracted.' },
          ],
          allocations: [
            {
              crisis_id: 'crisis_002',
              resources: [
                { type: 'FIRE_BRIGADE', count: 8, justification: 'Maximum available — industrial fire requires full suppression capacity' },
                { type: 'AMBULANCE', count: 10, justification: 'Mass casualty pre-positioning for confirmed injuries + toxic exposure' },
                { type: 'RESCUE_TEAM', count: 5, justification: 'Search/rescue for trapped workers in factory structure' },
                { type: 'HELICOPTER', count: 1, justification: 'Aerial monitoring of smoke spread for evacuation zone decisions' },
                { type: 'HOSPITAL', count: 150, justification: 'Aga Khan + Civil Hospital burn/toxicology units pre-activated' },
              ],
              agencies: ['Karachi Fire Brigade', 'KDA', 'Aga Khan University Hospital', 'Civil Hospital Karachi', 'Edhi Foundation', 'Pakistan Army 5 Corps'],
              estimated_response_time_min: 4,
            },
            {
              crisis_id: 'crisis_001',
              resources: [
                { type: 'RESCUE_TEAM', count: 6, justification: 'Water rescue teams with boats for stranded residents in flooded homes' },
                { type: 'WATER_TANKER', count: 3, justification: 'Temporary water supply + pumping for waterlogged areas' },
                { type: 'AMBULANCE', count: 4, justification: 'Medical standby for injuries and health emergencies during evacuation' },
              ],
              agencies: ['NDMA', 'RESCUE 1122 Islamabad', 'CDA Drainage', 'Islamabad Police', 'PMD'],
              estimated_response_time_min: 8,
            },
            {
              crisis_id: 'crisis_003',
              resources: [
                { type: 'RESCUE_TEAM', count: 8, justification: 'USAR teams for possible structural collapse assessment' },
                { type: 'AMBULANCE', count: 6, justification: 'Medical for injuries from structural collapse' },
                { type: 'HELICOPTER', count: 2, justification: 'Aerial damage assessment across 45km² affected zone' },
              ],
              agencies: ['PDMA Balochistan', 'Pakistan Army XI Corps Quetta', 'CMH Quetta', 'PMDFC Seismic'],
              estimated_response_time_min: 15,
            },
            {
              crisis_id: 'crisis_005',
              resources: [
                { type: 'AMBULANCE', count: 5, justification: 'Injured accident victims requiring immediate medical transport' },
                { type: 'TRAFFIC_POLICE', count: 20, justification: 'Motorway clearance, traffic diversion, accident scene management' },
                { type: 'RESCUE_TEAM', count: 3, justification: 'Extrication of trapped persons from vehicles' },
              ],
              agencies: ['NHA', 'Punjab Highway Police', 'RESCUE 1122 Motorway Unit', 'DHQ Gujranwala'],
              estimated_response_time_min: 10,
            },
            {
              crisis_id: 'crisis_004',
              resources: [
                { type: 'WATER_TANKER', count: 15, justification: 'Drinking water distribution to heat-vulnerable areas' },
                { type: 'AMBULANCE', count: 8, justification: 'ON STANDBY for heatstroke emergencies' },
                { type: 'HOSPITAL', count: 200, justification: 'Reserve beds for heatstroke admissions over 72-hour period' },
              ],
              agencies: ['PDMA Punjab', 'Lahore General Hospital', 'Sheikh Zayed Hospital', 'PHSA', 'LDA'],
              estimated_response_time_min: 30,
            },
            {
              crisis_id: 'crisis_006b',
              resources: [
                { type: 'WASA_TEAM', count: 4, justification: 'Specialized pipe repair crew for 24-inch main — 3hr repair job' },
                { type: 'TRAFFIC_POLICE', count: 6, justification: 'Road closure and traffic diversion around burst pipe zone' },
              ],
              agencies: ['WASA Islamabad', 'CDA Roads Division', 'Islamabad Traffic Police'],
              estimated_response_time_min: 5,
              adapted_from: 'Flood allocation — RETRACTED. Rescue boats recalled. Infrastructure team deployed.',
            },
          ],
          resource_shortfalls: [
            { resource: 'FIRE_BRIGADE', shortfall: 3, note: 'Only 5 units available after Karachi deployment. Mutual aid requested from Hyderabad.' },
          ],
          escalation_triggers: [
            'If Quetta earthquake exceeds M5.0 aftershock → elevate to Priority 1, request Army Corps',
            'If Karachi fire spreads to neighboring factory → double fire brigade count, declare industrial emergency',
            'If G-10 flood depth exceeds 4 feet → initiate mass evacuation protocol',
          ],
          processing_time_ms: 1960,
          timestamp: new Date().toISOString(),
        });
      }
    }, 280);
  });
}
