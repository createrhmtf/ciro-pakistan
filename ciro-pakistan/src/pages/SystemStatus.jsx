import { useCiro } from '../store/ciroStore';
import { useWorkflow } from '../hooks/useWorkflow';
import { RESOURCE_INVENTORY, RESOURCE_TYPES } from '../data/mockResources';

const AGENT_STATUS = [
  { id: 1, name: 'Signal Fusion Agent', version: '1.0.0', model: 'Gemini 1.5 Pro', icon: '🛰️', color: '#0a84ff', uptime: '99.8%', latency_ms: 1842 },
  { id: 2, name: 'Crisis Detection Agent', version: '1.0.0', model: 'Gemini 1.5 Pro', icon: '🧠', color: '#bf5af2', uptime: '99.9%', latency_ms: 2340 },
  { id: 3, name: 'Decision Agent', version: '1.0.0', model: 'Gemini 1.5 Pro', icon: '⚙️', color: '#ff6b35', uptime: '99.7%', latency_ms: 1960 },
  { id: 4, name: 'Action Execution Agent', version: '1.0.0', model: 'Gemini 1.5 Pro', icon: '⚡', color: '#ff2d55', uptime: '99.9%', latency_ms: 2580 },
];

export default function SystemStatus() {
  const { state } = useCiro();
  const { workflowPhase, workflowRunning, orchestratorMeta } = useWorkflow();
  const isComplete = workflowPhase === 'COMPLETE';

  const API_CONNECTIONS = [
    { name: 'PMD Weather API', status: 'ONLINE', latency: 145, icon: '🌧️', color: '#0a84ff' },
    { name: 'PMDFC Seismic Feed', status: 'ONLINE', latency: 89, icon: '🌍', color: '#bf5af2' },
    { name: 'NTC Traffic Intelligence', status: 'ONLINE', latency: 212, icon: '🚦', color: '#ffd60a' },
    { name: 'Social Media Ingestor', status: 'ONLINE', latency: 320, icon: '🐦', color: '#1da1f2' },
    { name: 'NDMA Alert System', status: 'ONLINE', latency: 178, icon: '📡', color: '#ff6b35' },
    { name: 'Firebase Firestore', status: 'ONLINE', latency: 55, icon: '🔥', color: '#ff6b35' },
    {
      name: 'Google Antigravity Orchestrator',
      status: orchestratorMeta?.antigravity_sdk_active ? 'SDK' : 'ACTIVE',
      latency: 42,
      icon: '🛸',
      color: '#30d158',
    },
    { name: 'Gemini 2.0 Flash (Agents)', status: 'ONLINE', latency: 890, icon: '✨', color: '#30d158' },
    { name: 'Leaflet Maps', status: 'ONLINE', latency: 12, icon: '🗺️', color: '#30d158' },
  ];

  const totalResources = Object.values(RESOURCE_INVENTORY).reduce((s, r) => s + r.total, 0);
  const totalDeployed = Object.values(RESOURCE_INVENTORY).reduce((s, r) => s + r.deployed, 0);
  const totalAvailable = Object.values(RESOURCE_INVENTORY).reduce((s, r) => s + r.available, 0);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-white text-xl tracking-wide">System Status</h1>
          <p className="text-white/40 text-xs mt-0.5">CIRO Platform Health — All Systems Operational</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg">
          <div className="w-2 h-2 rounded-full bg-crisis-green animate-pulse" />
          <span className="text-crisis-green text-xs font-display font-semibold uppercase tracking-wider">All Systems Operational</span>
        </div>
      </div>

      {/* System overview cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Workflow Phase', value: workflowPhase, color: workflowRunning ? '#ff6b35' : isComplete ? '#30d158' : '#636366', icon: '◉' },
          { label: 'Signals Processed', value: 11, color: '#0a84ff', icon: '📡' },
          { label: 'Crises Detected', value: 6, color: '#ff2d55', icon: '🚨' },
          { label: 'Actions Executed', value: 12, color: '#30d158', icon: '⚡' },
        ].map((item, i) => (
          <div key={i} className="stat-card">
            <div className="text-lg mb-1">{item.icon}</div>
            <div className="font-display font-bold text-xl" style={{ color: item.color }}>{item.value}</div>
            <div className="text-[9px] text-white/40 uppercase tracking-wide mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Agent Health Cards */}
        <div className="glass-panel rounded-xl p-4">
          <div className="section-header mb-3">Agent Health</div>
          <div className="space-y-2">
            {AGENT_STATUS.map(agent => {
              const isActive = state.currentAgent === agent.id && workflowRunning;
              const isDone = isComplete || (state.currentAgent !== null && state.currentAgent > agent.id && workflowRunning);
              return (
                <div key={agent.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                    isActive ? 'bg-white/[0.06]' : 'bg-white/[0.02]'
                  }`}
                  style={{ borderColor: isActive ? `${agent.color}40` : 'rgba(255,255,255,0.05)' }}
                >
                  <span className="text-base">{agent.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-white/80">{agent.name}</span>
                      <span className="text-[8px] text-white/30">v{agent.version}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[9px] text-white/40">Uptime: {agent.uptime}</span>
                      <span className="text-[9px] text-white/40">~{agent.latency_ms}ms</span>
                      <span className="text-[9px] text-white/30">{agent.model}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <span className="flex items-center gap-1 text-[9px] font-semibold text-crisis-orange">
                        <span className="w-1.5 h-1.5 rounded-full bg-crisis-orange animate-ping" />
                        ACTIVE
                      </span>
                    )}
                    {isDone && (
                      <span className="text-[9px] font-semibold text-crisis-green">✓ DONE</span>
                    )}
                    {!isActive && !isDone && (
                      <div className="w-1.5 h-1.5 rounded-full bg-crisis-green" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* API Connections */}
        <div className="glass-panel rounded-xl p-4">
          <div className="section-header mb-3">API Connections</div>
          <div className="space-y-2">
            {API_CONNECTIONS.map(api => (
              <div key={api.name} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <span className="text-sm">{api.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-white/70">{api.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {api.status !== 'SIMULATED' && (
                    <span className="font-mono text-[9px] text-white/30">{api.latency}ms</span>
                  )}
                  <span className={`text-[9px] font-semibold ${
                    api.status === 'ONLINE' ? 'text-crisis-green' :
                    api.status === 'SIMULATED' ? 'text-crisis-blue' : 'text-crisis-red'
                  }`}>
                    ● {api.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Inventory */}
      <div className="glass-panel rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="section-header">National Resource Inventory</div>
          <div className="flex items-center gap-4 text-[9px] text-white/40">
            <span>Total: {totalResources}</span>
            <span className="text-crisis-orange">Deployed: {totalDeployed}</span>
            <span className="text-crisis-green">Available: {totalAvailable}</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(RESOURCE_INVENTORY).map(([type, inv]) => {
            const rtype = RESOURCE_TYPES[type];
            const deployPct = (inv.deployed / inv.total) * 100;
            const availPct = (inv.available / inv.total) * 100;
            return (
              <div key={type} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{rtype?.icon}</span>
                  <div>
                    <div className="text-[10px] font-medium text-white/70">{rtype?.label}</div>
                    <div className="text-[8px] text-white/30">Total: {inv.total}</div>
                  </div>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full flex">
                    <div className="bg-crisis-orange" style={{ width: `${deployPct}%` }} />
                    <div className="bg-crisis-green" style={{ width: `${availPct}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-center">
                  <div>
                    <div className="font-display font-bold text-crisis-orange text-sm">{inv.deployed}</div>
                    <div className="text-[7px] text-white/30 uppercase">Deployed</div>
                  </div>
                  <div>
                    <div className="font-display font-bold text-crisis-green text-sm">{inv.available}</div>
                    <div className="text-[7px] text-white/30 uppercase">Available</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow phases summary */}
      <div className="glass-panel rounded-xl p-4">
        <div className="section-header mb-3">Agentic Workflow — OODA Loop</div>
        <div className="flex items-center gap-2">
          {['OBSERVE', 'REASON', 'DECIDE', 'ACT', 'EVALUATE', 'ADAPT'].map((phase, i, arr) => {
            const phaseColors = {
              OBSERVE: '#0a84ff', REASON: '#bf5af2', DECIDE: '#ff6b35',
              ACT: '#ff2d55', EVALUATE: '#30d158', ADAPT: '#ffd60a'
            };
            const col = phaseColors[phase];
            const isDone = isComplete;
            const isActive = workflowPhase === phase;
            return (
              <div key={phase} className="flex items-center flex-1">
                <div className={`flex-1 p-2.5 rounded-lg text-center border transition-all ${
                  isActive ? 'bg-white/[0.08]' : isDone ? 'bg-white/[0.03]' : 'bg-white/[0.02]'
                }`}
                  style={{ borderColor: isActive ? `${col}50` : isDone ? `${col}25` : 'rgba(255,255,255,0.05)' }}>
                  <div className="text-[11px] font-display font-bold" style={{ color: col }}>{phase}</div>
                  {isDone && <div className="text-[8px] text-crisis-green mt-0.5">✓</div>}
                  {isActive && <div className="text-[8px] animate-pulse mt-0.5" style={{ color: col }}>●</div>}
                  {!isDone && !isActive && <div className="text-[8px] text-white/20 mt-0.5">—</div>}
                </div>
                {i < arr.length - 1 && (
                  <div className="flex-shrink-0 mx-0.5 text-white/15 text-xs">→</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
