import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CiroProvider } from './store/ciroStore';
import { AuthProvider } from './auth/AuthProvider';
import { ToastProvider } from './components/ToastProvider';
import Layout from './components/layout/Layout';
import Splash from './pages/Splash';
import Dashboard from './pages/Dashboard';
import CrisisMap from './pages/CrisisMap';
import AlertsPanel from './pages/AlertsPanel';
import AgentLogs from './pages/AgentLogs';
import Simulation from './pages/Simulation';
import EmergencyFeed from './pages/EmergencyFeed';
import SystemStatus from './pages/SystemStatus';

export default function App() {
  return (
    <CiroProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Splash screen is outside the layout */}
              <Route path="/splash" element={<Splash />} />
              
              {/* Main App Layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="map" element={<CrisisMap />} />
                <Route path="alerts" element={<AlertsPanel />} />
                <Route path="agent-logs" element={<AgentLogs />} />
                <Route path="simulation" element={<Simulation />} />
                <Route path="feed" element={<EmergencyFeed />} />
                <Route path="status" element={<SystemStatus />} />
              </Route>

              {/* Redirect any unknown route to splash */}
              <Route path="*" element={<Navigate to="/splash" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </CiroProvider>
  );
}
