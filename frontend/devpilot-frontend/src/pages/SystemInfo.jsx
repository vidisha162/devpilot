import { useState, useEffect } from 'react';
import API from '../utils/api';
import { MdStorage, MdRefresh } from 'react-icons/md';
import { FaServer, FaMemory, FaMicrochip, FaCode, FaLinux } from 'react-icons/fa';

const SystemInfo = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInfo = async () => {
    try {
      const { data } = await API.get('/server/info');
      setInfo(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInfo(); }, []);

  const cards = info ? [
    { icon: <FaServer />, label: 'Hostname', value: info.hostname, color: '#a855f7' },
    { icon: <FaLinux />, label: 'Platform', value: info.platform, sub: `Arch: ${info.arch}`, color: '#06b6d4' },
    { icon: <FaCode />, label: 'Node.js', value: info.nodeVersion, color: '#ec4899' },
    { icon: <FaMicrochip />, label: 'CPU Cores', value: `${info.cpuCount} Cores`, color: '#f59e0b' },
    { icon: <FaMemory />, label: 'Total RAM', value: `${info.totalMemoryGB} GB`, color: '#a855f7' },
    { icon: <FaMemory />, label: 'Free RAM', value: `${info.freeMemoryGB} GB`, sub: `Used: ${(info.totalMemoryGB - info.freeMemoryGB).toFixed(2)} GB`, color: '#06b6d4' },
    { icon: <FaServer />, label: 'Uptime', value: info.uptime, color: '#ec4899' },
    { icon: <MdStorage />, label: 'Architecture', value: info.arch, color: '#f59e0b' },
  ] : [];

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-400 animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 p-8 overflow-auto relative z-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold grad-text">System Info</h1>
          <p className="text-gray-600 text-sm mt-1">Detailed system information</p>
        </div>
        <button onClick={fetchInfo}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass hover:border-purple-500/30 text-gray-400 hover:text-purple-300 transition-all text-sm">
          <MdRefresh size={16} />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className="glass rounded-xl p-5 flex items-center gap-4 card-glow group">
            <div className="p-3 rounded-xl flex-shrink-0 text-xl transition-transform group-hover:scale-110"
              style={{ background: `${c.color}12`, border: `1px solid ${c.color}25`, color: c.color }}>{c.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-xs uppercase tracking-wider">{c.label}</p>
              <p className="text-white font-bold mt-1 truncate">{c.value}</p>
              {c.sub && <p className="text-xs mt-1" style={{ color: c.color }}>{c.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <MdStorage className="text-purple-400" />
          <h2 className="text-white font-semibold">Raw Data</h2>
        </div>
        <div className="bg-black/40 rounded-xl p-4 border border-white/5">
          <pre className="text-purple-300/70 text-xs font-mono overflow-auto leading-relaxed">
            {JSON.stringify(info, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;