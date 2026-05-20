import { createContext, useContext, useReducer, useCallback } from 'react';

const CiroContext = createContext(null);

const initialState = {
  // Workflow
  workflowPhase: 'IDLE',
  workflowRunning: false,
  workflowResult: null,
  currentAgent: null,
  agentProgress: { 1: null, 2: null, 3: null, 4: null },

  // Data
  crises: [],
  signals: [],
  actions: [],
  resources: {},
  alerts: [],
  reasoningTrace: [],
  simulation: null,
  orchestratorMeta: null,

  // UI
  selectedCrisis: null,
  selectedTelemetryCity: null,
  activePage: 'dashboard',
  systemTime: new Date().toISOString(),

  // Stats
  stats: {
    activeCrises: 0,
    resourcesDeployed: 0,
    alertsIssued: 0,
    livesProtected: 0,
    avgResponseTime: 0,
    populationReached: 0,
  },
};

function ciroReducer(state, action) {
  switch (action.type) {
    case 'SET_WORKFLOW_PHASE':
      return { ...state, workflowPhase: action.payload.phase, currentAgent: action.payload.agent || null };

    case 'SET_WORKFLOW_RUNNING':
      return { ...state, workflowRunning: action.payload };

    case 'SET_AGENT_PROGRESS':
      return {
        ...state,
        agentProgress: { ...state.agentProgress, [action.payload.agentId]: action.payload.progress }
      };

    case 'SET_WORKFLOW_RESULT':
      return { ...state, workflowResult: action.payload };

    case 'SET_CRISES':
      return { ...state, crises: action.payload };

    case 'SET_SIGNALS':
      return { ...state, signals: action.payload };

    case 'SET_ACTIONS':
      return { ...state, actions: action.payload };

    case 'SET_RESOURCES':
      return { ...state, resources: action.payload };

    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };

    case 'SET_REASONING_TRACE':
      return { ...state, reasoningTrace: action.payload };

    case 'SET_SIMULATION':
      return { ...state, simulation: action.payload };

    case 'SET_ORCHESTRATOR_META':
      return { ...state, orchestratorMeta: action.payload };

    case 'SELECT_CRISIS':
      return { ...state, selectedCrisis: action.payload };

    case 'SET_TELEMETRY_CITY':
      return { ...state, selectedTelemetryCity: action.payload };

    case 'SET_ACTIVE_PAGE':
      return { ...state, activePage: action.payload };

    case 'UPDATE_STATS':
      return { ...state, stats: { ...state.stats, ...action.payload } };

    case 'TICK_TIME':
      return { ...state, systemTime: new Date().toISOString() };

    case 'RESET_WORKFLOW':
      return {
        ...initialState,
        activePage: state.activePage,
        systemTime: new Date().toISOString(),
      };

    default:
      return state;
  }
}

export function CiroProvider({ children }) {
  const [state, dispatch] = useReducer(ciroReducer, initialState);

  const setWorkflowPhase = useCallback((phase, agent = null) => {
    dispatch({ type: 'SET_WORKFLOW_PHASE', payload: { phase, agent } });
  }, []);

  const setAgentProgress = useCallback((agentId, progress) => {
    dispatch({ type: 'SET_AGENT_PROGRESS', payload: { agentId, progress } });
  }, []);

  const setWorkflowResult = useCallback((result) => {
    dispatch({ type: 'SET_WORKFLOW_RESULT', payload: result });
  }, []);

  const setWorkflowRunning = useCallback((running) => {
    dispatch({ type: 'SET_WORKFLOW_RUNNING', payload: running });
  }, []);

  const setCrises = useCallback((crises) => {
    dispatch({ type: 'SET_CRISES', payload: crises });
  }, []);

  const setSignals = useCallback((signals) => {
    dispatch({ type: 'SET_SIGNALS', payload: signals });
  }, []);

  const setActions = useCallback((actions) => {
    dispatch({ type: 'SET_ACTIONS', payload: actions });
  }, []);

  const setResources = useCallback((resources) => {
    dispatch({ type: 'SET_RESOURCES', payload: resources });
  }, []);

  const setAlerts = useCallback((alerts) => {
    dispatch({ type: 'SET_ALERTS', payload: alerts });
  }, []);

  const setReasoningTrace = useCallback((trace) => {
    dispatch({ type: 'SET_REASONING_TRACE', payload: trace });
  }, []);

  const setSimulation = useCallback((simulation) => {
    dispatch({ type: 'SET_SIMULATION', payload: simulation });
  }, []);

  const setOrchestratorMeta = useCallback((meta) => {
    dispatch({ type: 'SET_ORCHESTRATOR_META', payload: meta });
  }, []);

  const selectCrisis = useCallback((crisis) => {
    dispatch({ type: 'SELECT_CRISIS', payload: crisis });
  }, []);

  const setTelemetryCity = useCallback((cityData) => {
    dispatch({ type: 'SET_TELEMETRY_CITY', payload: cityData });
  }, []);

  const setActivePage = useCallback((page) => {
    dispatch({ type: 'SET_ACTIVE_PAGE', payload: page });
  }, []);

  const updateStats = useCallback((stats) => {
    dispatch({ type: 'UPDATE_STATS', payload: stats });
  }, []);

  const resetWorkflow = useCallback(() => {
    dispatch({ type: 'RESET_WORKFLOW' });
  }, []);

  const value = {
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
    selectCrisis,
    setTelemetryCity,
    setActivePage,
    updateStats,
    resetWorkflow,
  };

  return <CiroContext.Provider value={value}>{children}</CiroContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCiro() {
  const ctx = useContext(CiroContext);
  if (!ctx) throw new Error('useCiro must be used inside CiroProvider');
  return ctx;
}
