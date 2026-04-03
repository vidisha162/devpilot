import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Containers from './pages/Containers';
import ServerHealth from './pages/ServerHealth';
import SystemInfo from './pages/SystemInfo';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import API from './utils/api';

import Kubernetes from './pages/Kubernetes';
import Deploy from './pages/Deploy';
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#030008] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="grad-text text-sm animate-pulse">Loading DevPilot...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/" />;
};

const Layout = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const { data } = await API.get('/server/health');
        const newAlerts = [];
        const memPercent = (data.usedMemory / data.totalMemory) * 100;
        if (memPercent > 80) {
          newAlerts.push({
            title: 'High Memory',
            message: `Memory at ${memPercent.toFixed(1)}%`,
            type: 'warning',
            read: false,
            time: new Date().toLocaleTimeString()
          });
        }
        const { data: containers } = await API.get('/docker/containers');
        const stopped = containers.filter(c => c.state !== 'running').length;
        if (stopped > 0) {
          newAlerts.push({
            title: 'Stopped Containers',
            message: `${stopped} container(s) not running`,
            type: 'warning',
            read: false,
            time: new Date().toLocaleTimeString()
          });
        }
        setAlerts(newAlerts);
      } catch (e) { console.error(e); }
    };
    checkAlerts();
    const i = setInterval(checkAlerts, 30000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#030008] relative overflow-hidden">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <Topbar alerts={alerts} />
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>
          } />
          <Route path="/containers" element={
            <PrivateRoute><Layout><Containers /></Layout></PrivateRoute>
          } />
          <Route path="/server" element={
            <PrivateRoute><Layout><ServerHealth /></Layout></PrivateRoute>
          } />
          <Route path="/system" element={
            <PrivateRoute><Layout><SystemInfo /></Layout></PrivateRoute>
          } />
          <Route path="/kubernetes" element={
           <PrivateRoute><Layout><Kubernetes /></Layout></PrivateRoute>
          } />
          <Route path="/deploy" element={
           <PrivateRoute><Layout><Deploy /></Layout></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;