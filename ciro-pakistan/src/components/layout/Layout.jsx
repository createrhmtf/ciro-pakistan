import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { useCiro } from '../../store/ciroStore';
import { apiService, connectRealtime } from '../../services/api';
import { useFirestoreLive } from '../../hooks/useFirestoreLive';
import LiveSetupBanner from '../LiveSetupBanner';

export default function Layout() {
  const { setCrises, setAlerts, setActions, updateStats, setReasoningTrace, setSimulation } = useCiro();

  useFirestoreLive({ setCrises, setAlerts, setActions, setReasoningTrace, setSimulation });

  const fetchLiveData = async () => {
    try {
      const crises = await apiService.getCrisisHistory();
      const alerts = await apiService.getAlerts();
      const simulation = await apiService.getSimulation();

      if (crises && crises.length > 0) {
        setCrises(crises);
      }

      if (alerts) {
        setActions(alerts);
        const mappedAlerts = alerts.map((a) => ({
          id: a.id,
          crisis_id: a.crisis_id,
          type: a.type === 'RETRACTION' ? 'RETRACTION' : 'ALERT',
          title: a.title,
          message_en: a.alert_text_en || a.detail,
          message_ur: a.alert_text_ur,
          timestamp: a.timestamp,
          ticket: a.ticket,
        }));
        setAlerts(mappedAlerts);
      }

      if (crises) {
        const activeCount = crises.filter((c) => c.status === 'ACTIVE').length;
        updateStats({
          activeCrises: activeCount,
          resourcesDeployed: crises.length * 12 + 10,
          alertsIssued: alerts ? alerts.length : 0,
          livesProtected: crises.reduce((sum, c) => sum + (c.affected_population || 0), 0) / 100 + 45,
          avgResponseTime: 6.5,
          populationReached: crises.reduce((sum, c) => sum + (c.affected_population || 0), 0),
        });
      }

      if (simulation) {
        setSimulation(simulation);
      }
    } catch (err) {
      console.error('Failed to poll real-time database:', err);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5000);
    const disconnect = connectRealtime((msg) => {
      if (msg.type === 'trace' && msg.payload) {
        apiService.getAgentTraces().then((traces) => {
          const mapped = traces.map((t) => ({
            id: t.id,
            agent: t.agent_id === 0 ? 'Orchestrator' : t.agent_name,
            observation: t.step,
            reasoning: t.details,
            action: t.status,
            timestamp: t.timestamp,
          }));
          setReasoningTrace(mapped.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        }).catch(() => {});
      }
      if (msg.type === 'workflow_complete') {
        fetchLiveData();
      }
    });
    return () => {
      clearInterval(interval);
      disconnect();
    };
  }, [setCrises, setAlerts, setActions, updateStats, setReasoningTrace, setSimulation]);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <main className="flex-1 mt-touch-target mb-20 px-container-padding">
        <LiveSetupBanner />
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
