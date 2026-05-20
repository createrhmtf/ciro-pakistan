import React from 'react';

export default function MicrosoftLoginButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
        bg-white/[0.03] border border-white/10 hover:border-[#00A4EF]/40 hover:bg-[#00A4EF]/[0.06]
        transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Microsoft SVG Logo */}
      <svg viewBox="0 0 21 21" width="18" height="18" className="shrink-0">
        <rect x="1" y="1" width="9" height="9" fill="#F25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
        <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
        <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
      </svg>
      <span className="text-[13px] font-medium text-on-surface/80 group-hover:text-on-surface transition-colors">
        Continue with Microsoft
      </span>
    </button>
  );
}
