import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  const toast = useCallback((message, opts = {}) => {
    return addToast(message, opts.type || 'info', opts.duration || 3500);
  }, [addToast]);

  toast.success = (message, opts = {}) => addToast(message, 'success', opts.duration || 3500);
  toast.error = (message, opts = {}) => addToast(message, 'error', opts.duration || 3500);

  const iconMap = {
    success: '✅',
    error: '❌',
    info: '🛡️',
  };

  const borderMap = {
    success: 'border-[#1D9E75]/30',
    error: 'border-error/30',
    info: 'border-primary/20',
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl flex items-center gap-2.5 min-w-[260px] max-w-[400px]
              border ${borderMap[t.type] || borderMap.info}
              animate-slide-in-up shadow-[0_8px_32px_rgba(0,0,0,0.4)]`}
            style={{
              background: 'rgba(30,32,32,0.95)',
              backdropFilter: 'blur(12px)',
            }}
            onClick={() => removeToast(t.id)}
          >
            <span className="text-[16px] shrink-0">{iconMap[t.type] || iconMap.info}</span>
            <span className="text-[13px] text-on-surface font-medium">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
