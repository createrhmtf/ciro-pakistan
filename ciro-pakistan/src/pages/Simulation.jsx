import { useState, useEffect } from 'react';
import { useCiro } from '../store/ciroStore';
import { SIMULATION_SCENARIOS } from '../data/mockActions';
import { RESOURCE_INVENTORY, RESOURCE_TYPES } from '../data/mockResources';
import { apiService } from '../services/api';

function MetricBar({ label, before, after, max, color, unit = '' }) {
  const beforePct = Math.min((before / max) * 100, 100);
  const afterPct = Math.min((after / max) * 100, 100);
  const improved = after > before;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-white/50 uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 line-through">{before}{unit}</span>
          <span className="text-xs font-display font-bold" style={{ color }}>
            {after}{unit} {improved ? '▲' : '▼'}
          </span>
        </div>
      </div>
      <div className="relative h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-white/20 rounded-full" style={{ width: `${beforePct}%` }} />
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
          style={{ width: `${afterPct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function Simulation() {
  const { state } = useCiro();
  const [activeScenario, setActiveScenario] = useState('scenario_a');
  const [showAfter] = useState(true);
  const [liveSim, setLiveSim] = useState(null);

  useEffect(() => {
    if (state.simulation) {
      setLiveSim(state.simulation);
      return;
    }
    apiService.getSimulation().then(setLiveSim).catch(() => {});
  }, [state.simulation]);

  const fallback = SIMULATION_SCENARIOS[activeScenario];
  const scenario = liveSim && activeScenario === 'scenario_a'
    ? {
        ...fallback,
        before: { ...fallback.before, ...liveSim.before },
        after: { ...fallback.after, ...liveSim.after },
      }
    : fallback;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-white text-xl tracking-wide">Response Simulation</h1>
          <p className="text-white/40 text-xs mt-0.5">Before vs After Impact Analysis</p>
        </div>
        <div className="flex items-center gap-2">
          {Object.values(SIMULATION_SCENARIOS).map(s => (
            <button
              key={s.id}
              id={`scenario-${s.id}`}
              onClick={() => setActiveScenario(s.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-display font-semibold uppercase tracking-wider transition-all ${
                activeScenario === s.id
                  ? s.id === 'scenario_b'
                    ? 'bg-crisis-yellow/20 border border-crisis-yellow/40 text-crisis-yellow'
                    : 'bg-crisis-red/25 border border-crisis-red/40 text-crisis-red'
                  : 'glass-panel text-white/40 hover:text-white/70'
              }`}
            >
              {s.id === 'scenario_b' ? '🔄 ' : '🚨 '}{s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario A — Multi Crisis */}
      {activeScenario === 'scenario_a' && (
        <div className="space-y-4">
          {/* Before / After toggle */}
          <div className="flex gap-3">
            <div className={`flex-1 glass-panel rounded-xl p-4 border transition-all ${!showAfter ? 'border-crisis-red/30' : 'border-white/[0.06]'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="section-header text-crisis-red">Before Response</div>
                <span className="crisis-badge badge-critical">PRE-DEPLOYMENT</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Active Crises', value: scenario.before.active_crises, unit: '', color: '#ff2d55' },
                  { label: 'Unresponded', value: scenario.before.unresponded_alerts, unit: '', color: '#ff6b35' },
                  { label: 'Resources Idle', value: `${scenario.before.resources_idle}%`, unit: '', color: '#636366' },
                  { label: 'Est. Casualties', value: scenario.before.estimated_casualties, unit: '', color: '#ff2d55' },
                  { label: 'Response Time', value: '—', unit: '', color: '#636366' },
                  { label: 'Pop. Coverage', value: `${scenario.before.coverage_pct}%`, unit: '', color: '#636366' },
                ].map((m, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-center">
                    <div className="font-display font-bold text-xl" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-[9px] text-white/35 mt-0.5 uppercase tracking-wide">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center text-white/30 font-display font-bold text-2xl">→</div>

            <div className={`flex-1 glass-panel rounded-xl p-4 border transition-all ${showAfter ? 'border-crisis-green/25' : 'border-white/[0.06]'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="section-header text-crisis-green">After CIRO Response</div>
                <span className="crisis-badge badge-low">DEPLOYED</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Active Crises', value: scenario.after.active_crises, unit: '', color: '#ff2d55' },
                  { label: 'Unresponded', value: scenario.after.unresponded_alerts, unit: '', color: '#30d158' },
                  { label: 'Resources Deployed', value: scenario.after.resources_deployed, unit: '', color: '#30d158' },
                  { label: 'Lives Saved', value: `+${scenario.after.lives_saved}`, unit: '', color: '#30d158' },
                  { label: 'Avg Response', value: `${scenario.after.response_time_avg_min}m`, unit: '', color: '#0a84ff' },
                  { label: 'Pop. Coverage', value: `${scenario.after.coverage_pct}%`, unit: '', color: '#30d158' },
                ].map((m, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-center">
                    <div className="font-display font-bold text-xl" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-[9px] text-white/35 mt-0.5 uppercase tracking-wide">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Impact bars */}
          <div className="glass-panel rounded-xl p-4">
            <div className="section-header mb-3">Improvement Metrics</div>
            <div className="grid grid-cols-2 gap-x-8">
              <MetricBar label="Unresponded Alerts" before={11} after={0} max={11} color="#30d158" unit="" />
              <MetricBar label="Resources Deployed" before={0} after={71} max={100} color="#0a84ff" unit="" />
              <MetricBar label="Population Coverage" before={0} after={94} max={100} color="#bf5af2" unit="%" />
              <MetricBar label="Lives Protected" before={0} after={104} max={130} color="#30d158" unit="" />
            </div>
          </div>

          {/* Timeline */}
          <div className="glass-panel rounded-xl p-4">
            <div className="section-header mb-3">Response Timeline</div>
            <div className="relative">
              <div className="absolute left-16 top-0 bottom-0 w-px bg-white/10" />
              <div className="space-y-2">
                {scenario.timeline_steps.map((step, i) => {
                  const agentColors = { 1: '#0a84ff', 2: '#bf5af2', 3: '#ff6b35', 4: '#ff2d55' };
                  const col = agentColors[step.agent] || '#636366';
                  return (
                    <div key={i} className="flex items-start gap-3 pl-0">
                      <div className="w-14 flex-shrink-0 text-right">
                        <span className="font-mono text-[10px] text-white/40">{step.time}</span>
                      </div>
                      <div className="relative flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-navy-900 mt-0.5"
                          style={{ backgroundColor: col }} />
                      </div>
                      <div>
                        <div className="text-[11px] text-white/70">{step.event}</div>
                        {step.agent && (
                          <span className="text-[9px] font-bold" style={{ color: col }}>
                            Agent {step.agent}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Resource deployment */}
          <div className="glass-panel rounded-xl p-4">
            <div className="section-header mb-3">Resource Deployment Status</div>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(RESOURCE_INVENTORY).map(([type, inv]) => {
                const rtype = RESOURCE_TYPES[type];
                const deployPct = (inv.deployed / inv.total) * 100;
                return (
                  <div key={type} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-base">{rtype?.icon}</span>
                      <span className="text-[9px] text-white/50 truncate">{rtype?.label}</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-1">
                      <div className="h-full rounded-full bg-crisis-orange transition-all"
                        style={{ width: `${deployPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[8px] text-white/30">
                      <span>{inv.deployed} deployed</span>
                      <span>{inv.available} free</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Scenario B — Adaptive Recovery */}
      {activeScenario === 'scenario_b' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-4 border border-crisis-yellow/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🔄</span>
              <div>
                <div className="font-display font-bold text-crisis-yellow text-sm">Adaptive Recovery Scenario</div>
                <div className="text-[10px] text-white/40">F-7 Islamabad — False Flood Alert → Burst Water Main</div>
              </div>
            </div>
          </div>

          {/* Step by step */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="section-header text-crisis-red">❌ Incorrect Initial State</div>
              <div className="glass-panel rounded-xl p-4 border border-crisis-red/20">
                <div className="space-y-3">
                  {[
                    { label: 'Crisis Type', value: scenario.before.crisis_type, icon: '🌊', color: '#ff2d55' },
                    { label: 'Alert Status', value: scenario.before.alert_status, icon: '📡', color: '#ff2d55' },
                    { label: 'Wrong Resources', value: `${scenario.before.resources_wrongly_allocated} units`, icon: '🚣', color: '#ff6b35' },
                    { label: 'Public Panic', value: scenario.before.public_panic_level, icon: '😱', color: '#ff2d55' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-crisis-red/5 border border-crisis-red/10">
                      <span className="text-base">{item.icon}</span>
                      <div className="flex-1">
                        <div className="text-[9px] text-white/40 uppercase tracking-wide">{item.label}</div>
                        <div className="text-[11px] font-semibold" style={{ color: item.color }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 glass-panel rounded-xl border border-white/[0.06]">
                <div className="text-[9px] text-white/30 mb-1">📱 Original Signal (Roman Urdu)</div>
                <div className="text-[11px] text-white/70 italic">"F-7 markaz mein pani aa gaya road pe, lagta hai flood aa raha hai!!"</div>
              </div>
              <div className="p-3 glass-panel rounded-xl border border-crisis-red/15">
                <div className="text-[9px] text-crisis-red mb-1">🤖 Agent 1 Initial Output</div>
                <div className="text-[10px] text-white/50">Crisis hypothesis: FLOOD | Confidence: 34% | Contradiction: FALSE</div>
                <div className="text-[9px] text-white/30 mt-1">Note: Low confidence flagged due to missing secondary signals</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="section-header text-crisis-green">✅ After Adaptive Recovery</div>
              <div className="glass-panel rounded-xl p-4 border border-crisis-green/20">
                <div className="space-y-3">
                  {[
                    { label: 'Crisis Type', value: scenario.after.crisis_type, icon: '🔧', color: '#30d158' },
                    { label: 'Alert Status', value: scenario.after.alert_status, icon: '✅', color: '#30d158' },
                    { label: 'Resources Deployed', value: 'WASA + Traffic Police', icon: '🚐', color: '#30d158' },
                    { label: 'Public Panic', value: scenario.after.public_panic_level, icon: '😌', color: '#30d158' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-crisis-green/5 border border-crisis-green/10">
                      <span className="text-base">{item.icon}</span>
                      <div className="flex-1">
                        <div className="text-[9px] text-white/40 uppercase tracking-wide">{item.label}</div>
                        <div className="text-[11px] font-semibold" style={{ color: item.color }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 glass-panel rounded-xl border border-white/[0.06]">
                <div className="text-[9px] text-white/30 mb-1">📋 WASA Expert Report (English)</div>
                <div className="text-[11px] text-white/70 italic">"Burst water main identified at F-7/2 junction. NOT flood. Pipe rupture diameter 24-inch. Repair team dispatched."</div>
              </div>
              <div className="p-3 glass-panel rounded-xl border border-crisis-green/15">
                <div className="text-[9px] text-crisis-green mb-1">🤖 Agent 1 Revised Output</div>
                <div className="text-[10px] text-white/50">Crisis hypothesis: INFRASTRUCTURE | Confidence: 97% | Contradiction: TRUE</div>
                <div className="text-[9px] text-white/30 mt-1">Contradiction detail: Expert WASA report contradicts social media signal</div>
              </div>
            </div>
          </div>

          {/* Recovery steps */}
          <div className="glass-panel rounded-xl p-4">
            <div className="section-header mb-3">🔄 Adaptive Recovery Process</div>
            <div className="flex items-center gap-0">
              {[
                { step: '1', label: 'Contradiction Detected', detail: 'Agent 1 flags expert report vs social media conflict', color: '#ffd60a' },
                { step: '2', label: 'Reclassification', detail: 'Agent 2 updates: FLOOD → INFRASTRUCTURE', color: '#bf5af2' },
                { step: '3', label: 'Resource Recall', detail: 'Agent 3 recalls boats, reallocates to WASA team', color: '#ff6b35' },
                { step: '4', label: 'Alert Retraction', detail: 'Agent 4 issues public correction in 3 languages', color: '#30d158' },
              ].map((s, i, arr) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1.5"
                      style={{ background: `${s.color}20`, color: s.color }}>
                      {s.step}
                    </div>
                    <div className="text-[10px] font-semibold text-white/80">{s.label}</div>
                    <div className="text-[9px] text-white/40 mt-0.5">{s.detail}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex-shrink-0 mx-1 text-white/20 text-sm">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Correction alerts */}
          <div className="glass-panel rounded-xl p-4 border border-crisis-green/15">
            <div className="section-header mb-3">📢 Correction Alert — All Languages</div>
            <div className="space-y-2">
              {[
                { lang: '🇬🇧 English', msg: '✅ CORRECTION: F-7 Islamabad flooding was caused by a burst water main, NOT a flood. WASA repair team is on-site. No evacuation required.', dir: 'ltr' },
                { lang: '🇵🇰 اردو', msg: '✅ تصحیح: ایف-7 اسلام آباد میں پانی سیلاب کی وجہ سے نہیں بلکہ پائپ پھٹنے سے تھا۔ واسا کی ٹیم پہنچ گئی ہے۔', dir: 'rtl' },
                { lang: '🔤 Roman Urdu', msg: '✅ Takhreem: F-7 mein pani flood nahi tha, pipe phata tha. WASA team aa gayi hai. Evacuation ki zaroorat nahi.', dir: 'ltr' },
              ].map((a, i) => (
                <div key={i} className="p-3 rounded-lg bg-crisis-green/5 border border-crisis-green/15">
                  <div className="text-[9px] text-crisis-green mb-1">{a.lang}</div>
                  <div className={`text-[11px] text-white/70 ${a.dir === 'rtl' ? 'text-right' : ''}`} dir={a.dir}>{a.msg}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[9px] text-white/30">
              ⏱ Correction issued {scenario.after.correction_time_min} minutes after initial misclassification
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
