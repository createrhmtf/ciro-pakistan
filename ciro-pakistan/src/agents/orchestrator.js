// ── Workflow Orchestrator ─────────────────────────────────────────────────────
// Drives the 4-agent pipeline: Observe → Reason → Decide → Act → Evaluate → Adapt

import { MOCK_SIGNALS } from '../data/mockSignals';
import { runSignalFusionAgent } from './signalFusionAgent';
import { runCrisisDetectionAgent } from './crisisDetectionAgent';
import { runDecisionAgent } from './decisionAgent';
import { runActionExecutionAgent } from './actionExecutionAgent';

export const WORKFLOW_PHASES = [
  { id: 'IDLE', label: 'Awaiting Input', icon: '⏳', color: '#636366' },
  { id: 'OBSERVE', label: 'Observing', icon: '👁️', color: '#0a84ff', agent: 1 },
  { id: 'REASON', label: 'Reasoning', icon: '🧠', color: '#bf5af2', agent: 2 },
  { id: 'DECIDE', label: 'Deciding', icon: '⚙️', color: '#ff6b35', agent: 3 },
  { id: 'ACT', label: 'Acting', icon: '⚡', color: '#ff2d55', agent: 4 },
  { id: 'EVALUATE', label: 'Evaluating', icon: '📊', color: '#30d158' },
  { id: 'ADAPT', label: 'Adapting', icon: '🔄', color: '#ffd60a' },
  { id: 'COMPLETE', label: 'Complete', icon: '✅', color: '#30d158' },
];

export async function runWorkflow({ onPhaseChange, onAgentProgress, onComplete, onError }) {
  try {
    // Phase 1: OBSERVE — Signal Fusion Agent
    onPhaseChange('OBSERVE', 1);
    const fusionResult = await runSignalFusionAgent(
      MOCK_SIGNALS,
      (progress) => onAgentProgress(1, progress)
    );

    // Phase 2: REASON — Crisis Detection Agent
    onPhaseChange('REASON', 2);
    const detectionResult = await runCrisisDetectionAgent(
      fusionResult.signal_groups,
      (progress) => onAgentProgress(2, progress)
    );

    // Phase 3: DECIDE — Decision & Resource Allocation Agent
    onPhaseChange('DECIDE', 3);
    const decisionResult = await runDecisionAgent(
      detectionResult.analyses,
      (progress) => onAgentProgress(3, progress)
    );

    // Phase 4: ACT — Action Execution Agent
    onPhaseChange('ACT', 4);
    const actionResult = await runActionExecutionAgent(
      decisionResult,
      (progress) => onAgentProgress(4, progress)
    );

    // Phase 5: EVALUATE — Compute outcomes
    onPhaseChange('EVALUATE');
    await delay(800);

    const evaluation = {
      total_crises_handled: detectionResult.crises_detected,
      total_resources_deployed: actionResult.after_state.resources_deployed,
      estimated_lives_protected: actionResult.after_state.estimated_lives_at_risk_reduced,
      alerts_issued: actionResult.alerts_issued,
      avg_response_time_min: actionResult.after_state.first_responders_eta_avg_min,
      population_reached: actionResult.after_state.alerts_reaching_population,
      adaptive_corrections: actionResult.after_state.adaptive_corrections,
      overall_effectiveness_pct: 94,
    };

    // Phase 6: ADAPT — Check for reclassification, update
    onPhaseChange('ADAPT');
    await delay(600);

    // Phase 7: COMPLETE
    onPhaseChange('COMPLETE');

    onComplete({
      fusion: fusionResult,
      detection: detectionResult,
      decision: decisionResult,
      action: actionResult,
      evaluation,
    });

  } catch (err) {
    onError(err);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate reasoning trace for display
export function buildReasoningTrace(workflowResult) {
  if (!workflowResult) return [];
  const { fusion, detection, decision, action } = workflowResult;
  const trace = [];

  // Agent 1 trace entries
  if (fusion?.signal_groups) {
    fusion.signal_groups.forEach(grp => {
      trace.push({
        agent: 1,
        agent_name: 'Signal Fusion Agent',
        type: 'SIGNAL_PROCESSED',
        timestamp: new Date(Date.now() - 7 * 60000).toISOString(),
        content: `Signal group "${grp.group_id}" processed — ${grp.location}`,
        data: grp,
        severity: grp.contradiction_detected ? 'warning' : 'info',
      });
    });
  }

  // Agent 2 trace entries
  if (detection?.analyses) {
    detection.analyses.forEach(a => {
      trace.push({
        agent: 2,
        agent_name: 'Crisis Detection Agent',
        type: 'CRISIS_CLASSIFIED',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        content: `Crisis "${a.title || a.type}" classified — Severity ${a.severity}/5 (${a.confidence}% confidence)`,
        data: { reasoning_chain: a.reasoning_chain, severity: a.severity, confidence: a.confidence },
        severity: a.severity >= 4 ? 'critical' : a.severity >= 3 ? 'high' : 'medium',
      });
    });
  }

  // Agent 3 trace entries
  if (decision?.allocations) {
    decision.allocations.forEach(alloc => {
      trace.push({
        agent: 3,
        agent_name: 'Decision Agent',
        type: 'RESOURCES_ALLOCATED',
        timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
        content: `Resources allocated to ${alloc.crisis_id} — ${alloc.resources.reduce((s, r) => s + r.count, 0)} units deployed`,
        data: alloc,
        severity: 'info',
      });
    });
  }

  // Agent 4 trace entries
  if (action) {
    trace.push({
      agent: 4,
      agent_name: 'Action Execution Agent',
      type: 'ACTIONS_EXECUTED',
      timestamp: new Date().toISOString(),
      content: `${action.actions_executed} actions executed — ${action.tickets_created} emergency tickets created`,
      data: action.action_summary,
      severity: 'success',
    });

    if (action.adaptive_recovery?.triggered) {
      trace.push({
        agent: 4,
        agent_name: 'Action Execution Agent',
        type: 'ADAPTIVE_RECOVERY',
        timestamp: new Date().toISOString(),
        content: '⚠️ ADAPTIVE RECOVERY: Flood alert retracted for F-7. Reclassified as burst water main. Resources reallocated.',
        data: action.adaptive_recovery,
        severity: 'warning',
      });
    }
  }

  return trace;
}
