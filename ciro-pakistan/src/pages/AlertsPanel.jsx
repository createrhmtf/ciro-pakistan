import { useState } from 'react';
import { useCiro } from '../store/ciroStore';
import { MOCK_ACTIONS, ACTION_TYPES } from '../data/mockActions';

const ALERT_FILTER_OPTIONS = ['ALL', 'ALERT', 'DISPATCH', 'NOTIFY', 'REROUTE', 'RETRACTION'];

export default function AlertsPanel() {
  const { state } = useCiro();
  const [filter, setFilter] = useState('ALL');

  const actions = state.actions.length ? state.actions : MOCK_ACTIONS;
  const filtered = filter === 'ALL' ? actions : actions.filter(a => a.type === filter);


  return (
    <div className="relative pb-8">
      <div className="pr-10">
        <header className="mb-4">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">Stakeholder Alerts</h1>
            <span className="bg-primary-container/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded border border-primary/20">
              {actions.length} SENT
            </span>
          </div>
        </header>

        {/* Horizontal Tabs */}
        <nav className="sticky top-0 bg-background z-30 overflow-x-auto custom-scrollbar border-b border-outline-variant/10 -mx-4 px-4 mb-4 pr-12">
          <div className="flex gap-6 h-12 items-center min-w-max">
            {ALERT_FILTER_OPTIONS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`h-full px-1 text-label-muted font-label-muted uppercase ${
                  filter === f
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </nav>

        {/* Alert Cards List */}
        <div className="space-y-stack-gap">
          {filtered.map(action => {
            const atype = ACTION_TYPES[action.type] || {};
            let colorTheme = 'primary';
            if (action.impact === 'critical' || action.is_retraction) colorTheme = 'error';
            else if (action.impact === 'high') colorTheme = 'secondary';
            else if (action.impact === 'medium') colorTheme = 'tertiary';

            const borderColor = `border-${colorTheme}/30`;
            const textColor = `text-${colorTheme}`;
            const bgBadgeColor = `bg-${colorTheme}/10`;

            return (
              <div key={action.id} className={`bg-surface-container-low border ${borderColor} p-4 rounded-lg transition-transform active:scale-[0.98]`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined ${textColor} text-[20px]`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {atype.icon === '📢' ? 'speaker_phone' : atype.icon === '🚑' ? 'local_hospital' : atype.icon === '📱' ? 'sms' : atype.icon === '⛔' ? 'alt_route' : 'notifications'}
                    </span>
                    <span className={`${bgBadgeColor} ${textColor} text-[11px] font-bold px-2 py-0.5 rounded border border-${colorTheme}/20`}>
                      {action.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">done_all</span>
                    <span className="text-data-mono font-data-mono uppercase">{action.status}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="font-body-md text-body-md text-on-surface leading-snug">{action.alert_text_en || action.detail || action.title}</p>
                  {action.alert_text_ur && (
                    <p className="font-body-md text-body-md text-on-surface/80 leading-relaxed text-right" dir="rtl">{action.alert_text_ur}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
                  <div className="flex gap-2">
                    {action.ticket && <span className="text-data-mono font-data-mono text-on-surface-variant">{action.ticket}</span>}
                  </div>
                  <span className="text-data-mono font-data-mono text-on-surface-variant uppercase">
                    {new Date(action.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
