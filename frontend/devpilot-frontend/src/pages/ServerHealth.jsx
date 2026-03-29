import { useState, useEffect } from 'react';
import API from '../utils/api';
import { MdMonitor, MdRefresh, MdWifi, MdWifiOff } from 'react-icons/md';
import { FaServer, FaMemory, FaMicrochip } from 'react-icons/fa';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const ServerHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pingHost, setPingHost] = useState('');
  const [pingResult, setPingResult] = useState(null);
  const [pinging, setPinging] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchHealth = async () => {
    try {
      const { data } = await API.get('/server/health');
      setHealth(data);
      const mem = ((data.usedMemory / data.totalMemory) * 100).toFixed(1);
      setHistory(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        memory: parseFloat(mem),
        load: parseFloat((data.loadAverage[0] * 10).toFixed(1))
      }].slice(-10));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchHealth();
    const i = setInterval(fetchHealth, 5000);
    return () => clearInterval(i);
  }, []);

  const handlePing = async () => {
    if (!pingHost) return;
    setPinging(true);
    setPingResult(null);
    try {
      const { data } = await API.get(`/server/ping/${pingHost}`);
      setPingResult(data);
    } catch { setPingResult({ status: 'unreachable', host: pingHost }); }
    finally { setPinging(false); }
  };

  const memPercent = health ? parseFloat(((health.usedMemory / health.totalMemory) * 100).toFixed(1)) : 0;
  const radialData = [
    { name: 'Memory', value: memPercent, fill: '#a855f7' },
    { name: 'Load', value: Math.min((health?.loadAverage[0] || 0) * 10, 100), fill: '#06b6d4' },
  ];

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-400 animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 p-8 overflow-auto relative z-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold grad-text">Server Health</h1>
          <p className="text-gray-600 text-sm mt-1">Real-time monitoring</p>
        </div>
        <button onClick={fetchHealth}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass hover:border-purple-500/30 text-gray-400 hover:text-purple-300 transition-all text-sm">
          <MdRefresh size={16} />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Radial */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Resource Usage</h2>
          <p className="text-gray-600 text-xs mb-4">Memory & CPU load</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={radialData}>
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Tooltip contentStyle={{ background: '#0d0018', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {[{ color: '#a855f7', label: `Memory ${memPercent}%` }, { color: '#06b6d4', label: `Load ${health?.loadAverage[0]?.toFixed(2)}` }].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color, boxShadow: `0 0 8px ${l.color}` }}></div>
                <span className="text-gray-500 text-sm">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-3">
          {[
            { icon: <FaMemory />, label: 'Memory', value: `${(health?.usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB used`, sub: `${(health?.freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB free`, percent: memPercent, color: '#a855f7' },
            { icon: <FaMicrochip />, label: 'CPU', value: `${health?.cpus} Cores`, sub: `Load: ${health?.loadAverage?.map(l => l.toFixed(2)).join(' | ')}`, color: '#06b6d4' },
            { icon: <FaServer />, label: 'Uptime', value: `${Math.floor(health?.uptime / 3600)}h ${Math.floor((health?.uptime % 3600) / 60)}m`, sub: `Host: ${health?.hostname}`, color: '#ec4899' },
            { icon: <MdMonitor />, label: 'Platform', value: health?.platform, sub: `RAM: ${(health?.totalMemory / 1024 / 1024 / 1024).toFixed(1)} GB total`, color: '#f59e0b' },
          ].map((m, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-xl flex-shrink-0 text-lg" style={{ background: `${m.color}15`, border: `1px solid ${m.color}25`, color: m.color }}>{m.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-xs">{m.label}</p>
                <p className="text-white font-semibold text-sm">{m.value}</p>
                {m.percent !== undefined && (
                  <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${m.percent}%`, background: `linear-gradient(90deg, ${m.color}, #06b6d4)`, boxShadow: `0 0 8px ${m.color}` }}></div>
                  </div>
                )}
                <p className="text-gray-700 text-xs mt-1">{m.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History Chart */}
      <div className="glass rounded-2xl p-6 mb-5">
        <h2 className="text-white font-semibold mb-1">History</h2>
        <p className="text-gray-600 text-xs mb-4">Memory & load over time</p>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="mG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="time" stroke="#374151" tick={{ fontSize: 9, fill: '#4b5563' }} />
            <YAxis stroke="#374151" tick={{ fontSize: 9, fill: '#4b5563' }} />
            <Tooltip contentStyle={{ background: '#0d0018', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px' }} />
            <Area type="monotone" dataKey="memory" stroke="#a855f7" fill="url(#mG)" strokeWidth={2} dot={false} name="Memory %" />
            <Area type="monotone" dataKey="load" stroke="#06b6d4" fill="url(#lG)" strokeWidth={2} dot={false} name="Load" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Ping */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
          <MdWifi className="text-purple-400" />Ping Tool
        </h2>
        <p className="text-gray-600 text-xs mb-4">Test server connectivity</p>
        <div className="flex gap-3 mb-4">
          <input type="text" value={pingHost} onChange={e => setPingHost(e.target.value)}
            placeholder="Enter hostname (e.g. google.com)"
            className="flex-1 bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/40 transition-all"
            onKeyPress={e => e.key === 'Enter' && handlePing()} />
          <button onClick={handlePing} disabled={pinging || !pingHost}
            className="px-8 py-3 rounded-xl btn-grad text-white font-bold transition-all disabled:opacity-50">
            {pinging ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Pinging...
              </span>
            ) : 'Ping →'}
          </button>
        </div>
        {pingResult && (
          <div className={`p-4 rounded-xl border animate-fade-in ${
            pingResult.status === 'reachable' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-red-500/10 border-red-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {pingResult.status === 'reachable' ? <MdWifi className="text-purple-400" /> : <MdWifiOff className="text-red-400" />}
              <span className={`font-bold ${pingResult.status === 'reachable' ? 'text-purple-400' : 'text-red-400'}`}>
                {pingHost} is {pingResult.status}
              </span>
            </div>
            {pingResult.output && (
              <pre className="text-gray-500 text-xs font-mono mt-2 bg-black/30 p-3 rounded-lg overflow-auto max-h-32">{pingResult.output}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerHealth;