import { useState } from 'react';
import { useCiro } from '../store/ciroStore';
import { useWorkflow } from '../hooks/useWorkflow';
import WorkflowControl from '../components/WorkflowControl';

export default function AgentLogs() {
  const { state } = useCiro();
  const { workflowRunning, orchestratorMeta } = useWorkflow();
  const [expandedLogId, setExpandedLogId] = useState(null);

  const logs = state.reasoningTrace || [];

  // Derive active step based on logs
  const getActiveStep = () => {
    if (!workflowRunning && logs.length === 0) return 0;
    if (logs.find(l => l.agent === 'Execution')) return 4;
    if (logs.find(l => l.agent === 'Allocation')) return 3;
    if (logs.find(l => l.agent === 'Detection')) return 2;
    if (logs.find(l => l.agent === 'Fusion')) return 1;
    return 1;
  };
  const activeStep = getActiveStep();

  return (
    <>
      <header className="mb-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-bold uppercase leading-none">MISSION_LOG_TRACE</h1>
          {orchestratorMeta?.detected_situation && (
            <p className="text-[11px] text-on-surface-variant font-data-mono">
              {orchestratorMeta.detected_situation} · {orchestratorMeta.confidence}% confidence
            </p>
          )}
        </div>
      </header>

      <div className="mb-4">
        <WorkflowControl compact />
      </div>

      {/* Pipeline Progress */}
      <section className="mb-8 relative -mx-4 px-4 overflow-hidden">
        <div className="flex justify-between items-start relative max-w-[390px] mx-auto w-full px-2">
          {/* Line background */}
          <div className="absolute top-4 left-0 w-full h-[2px] bg-outline-variant/30 -z-10"></div>
          {/* Active Line */}
          <div className="absolute top-4 left-0 h-[2px] bg-primary -z-10 transition-all duration-500" style={{ width: `${(activeStep - 1) * 33.3}%` }}></div>
          
          {[
            { id: 1, name: 'Signal\nFusion' },
            { id: 2, name: 'Crisis\nDetection' },
            { id: 3, name: 'Resource\nAlloc.' },
            { id: 4, name: 'Execution' }
          ].map(step => (
            <div key={step.id} className="flex flex-col items-center gap-2 w-1/4">
              {step.id < activeStep || (step.id === 4 && !workflowRunning && logs.length > 0) ? (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </div>
              ) : step.id === activeStep && workflowRunning ? (
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full border-2 border-primary animate-ping opacity-50"></div>
                  <div className="w-8 h-8 rounded-full bg-surface border-2 border-primary flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface border-2 border-outline-variant flex items-center justify-center text-outline-variant">
                  <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                </div>
              )}
              <span className={`font-label-muted text-[9px] text-center uppercase leading-tight ${step.id <= activeStep ? 'text-primary font-bold' : 'text-outline-variant'}`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Trace Cards Stack */}
      <div className="flex flex-col gap-stack-gap pb-8">
        {logs.map((log, index) => {
          const isLatest = index === 0;
          const isExpanded = expandedLogId === log.id || (isLatest && expandedLogId === null);
          const isRunning = workflowRunning && isLatest;

          const themeColor = isRunning ? '#ffb000' : '#68dbae'; // primary hex
          const themeClass = isRunning ? 'border-[#ffb000]' : 'border-primary';

          return (
            <div 
              key={log.id} 
              className={`bg-surface-container border-l-4 ${themeClass} ${!isExpanded ? 'hover:bg-surface-container-high cursor-pointer' : ''} transition-all duration-200 relative overflow-hidden`}
              onClick={() => !isExpanded && setExpandedLogId(log.id)}
            >
              {isRunning && <div className="absolute inset-0 bg-[#ffb000]/5 pointer-events-none"></div>}
              
              <div className="p-3 relative z-10">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    {isExpanded && <span className={`material-symbols-outlined text-[20px]`} style={{ color: themeColor }}>psychology</span>}
                    <h3 className="font-title-sm text-[14px] text-on-surface uppercase">Agent: {log.agent}</h3>
                    {!isExpanded && !isRunning && <span className="text-primary text-[10px] font-bold uppercase tracking-tighter ml-2">✓ Complete</span>}
                  </div>

                  {isRunning ? (
                    <div className="flex items-center gap-1.5 bg-[#ffb000]/20 px-2 py-0.5 rounded-sm border border-[#ffb000]/30">
                      <div className="w-1.5 h-1.5 bg-[#ffb000] rounded-full animate-pulse"></div>
                      <span className="text-[#ffb000] text-[10px] font-bold uppercase tracking-widest">RUNNING</span>
                    </div>
                  ) : isExpanded ? (
                    <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">✓ Complete</span>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
                    </div>
                  )}
                </div>

                {!isExpanded && (
                  <p className="text-[11px] text-on-surface-variant truncate w-full pr-8">
                    {log.observation || log.action || "Processing signals..."}
                  </p>
                )}

                {isExpanded && (
                  <div className="space-y-3 mt-3">
                    {log.observation && (
                      <div>
                        <p className="text-[11px] text-on-surface-variant font-medium uppercase mb-1">Observation</p>
                        <p className="text-[13px] text-on-surface">{log.observation}</p>
                      </div>
                    )}
                    {log.reasoning && (
                      <div>
                        <p className="text-[11px] text-on-surface-variant font-medium uppercase mb-1">Reasoning</p>
                        <div className="bg-surface-container-lowest p-2 border border-outline-variant/10 rounded-sm">
                          <p className="font-data-mono text-data-mono text-on-surface-variant leading-relaxed">
                            {log.reasoning}
                          </p>
                        </div>
                      </div>
                    )}
                    {log.action && (
                      <div>
                        <p className="text-[11px] text-on-surface-variant font-medium uppercase mb-1">Action/Decision</p>
                        <div className="bg-surface-container-lowest p-2 border border-outline-variant/10 rounded-sm">
                          <p className="font-data-mono text-[12px] text-on-surface leading-relaxed whitespace-pre-line">
                            {typeof log.action === 'object' ? JSON.stringify(log.action, null, 2) : log.action}
                          </p>
                        </div>
                      </div>
                    )}
                    {isExpanded && !isRunning && (
                      <button 
                        className="text-[10px] uppercase font-bold text-outline hover:text-on-surface"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedLogId(null);
                        }}
                      >
                        Collapse
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {logs.length === 0 && !workflowRunning && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">history</span>
            <p className="text-outline-variant font-label-muted">No reasoning trace available.</p>
          </div>
        )}
      </div>
      
      {logs.length > 0 && (
         <button className="w-full h-touch-target border border-primary flex items-center justify-center gap-2 text-primary font-bold uppercase tracking-widest transition-all duration-200 hover:bg-primary/10 rounded-lg group active:scale-95">
           <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-y-1">download</span>
           EXPORT TRACE
         </button>
      )}
    </>
  );
}
