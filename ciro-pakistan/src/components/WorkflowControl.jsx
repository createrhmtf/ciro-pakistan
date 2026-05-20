import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '../hooks/useWorkflow';
import { DEMO_SIGNALS } from '../data/demoSignals';
import toast from 'react-hot-toast';

export default function WorkflowControl({ compact = false }) {
  const navigate = useNavigate();
  const { workflowPhase, workflowRunning, startWorkflow } = useWorkflow();
  const [customText, setCustomText] = useState('');
  const [useDemo, setUseDemo] = useState(true);

  const handleRun = async () => {
    const extra = customText.trim()
      ? [
          {
            id: `custom_${Date.now()}`,
            source: 'user_input',
            raw: customText.trim(),
            timestamp: new Date().toISOString(),
            location_hint: 'Pakistan',
          },
        ]
      : [];
    const signals = useDemo ? [...DEMO_SIGNALS, ...extra] : extra.length ? extra : DEMO_SIGNALS;

    try {
      await startWorkflow(signals);
      toast.success('Antigravity pipeline complete');
      navigate('/agent-logs');
    } catch {
      toast.error('Orchestration failed — is the backend running on port 8000?');
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleRun}
        disabled={workflowRunning}
        className="w-full h-touch-target bg-primary text-on-primary font-bold rounded-lg uppercase tracking-widest text-sm active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">bolt</span>
        {workflowRunning ? `Running ${workflowPhase}...` : 'Run Antigravity Pipeline'}
      </button>
    );
  }

  return (
    <section className="bg-surface-container border border-primary/30 rounded-lg p-4 mt-section-margin">
      <h2 className="font-title-sm text-title-sm text-on-surface mb-2 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-primary rounded-full" />
        Antigravity Orchestration
      </h2>
      <p className="text-[11px] text-outline mb-3">
        Ingest multi-source signals → detect crisis → plan actions → simulate reroute, dispatch &amp; alerts.
      </p>

      <label className="flex items-center gap-2 text-[11px] text-on-surface-variant mb-2">
        <input
          type="checkbox"
          checked={useDemo}
          onChange={(e) => setUseDemo(e.target.checked)}
          className="accent-primary"
        />
        Include G-10 / George Town demo signals
      </label>

      <textarea
        value={customText}
        onChange={(e) => setCustomText(e.target.value)}
        placeholder='Add signal e.g. "G-10 mein pani bhar gaya hai..."'
        className="w-full bg-surface-container-high border border-outline-variant/40 rounded-lg p-3 text-sm text-on-surface min-h-[72px] mb-3 outline-none focus:border-primary/50"
      />

      <button
        type="button"
        onClick={handleRun}
        disabled={workflowRunning}
        className="w-full h-touch-target bg-primary text-on-primary font-bold rounded-lg uppercase tracking-widest text-sm active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">
          {workflowRunning ? 'hourglass_top' : 'play_circle'}
        </span>
        {workflowRunning ? `Phase: ${workflowPhase}` : 'Run Full Agent Pipeline'}
      </button>

      {workflowPhase === 'COMPLETE' && (
        <p className="text-[10px] text-primary mt-2 font-data-mono uppercase">
          ✓ View results in Agent Logs, Simulation &amp; Map
        </p>
      )}
    </section>
  );
}
