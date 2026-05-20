import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();
  const [fadeState, setFadeState] = useState('in'); // 'in' or 'out'

  useEffect(() => {
    // Reset any rogue body opacity from previous hot-reloads
    document.body.style.opacity = '1';
    document.body.style.transition = 'none';
  }, []);

  const handleEnter = () => {
    setFadeState('out');
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  return (
    <div
      className={`bg-background text-on-surface flex flex-col items-center justify-between min-h-screen px-container-padding py-12 overflow-hidden fixed inset-0 z-[100] transition-opacity duration-500 ease-out`}
      style={{ opacity: fadeState === 'out' ? 0 : 1, backgroundColor: '#0A1628' }}
    >
      {/* Top Decorator */}
      <div className="w-full flex justify-between items-start opacity-30">
        <div className="font-data-mono text-[10px] text-primary tracking-widest uppercase">
          INIT_SEQUENCE_v1.0
          <br />
          SYS_CHECK: OK
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-primary/40 rounded-full"></div>
          <div className="w-2 h-2 bg-primary/40 rounded-full"></div>
        </div>
      </div>

      {/* Main Branding - Centered */}
      <div className="flex flex-col items-center justify-center flex-1 w-full relative">
        {/* Animated Shield Logo */}
        <div className="relative mb-8 w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse-icon"></div>
          <div className="absolute inset-4 bg-primary/10 rounded-full animate-pulse-icon" style={{ animationDelay: '0.5s' }}></div>
          <div className="relative z-10 w-20 h-20 bg-primary rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_40px_rgba(104,219,174,0.3)] border border-primary/30">
            <span className="material-symbols-outlined text-background text-[40px] -rotate-45" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
          </div>
        </div>

        <h1 className="font-headline-lg text-headline-lg text-on-surface text-center mb-3 animate-fade-in uppercase tracking-tight">
          CIRO <span className="text-primary font-bold">Pakistan</span>
        </h1>

        <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-[280px] animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          Agentic Crisis Intelligence &amp; Response Orchestrator
        </p>

        {/* Loading / Status Bar */}
        <div className="w-full max-w-[240px] mt-12 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <div className="flex justify-between font-data-mono text-[10px] text-on-surface-variant mb-2">
            <span>NEURAL_NET_SYNC</span>
            <span className="text-primary">100%</span>
          </div>
          <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary w-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="w-full animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
        <button
          onClick={handleEnter}
          className="w-full h-touch-target bg-primary text-on-primary font-headline-md text-[16px] rounded-full uppercase tracking-widest shadow-[0_4px_20px_rgba(104,219,174,0.2)] transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          Enter Command Center
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
