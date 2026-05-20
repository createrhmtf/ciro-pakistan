import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[999] gap-4">
      {/* Animated shield */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-pulse" />
        <div className="relative w-10 h-10 bg-primary/10 rounded-xl rotate-45 flex items-center justify-center border border-primary/30">
          <span className="material-symbols-outlined text-primary text-[24px] -rotate-45" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
        </div>
      </div>
      <div className="text-[11px] font-data-mono text-outline uppercase tracking-[0.2em] animate-pulse">
        Initializing Auth...
      </div>
    </div>
  );
}
