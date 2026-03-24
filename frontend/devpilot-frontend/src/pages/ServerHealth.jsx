import { useState, useEffect } from 'react';
import API from '../utils/api';
import { MdMonitor, MdRefresh, MdWifi, MdWifiOff } from 'react-icons/md';
import { FaServer, FaMemory, FaMicrochip } from 'react-icons/fa';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

const ServerHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pingHost, setPingHost] = useState('');
  const [pingResult, setPingResult] = useState(null);
  const [pinging, setPinging] = useState(false);

  const fetchHealth = async () => {
    try {
      const { data } = await API.get('/server/health');
      setHealth(data);
    } catch (error) {
      console.error('Error fetching health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePing = async () => {
    if (!pingHost) return;
    setPinging(true);
    setPingResult(null);
    try {
      const { data } = await API.get(`/server/ping/${pingHost}`);
      setPingResult(data);
    } catch (error) {
      setPingResult({ status: 'unreachable', host: pingHost });
    } finally {
      setPinging(false);
    }
  };

  const formatBytes = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(2);
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const memPercent = health
    ? parseFloat(((health.usedMemory / health.totalMemory) * 100).toFixed(1))
    : 0;

  const radialData = [
    { name: 'Memory', value: memPercent, fill: '#00ff88' },
    { name: 'Load', value: health ? Math.min(health.loadAverage[0] * 10, 100) : 0, fill: '#00d4ff' },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Server Health</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time server monitoring</p>
        </div>
        <button
          onClick={fetchHealth}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-sm"
        >
          <MdRefresh size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Radial Chart */}
        <div className="card-glow rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Resource Usage</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="90%"
              data={radialData}
            >
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#1a2332' }} />
              <Tooltip
                contentStyle={{ background: '#0d1224', border: '1px solid #00ff88', borderRadius: '8px' }}
                itemStyle={{ color: '#00ff88' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00ff88]"></div>
              <span className="text-gray-400 text-sm">Memory {memPercent}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00d4ff]"></div>
              <span className="text-gray-400 text-sm">Load {health?.loadAverage[0]?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="space-y-4">
          <div className="card-glow rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30">
              <FaMemory className="text-[#00ff88] text-xl" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-sm">Memory</p>
              <p className="text-white font-bold">{formatBytes(health?.usedMemory)} GB used</p>
              <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00ff88] rounded-full transition-all"
                  style={{ width: `${memPercent}%` }}
                ></div>
              </div>
            </div>
            <span className="text-[#00ff88] font-bold">{memPercent}%</span>
          </div>

          <div className="card-glow rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30">
              <FaMicrochip className="text-[#00d4ff] text-xl" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-sm">CPU Cores</p>
              <p className="text-white font-bold">{health?.cpus} Cores</p>
              <p className="text-gray-500 text-xs mt-1">Load avg: {health?.loadAverage?.map(l => l.toFixed(2)).join(' | ')}</p>
            </div>
          </div>

          <div className="card-glow rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30">
              <FaServer className="text-[#f59e0b] text-xl" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-sm">Uptime</p>
              <p className="text-white font-bold">{formatUptime(health?.uptime)}</p>
              <p className="text-gray-500 text-xs mt-1">Host: {health?.hostname}</p>
            </div>
          </div>

          <div className="card-glow rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/30">
              <MdMonitor className="text-[#7c3aed] text-xl" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-sm">Platform</p>
              <p className="text-white font-bold">{health?.platform}</p>
              <p className="text-gray-500 text-xs mt-1">Free: {formatBytes(health?.freeMemory)} GB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ping Tool */}
      <div className="card-glow rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MdWifi className="text-[#00ff88]" />
          Ping Tool
        </h2>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={pingHost}
            onChange={(e) => setPingHost(e.target.value)}
            placeholder="Enter host (e.g. google.com)"
            className="flex-1 bg-[#0a0e1a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88] transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handlePing()}
          />
          <button
            onClick={handlePing}
            disabled={pinging || !pingHost}
            className="px-6 py-3 rounded-xl bg-[#00ff88] text-[#0a0e1a] font-bold hover:bg-[#00ff88]/90 transition-all disabled:opacity-50"
          >
            {pinging ? 'Pinging...' : 'Ping'}
          </button>
        </div>

        {pingResult && (
          <div className={`p-4 rounded-xl border ${
            pingResult.status === 'reachable'
              ? 'bg-[#00ff88]/10 border-[#00ff88]/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {pingResult.status === 'reachable'
                ? <MdWifi className="text-[#00ff88] text-xl" />
                : <MdWifiOff className="text-red-400 text-xl" />
              }
              <span className={`font-bold ${pingResult.status === 'reachable' ? 'text-[#00ff88]' : 'text-red-400'}`}>
                {pingHost} is {pingResult.status}
              </span>
            </div>
            {pingResult.output && (
              <pre className="text-gray-400 text-xs font-mono mt-2 overflow-auto max-h-32">
                {pingResult.output}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerHealth;