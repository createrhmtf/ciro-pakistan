import { useEffect, useState } from 'react';
import { isMock } from '../services/firebase';
import { apiService } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function LiveSetupBanner() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    apiService
      .getHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const apiLive = health?.status === 'healthy';
  const firestoreLive = health?.integrations?.firestore?.connected;
  const missingAppId = !import.meta.env.VITE_FIREBASE_APP_ID?.trim();
  const missingSender = !import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim();

  if (apiLive && firestoreLive && !isMock && !missingAppId) return null;
  if (apiLive && !firestoreLive && !isMock && !missingAppId && !missingSender) {
    return (
      <div className="mb-4 p-3 rounded-lg border border-primary/30 bg-primary/10 text-[11px] text-on-surface">
        <p className="font-bold text-primary uppercase tracking-wider mb-1">API live — connect Firestore cloud</p>
        <p className="text-on-surface-variant">
          Place the downloaded service account JSON in{' '}
          <code className="text-primary">backend/secrets</code> then restart backend.
        </p>
      </div>
    );
  }

  if (apiLive && firestoreLive) return null;

  return (
    <div className="mb-4 p-3 rounded-lg border border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[11px] text-on-surface leading-relaxed">
      <p className="font-bold text-[#F59E0B] uppercase tracking-wider mb-1">
        {apiLive ? 'Partial live mode' : 'Backend not connected'}
      </p>
      <ul className="list-disc pl-4 space-y-1 text-on-surface-variant">
        {!apiLive && (
          <li>
            Start backend: <code className="text-primary">cd backend && python main.py</code> ({API_URL})
          </li>
        )}
        {apiLive && !firestoreLive && (
          <li>
            Database: using local file. For Firebase Console, add the service account JSON to{' '}
            <code className="text-primary">backend/secrets</code>
          </li>
        )}
        {isMock && (
          <li>
            Add <code className="text-primary">VITE_FIREBASE_APP_ID</code> from Firebase Console Web app config
          </li>
        )}
      </ul>
    </div>
  );
}
