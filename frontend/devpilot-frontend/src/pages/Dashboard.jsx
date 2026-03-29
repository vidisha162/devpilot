import { useState, useEffect } from 'react';
import API from '../utils/api';
import { MdMemory, MdComputer, MdRefresh, MdWarning } from 'react-icons/md';
import { FaDocker, FaServer } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const StatCard = ({ title, value, subtitle, icon, gradient, delay = 0 }) => (
  <div className="glass rounded-2xl p-6 card-glow relative overflow-hidden group"
    style={{ animationDelay: `${delay}s` }}>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: gradient.replace(')', ', 0.05)').replace('135deg,', '135deg,') }}></div>
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-5">
        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {icon}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#a855f7', boxShadow: '0 0 6px #a855f7' }}></div>
          <span className="text-xs text-gray-600">Live</span>
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-500 text-sm">{title}</p>
      {subtitle && <p className="text-xs mt-2" style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{subtitle}</p>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl p-3 shadow-xl" style={{ boxShadow: '0 10px 40px rgba(168,85,247,0.2)' }}>
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>{p.name}: {p.value}{p.name?.includes('mem') ? '%' : ''}</p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [health, setHealth] = useState(null);
  const [containers, setContainers] = useState([]);
  const [memHistory, setMemHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const [hRes, cRes] = await Promise.all([
        API.get('/server/health'),
        API.get('/docker/containers')
      ]);
      setHealth(hRes.data);
      setContainers(cRes.data);
      const memUsed = ((hRes.data.usedMemory / hRes.data.totalMemory) * 100).toFixed(1);
      setMemHistory(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        memory: parseFloat(memUsed),
      }].slice(-12));
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 10000);
    return () => clearInterval(i);
  }, []);

  const running = containers.filter(c => c.state === 'running').length;
  const stopped = containers.filter(c => c.state !== 'running').length;
  const memPercent = health ? ((health.usedMemory / health.totalMemory) * 100).toFixed(1) : 0;
  const fmtBytes = b => `${(b / 1024 / 1024 / 1024).toFixed(1)} GB`;
  const fmtUptime = s => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;

  const barData = [
    { name: 'Running', value: running },
    { name: 'Stopped', value: stopped },
  ];

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-400 animate-spin mx-auto mb-4"></div>
        <p className="grad-text text-sm animate-pulse">Loading infrastructure...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-8 overflow-auto relative z-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold grad-text">Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Real-time infrastructure overview</p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass hover:border-purple-500/30 text-gray-400 hover:text-purple-300 transition-all text-sm">
          <MdRefresh size={16} />
          Refresh
        </button>
      </div>

      {/* Warning */}
      {stopped > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-center gap-3 animate-fade-in">
          <MdWarning className="text-yellow-500 flex-shrink-0" size={18} />
          <p className="text-yellow-400/80 text-sm">
            <span className="font-bold text-yellow-400">{stopped} container(s)</span> are stopped. Visit Containers to manage them.
          </p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Memory Used" value={`${memPercent}%`}
          subtitle={health ? `${fmtBytes(health.usedMemory)} / ${fmtBytes(health.totalMemory)}` : ''}
          icon={<MdMemory size={22} />}
          gradient="linear-gradient(135deg, #a855f7, #06b6d4)" delay={0} />
        <StatCard title="Running Containers" value={running}
          subtitle={`${stopped} stopped · ${containers.length} total`}
          icon={<FaDocker size={22} />}
          gradient="linear-gradient(135deg, #06b6d4, #3b82f6)" delay={0.1} />
        <StatCard title="CPU Cores" value={health?.cpus || 0}
          subtitle={`Load: ${health?.loadAverage[0]?.toFixed(2) || 0}`}
          icon={<MdComputer size={22} />}
          gradient="linear-gradient(135deg, #ec4899, #a855f7)" delay={0.2} />
        <StatCard title="Server Uptime" value={health ? fmtUptime(health.uptime) : '0h 0m'}
          subtitle={health?.hostname}
          icon={<FaServer size={22} />}
          gradient="linear-gradient(135deg, #f59e0b, #ec4899)" delay={0.3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-semibold">Memory Usage</h2>
              <p className="text-gray-600 text-xs mt-0.5">Last 12 snapshots</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              10s interval
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={memHistory}>
              <defs>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="time" stroke="#374151" tick={{ fontSize: 9, fill: '#4b5563' }} />
              <YAxis stroke="#374151" tick={{ fontSize: 9, fill: '#4b5563' }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="memory" name="memory" stroke="#a855f7" fill="url(#memGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Containers</h2>
          <p className="text-gray-600 text-xs mb-5">Status overview</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={barData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" stroke="#374151" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis stroke="#374151" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="containers" radius={[6, 6, 0, 0]}>
                <Cell fill="#a855f7" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2.5">
            {[
              { label: 'Running', val: running, color: '#a855f7' },
              { label: 'Stopped', val: stopped, color: '#ef4444' },
              { label: 'Total', val: containers.length, color: '#6b7280' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }}></div>
                  <span className="text-gray-500 text-xs">{s.label}</span>
                </div>
                <span className="text-white text-sm font-bold">{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Containers */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <FaDocker className="text-purple-400" />
            Recent Containers
          </h2>
          <span className="text-xs text-gray-600">Updated {lastUpdated.toLocaleTimeString()}</span>
        </div>
        <div className="space-y-2">
          {containers.slice(0, 6).map(c => (
            <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5 hover:border-purple-500/20 hover:bg-white/5 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: c.state === 'running' ? '#a855f7' : '#ef4444',
                    boxShadow: c.state === 'running' ? '0 0 8px #a855f7' : 'none'
                  }}></div>
                <div>
                  <p className="text-gray-200 text-sm font-medium">{c.name}</p>
                  <p className="text-gray-700 text-xs font-mono">{c.image}</p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full ${
                c.state === 'running'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>{c.state}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;