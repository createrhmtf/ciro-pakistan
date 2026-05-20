import { useCallback, useEffect, useRef } from 'react';
import { useCiro } from '../store/ciroStore';
import { apiService } from '../services/api';
import { DEMO_SIGNALS } from '../data/demoSignals';
import { RESOURCE_INVENTORY, RESOURCE_ALLOCATIONS } from '../data/mockResources';

function mapTrace(t) {
  let agentName = 'Orchestrator';
  if (t.agent_id === 1 || t.agent_name?.includes('Signal')) agentName = 'Fusion';
  else if (t.agent_id === 2 || t.agent_name?.includes('Detection')) agentName = 'Detection';
  else if (t.agent_id === 3 || t.agent_name?.includes('Decision')) agentName = 'Allocation';
  else if (t.agent_id === 4 || t.agent_name?.includes('Execution')) agentName = 'Execution';

  return {
    id: t.id || Math.random().toString(),
    agent: agentName,
    observation: `Phase: ${t.step || 'Execution'}`,
    reasoning: t.details || 'Processing multi-agent pipeline signals...',
    action: `Status: ${t.status || 'COMPLETED'}`,
    timestamp: t.timestamp || new Date().toISOString(),
  };
}

export function useWorkflow() {
  const {
    state,
    setWorkflowPhase,
    setAgentProgress,
    setWorkflowResult,
    setWorkflowRunning,
    setCrises,
    setSignals,
    setActions,
    setResources,
    setAlerts,
    setReasoningTrace,
    setSimulation,
    setOrchestratorMeta,
    updateStats,
    resetWorkflow,
  } = useCiro();

  const pollRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startWorkflow = useCallback(
    async (inputSignals = DEMO_SIGNALS) => {
      if (state.workflowRunning) return;

      resetWorkflow();
      setWorkflowRunning(true);
      setSignals(inputSignals);

      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      const pollTraces = () => {
        pollRef.current = setInterval(async () => {
          try {
            const traces = await apiService.getAgentTraces();
            if (traces?.length) {
              const mapped = traces.map(mapTrace).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
              setReasoningTrace(mapped);
            }
          } catch {
            /* backend may still be starting */
          }
        }, 600);
      };

      try {
        pollTraces();
        const apiPromise = apiService.analyzeCrisis(inputSignals);

        setWorkflowPhase('OBSERVE', 1);
        setAgentProgress(1, { step: 1, message: 'Antigravity: tool integration (weather, traffic, social)...', progress: 25 });
        await delay(350);
        setAgentProgress(1, { step: 4, message: 'Signal Fusion Agent — translate & normalize...', progress: 55 });
        await delay(350);

        setWorkflowPhase('REASON', 2);
        setAgentProgress(2, { step: 1, message: 'Crisis Detection — cluster & classify...', progress: 40 });
        await delay(350);
        setAgentProgress(2, { step: 4, message: 'Severity & confidence scoring...', progress: 75 });
        await delay(350);

        setWorkflowPhase('DECIDE', 3);
        setAgentProgress(3, { step: 1, message: 'Decision Agent — allocate rescue & hospitals...', progress: 45 });
        await delay(350);
        setAgentProgress(3, { step: 4, message: 'Computing alternate routes...', progress: 80 });
        await delay(350);

        setWorkflowPhase('ACT', 4);
        setAgentProgress(4, { step: 1, message: 'Simulating reroute, dispatch, alerts...', progress: 50 });
        await delay(350);
        setAgentProgress(4, { step: 4, message: 'Creating emergency tickets...', progress: 85 });
        await delay(350);

        setWorkflowPhase('EVALUATE');
        await delay(400);
        setWorkflowPhase('ADAPT');
        await delay(300);

        const result = await apiPromise;

        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }

        setWorkflowResult(result);
        setWorkflowRunning(false);
        setWorkflowPhase('COMPLETE');

        setCrises(result.crises || []);
        setActions(result.alerts || []);

        const mappedAlerts = (result.alerts || []).map((a) => ({
          id: a.id,
          crisis_id: a.crisis_id,
          type: a.type === 'RETRACTION' ? 'RETRACTION' : 'ALERT',
          title: a.title,
          message_en: a.alert_text_en || a.detail,
          message_ur: a.alert_text_ur,
          timestamp: a.timestamp,
          ticket: a.ticket,
        }));
        setAlerts(mappedAlerts);

        if (result.simulation) {
          setSimulation(result.simulation);
        }
        if (result.orchestrator) {
          setOrchestratorMeta(result.orchestrator);
        }

        setResources({ inventory: RESOURCE_INVENTORY, allocations: RESOURCE_ALLOCATIONS });

        const mappedTraces = (result.traces || []).map(mapTrace);
        mappedTraces.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setReasoningTrace(mappedTraces);

        const activeCount = (result.crises || []).filter((c) => c.status === 'ACTIVE').length;
        updateStats({
          activeCrises: activeCount,
          resourcesDeployed: (result.alerts || []).length * 3 + 10,
          alertsIssued: (result.alerts || []).length,
          livesProtected:
            (result.simulation?.after?.lives_saved ?? 0) +
            (result.crises || []).reduce((sum, c) => sum + (c.affected_population || 0), 0) / 200,
          avgResponseTime: result.simulation?.after?.response_time_avg_min ?? 6.5,
          populationReached: (result.crises || []).reduce((sum, c) => sum + (c.affected_population || 0), 0),
        });

        return result;
      } catch (err) {
        console.error('Workflow API integration error:', err);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        setWorkflowRunning(false);
        setWorkflowPhase('IDLE');
        throw err;
      }
    },
    [
      state.workflowRunning,
      resetWorkflow,
      setWorkflowRunning,
      setSignals,
      setWorkflowPhase,
      setAgentProgress,
      setWorkflowResult,
      setCrises,
      setAlerts,
      setActions,
      setResources,
      setReasoningTrace,
      setSimulation,
      setOrchestratorMeta,
      updateStats,
    ],
  );

  return {
    workflowPhase: state.workflowPhase,
    workflowRunning: state.workflowRunning,
    workflowResult: state.workflowResult,
    currentAgent: state.currentAgent,
    agentProgress: state.agentProgress,
    orchestratorMeta: state.orchestratorMeta,
    startWorkflow,
    resetWorkflow,
  };
}
