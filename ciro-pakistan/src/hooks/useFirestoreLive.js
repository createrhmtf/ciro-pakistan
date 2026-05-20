import { useEffect } from 'react';
import { collection, limit, onSnapshot, query } from 'firebase/firestore';
import { db, isMock } from '../services/firebase';

/**
 * Real-time Firestore listeners for collections written by the backend.
 */
export function useFirestoreLive({
  setCrises,
  setAlerts,
  setActions,
  setReasoningTrace,
  setSimulation,
  enabled = true,
}) {
  useEffect(() => {
    if (!enabled || isMock || !db) return undefined;

    const unsubs = [];
    const domainDocs = (snap) => snap.docs.filter((d) => !d.id.startsWith('_') && !d.data()?._system);

    try {
      const crisesQ = query(collection(db, 'crises'), limit(50));
      unsubs.push(
        onSnapshot(
          crisesQ,
          (snap) => {
            const crises = domainDocs(snap).map((d) => ({ id: d.id, ...d.data() }));
            if (crises.length) setCrises(crises);
          },
          (err) => console.warn('[Firestore] crises listener:', err.message),
        ),
      );

      const alertsQ = query(collection(db, 'alerts'), limit(80));
      unsubs.push(
        onSnapshot(
          alertsQ,
          (snap) => {
            const alerts = domainDocs(snap)
              .map((d) => ({ id: d.id, ...d.data() }))
              .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
            setActions(alerts);
            setAlerts(
              alerts.map((a) => ({
                id: a.id,
                crisis_id: a.crisis_id,
                type: a.type === 'RETRACTION' ? 'RETRACTION' : 'ALERT',
                title: a.title,
                message_en: a.alert_text_en || a.detail,
                message_ur: a.alert_text_ur,
                timestamp: a.timestamp,
                ticket: a.ticket,
              })),
            );
          },
          (err) => console.warn('[Firestore] alerts listener:', err.message),
        ),
      );

      const tracesQ = query(collection(db, 'traces'), limit(120));
      unsubs.push(
        onSnapshot(
          tracesQ,
          (snap) => {
            const traces = domainDocs(snap)
              .map((d) => d.data())
              .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
              .map((t) => {
                let agent = 'Orchestrator';
                if (t.agent_id === 1) agent = 'Fusion';
                else if (t.agent_id === 2) agent = 'Detection';
                else if (t.agent_id === 3) agent = 'Allocation';
                else if (t.agent_id === 4) agent = 'Execution';
                return {
                  id: t.id,
                  agent,
                  observation: `Phase: ${t.step}`,
                  reasoning: t.details,
                  action: `Status: ${t.status}`,
                  timestamp: t.timestamp,
                };
              });
            if (traces.length) setReasoningTrace(traces);
          },
          (err) => console.warn('[Firestore] traces listener:', err.message),
        ),
      );

      if (setSimulation) {
        const simulationsQ = query(collection(db, 'simulations'), limit(10));
        unsubs.push(
          onSnapshot(
            simulationsQ,
            (snap) => {
              const simulations = domainDocs(snap)
                .map((d) => ({ id: d.id, ...d.data() }))
                .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
              if (simulations.length) setSimulation(simulations[0]);
            },
            (err) => console.warn('[Firestore] simulations listener:', err.message),
          ),
        );
      }
    } catch (e) {
      console.warn('[Firestore] live sync unavailable:', e);
    }

    return () => unsubs.forEach((fn) => fn());
  }, [enabled, setCrises, setAlerts, setActions, setReasoningTrace, setSimulation]);
}
