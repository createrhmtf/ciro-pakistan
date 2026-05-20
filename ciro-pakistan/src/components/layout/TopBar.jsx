import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import ProfileButton from '../ProfileButton';

export default function TopBar() {
  const [connectionStatus, setConnectionStatus] = useState('CHECKING');
  const [integrationHint, setIntegrationHint] = useState('');

  useEffect(() => {
    // Check connection health function
    const checkConnection = async () => {
      if (!navigator.onLine) {
        setConnectionStatus('OFFLINE');
        return;
      }

      try {
        const health = await apiService.getHealth();
        if (health && (health.status === 'ok' || health.status === 'healthy')) {
          setConnectionStatus('LIVE');
          const integ = health.integrations;
          if (integ) {
            const parts = [];
            if (integ.firestore?.connected) parts.push('DB');
            if (integ.gemini?.live) parts.push('AI');
            if (integ.maps?.live) parts.push('Maps');
            setIntegrationHint(parts.join('·') || 'API');
          }
        } else {
          setConnectionStatus('ERROR');
          setIntegrationHint('');
        }
      } catch (err) {
        console.error('Connection health check failed:', err);
        setConnectionStatus('ERROR');
      }
    };

    // Initial check
    checkConnection();

    // Check periodically every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    // Watch browser network state
    const handleOnline = () => checkConnection();
    const handleOffline = () => setConnectionStatus('OFFLINE');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-background border-b border-primary/20 flex justify-between items-center px-container-padding h-touch-target">
      <div className="flex items-center gap-2">
        <button className="p-1 -ml-1 text-outline hover:text-primary active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <span className="material-symbols-outlined text-primary">security</span>
        <div className="flex flex-col leading-tight">
          <span className="font-headline-md text-headline-md font-bold text-primary">CIRO PAKISTAN</span>
          <span className="text-[10px] font-medium text-outline uppercase tracking-wider">Pakistan Crisis Monitor</span>
        </div>
      </div>
      
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-300
        ${connectionStatus === 'LIVE' ? 'bg-[#1d9e75]/10 border-[#1d9e75]/30 text-[#1d9e75]' : ''}
        ${connectionStatus === 'OFFLINE' ? 'bg-error/10 border-error/30 text-error' : ''}
        ${connectionStatus === 'ERROR' ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]' : ''}
        ${connectionStatus === 'CHECKING' ? 'bg-surface-container-high border-outline/30 text-outline' : ''}
      `}>
        <span className={`w-2 h-2 rounded-full
          ${connectionStatus === 'LIVE' ? 'bg-[#1d9e75] animate-pulse' : ''}
          ${connectionStatus === 'OFFLINE' ? 'bg-error animate-ping' : ''}
          ${connectionStatus === 'ERROR' ? 'bg-[#F59E0B] animate-pulse' : ''}
          ${connectionStatus === 'CHECKING' ? 'bg-outline animate-pulse' : ''}
        `}></span>
        <span className="font-data-mono text-[11px] font-bold uppercase tracking-wider">
          {connectionStatus === 'LIVE' && (integrationHint ? `LIVE ${integrationHint}` : 'LIVE')}
          {connectionStatus === 'OFFLINE' && 'OFFLINE'}
          {connectionStatus === 'ERROR' && 'START BACKEND'}
          {connectionStatus === 'CHECKING' && 'CONNECTING...'}
        </span>
      </div>

      <ProfileButton />
    </header>
  );
}
