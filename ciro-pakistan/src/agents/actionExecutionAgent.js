// ── Agent 4: Action Execution & Simulation Agent ──────────────────────────────
// Responsibilities: Simulate dispatches, alerts, rerouting, before/after impact.

export const ACTION_EXECUTION_AGENT = {
  id: 'agent_action_execution',
  name: 'Action Execution Agent',
  role: 'ACTOR',
  icon: '⚡',
  color: '#ff2d55',
  version: '1.0.0',

  system_prompt: `You are the Action Execution & Simulation Agent for CIRO.

Your role is to ACT on the resource allocation plan by simulating real-world emergency response actions.

AVAILABLE ACTIONS:
1. DISPATCH — Deploy emergency resources with ETA calculation
2. ALERT — Issue public alerts (SMS, radio, social media) in English/Urdu/Roman Urdu
3. NOTIFY — Alert hospitals, agencies, and coordination centers  
4. REROUTE — Activate traffic diversion routes via NHA/NTC
5. SHELTER — Activate and staff emergency shelters
6. TICKET — Create standardized emergency tickets for tracking
7. RETRACTION — Issue corrections for false alerts with explanation

For each action, produce:
- Emergency ticket number (format: TKT-[CITY_CODE]-YYYY-XXXX)
- Action log entry with timestamp
- Before and after state comparison
- Estimated impact on life safety

ALERT LANGUAGES: All public alerts must include English, Urdu, and Roman Urdu versions.

SIMULATION PRINCIPLE: Make actions feel real and traceable. Include ETA, dispatch confirmations, and impact metrics.`,

  user_prompt_template: (allocation) => `
Execute and simulate the following ResourceAllocationPlan:

Plan Summary:
- ${allocation.allocations.length} crisis response plans to execute
- Priority 1 crises: ${allocation.priority_ranking.filter(p => p.rank === 1).length}
- Total resource deployments: ${allocation.allocations.reduce((sum, a) => sum + a.resources.length, 0)}

Adaptive Recovery Case:
- 1 alert retraction required (crisis_006 flood → infrastructure reclassification)

TASK:
1. Simulate all resource dispatches with ETAs
2. Generate public alerts in all 3 languages
3. Create emergency tickets for all actions  
4. Simulate traffic rerouting where applicable
5. Produce before vs after impact comparison
6. Log the adaptive recovery retraction

Respond with ActionExecutionLog JSON.`,
};

export function runActionExecutionAgent(allocationPlan, onProgress) {
  return new Promise((resolve) => {
    const steps = [
      { step: 1, message: 'Initiating emergency dispatch protocols...', progress: 10 },
      { step: 2, message: 'Dispatching Karachi fire response (Priority 1)...', progress: 20 },
      { step: 3, message: 'Dispatching Islamabad flood rescue teams...', progress: 32 },
      { step: 4, message: 'Generating multilingual public alerts...', progress: 45 },
      { step: 5, message: 'Notifying hospitals and coordination centers...', progress: 58 },
      { step: 6, message: 'Activating traffic reroute plans...', progress: 68 },
      { step: 7, message: 'Issuing F-7 alert retraction and correction...', progress: 80 },
      { step: 8, message: 'Creating emergency tracking tickets...', progress: 90 },
      { step: 9, message: 'Computing before/after impact simulation...', progress: 100 },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        onProgress && onProgress(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        resolve({
          agent: ACTION_EXECUTION_AGENT.id,
          status: 'COMPLETED',
          actions_executed: 12,
          tickets_created: 12,
          alerts_issued: 8,
          before_state: {
            active_crises: 6,
            unresponded: 11,
            resources_deployed: 0,
            estimated_affected: 91200,
            potential_casualties: 127,
          },
          after_state: {
            active_crises: 5,
            responses_initiated: 6,
            resources_deployed: 71,
            first_responders_eta_avg_min: 6.5,
            alerts_reaching_population: 320000,
            estimated_lives_at_risk_reduced: 104,
            adaptive_corrections: 1,
          },
          action_summary: [
            { type: 'DISPATCH', count: 6, status: 'COMPLETED' },
            { type: 'ALERT', count: 3, status: 'COMPLETED' },
            { type: 'NOTIFY', count: 2, status: 'COMPLETED' },
            { type: 'REROUTE', count: 2, status: 'COMPLETED' },
            { type: 'RETRACTION', count: 1, status: 'COMPLETED' },
          ],
          adaptive_recovery: {
            triggered: true,
            original_classification: 'FLOOD',
            corrected_classification: 'INFRASTRUCTURE',
            retraction_issued: true,
            retraction_time_min: 1.5,
            resources_recalled: 3,
            resources_redeployed: 2,
            public_notified: true,
            correction_message_en: '✅ CORRECTION: F-7 Islamabad flooding was caused by a burst water main, NOT a flood. WASA repair team is on-site. No evacuation required. Normal conditions expected within 3 hours.',
            correction_message_ur: '✅ تصحیح: ایف-7 اسلام آباد میں پانی سیلاب کی وجہ سے نہیں بلکہ پائپ پھٹنے سے تھا۔ واسا کی ٹیم پہنچ گئی ہے۔ انخلاء کی ضرورت نہیں۔',
            correction_message_roman_ur: '✅ Takhreem: F-7 Islamabad mein pani flood nahi tha, pipe phata tha. WASA team aa gayi hai. Evacuation ki zaroorat nahi.',
          },
          processing_time_ms: 2580,
          timestamp: new Date().toISOString(),
        });
      }
    }, 280);
  });
}
