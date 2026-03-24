import { useState, useEffect } from 'react';
import API from '../utils/api';
import { MdMemory, MdStorage, MdComputer, MdRefresh } from 'react-icons/md';
import { FaDocker, FaServer } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="card-glow rounded-2xl p-6">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl`} style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">Live</span>
    </div>
    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
    <p className="text-gray-400 text-sm">{title}</p>
    {subtitle && <p className="text-xs mt-1" style={{ color }}>{subtitle}</p>}
  </div>
);

const Dashboard = () => {
  const [health, setHealth] = useState(null);
  const [containers, setContainers] = useState([]);
  const [memoryHistory, setMemoryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const [healthRes, containersRes] = await Promise.all([
        API.get('/server/health'),
        API.get('/docker/containers')
      ]);
      setHealth(healthRes.data);
      setContainers(containersRes.data);

      const memUsed = ((healthRes.data.usedMemory / healthRes.data.totalMemory) * 100).toFixed(1);
      setMemoryHistory(prev => {
        const newEntry = {
          time: new Date().toLocaleTimeString(),
          memory: parseFloat(memUsed)
        };
        const updated = [...prev, newEntry];
        return updated.slice(-10);
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    const gb = bytes / 1024 / 1024 / 1024;
    return `${gb.toFixed(1)} GB`;
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const runningContainers = containers.filter(c => c.state === 'running').length;
  const stoppedContainers = containers.filter(c => c.state !== 'running').length;
  const memUsedPercent = health ? ((health.usedMemory / health.totalMemory) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time infrastructure overview</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-sm"
        >
          <MdRefresh size={16} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Memory Used"
          value={`${memUsedPercent}%`}
          subtitle={health ? `${formatBytes(health.usedMemory)} / ${formatBytes(health.totalMemory)}` : ''}
          icon={<MdMemory size={24} />}
          color="#00ff88"
        />
        <StatCard
          title="Running Containers"
          value={runningContainers}
          subtitle={`${stoppedContainers} stopped`}
          icon={<FaDocker size={24} />}
          color="#00d4ff"
        />
        <StatCard
          title="CPU Cores"
          value={health?.cpus || 0}
          subtitle={`Load: ${health?.loadAverage[0]?.toFixed(2) || 0}`}
          icon={<MdComputer size={24} />}
          color="#7c3aed"
        />
        <StatCard
          title="Server Uptime"
          value={health ? formatUptime(health.uptime) : '0h 0m'}
          subtitle={health?.hostname || ''}
          icon={<FaServer size={24} />}
          color="#f59e0b"
        />
      </div>

      {/* Memory Chart */}
      <div className="card-glow rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Memory Usage Over Time</h2>
          <span className="text-xs text-gray-500">Updates every 10s</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={memoryHistory}>
            <defs>
              <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
            <XAxis dataKey="time" stroke="#4b5563" tick={{ fontSize: 11 }} />
            <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: '#0d1224', border: '1px solid #00ff88', borderRadius: '8px' }}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#00ff88' }}
            />
            <Area type="monotone" dataKey="memory" stroke="#00ff88" fill="url(#memGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Containers */}
      <div className="card-glow rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Containers</h2>
        {containers.length === 0 ? (
          <div className="text-center py-8">
            <FaDocker className="text-gray-700 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">No containers found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {containers.slice(0, 5).map((container) => (
              <div key={container.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0a0e1a] border border-gray-800">
                <div className="flex items-center gap-3">
                  <FaDocker className="text-[#00d4ff]" />
                  <div>
                    <p className="text-white text-sm font-medium">{container.name}</p>
                    <p className="text-gray-500 text-xs">{container.image}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  container.state === 'running'
                    ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}>
                  {container.state}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-gray-600 text-xs mt-6">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </p>
    </div>
  );
};

export default Dashboard;