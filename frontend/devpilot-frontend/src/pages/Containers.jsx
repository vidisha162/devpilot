import { useState, useEffect } from 'react';
import API from '../utils/api';
import { FaDocker, FaPlay, FaStop } from 'react-icons/fa';
import { MdRefresh, MdTerminal, MdSearch } from 'react-icons/md';

const Containers = () => {
  const [containers, setContainers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [logs, setLogs] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchContainers = async () => {
    try {
      const { data } = await API.get('/docker/containers');
      setContainers(data);
      setFiltered(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContainers(); }, []);

  useEffect(() => {
    let r = containers;
    if (filter === 'running') r = r.filter(c => c.state === 'running');
    if (filter === 'stopped') r = r.filter(c => c.state !== 'running');
    if (search) r = r.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.image.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(r);
  }, [search, filter, containers]);

  const handleStart = async (id) => {
    setActionLoading(p => ({ ...p, [id]: 'starting' }));
    try { await API.post(`/docker/containers/${id}/start`); await fetchContainers(); }
    catch (e) { console.error(e); }
    finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const handleStop = async (id) => {
    setActionLoading(p => ({ ...p, [id]: 'stopping' }));
    try { await API.post(`/docker/containers/${id}/stop`); await fetchContainers(); }
    catch (e) { console.error(e); }
    finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const handleLogs = async (id, name) => {
    setSelectedContainer(name);
    setLogs('Fetching logs...');
    try {
      const { data } = await API.get(`/docker/containers/${id}/logs`);
      setLogs(data.logs || 'No logs available');
    } catch { setLogs('Error fetching logs'); }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-400 animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 p-8 overflow-auto relative z-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold grad-text">Containers</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your Docker containers</p>
        </div>
        <button onClick={fetchContainers}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass hover:border-purple-500/30 text-gray-400 hover:text-purple-300 transition-all text-sm">
          <MdRefresh size={16} />Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', val: containers.length, color: '#a855f7' },
          { label: 'Running', val: containers.filter(c => c.state === 'running').length, color: '#06b6d4' },
          { label: 'Stopped', val: containers.filter(c => c.state !== 'running').length, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-4 text-center card-glow">
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.val}</p>
            <p className="text-gray-600 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or image..."
            className="w-full bg-white/3 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/40 transition-all" />
        </div>
        <div className="flex gap-2">
          {['all', 'running', 'stopped'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${
                filter === f ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'glass text-gray-500 hover:text-gray-300'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <FaDocker className="text-purple-400" />
          <span className="text-white font-medium">All Containers</span>
          <span className="ml-auto text-xs text-gray-600">{filtered.length} results</span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FaDocker className="text-gray-800 text-5xl mx-auto mb-4" />
            <p className="text-gray-600">No containers found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'Image', 'Status', 'State', 'Actions'].map(h => (
                  <th key={h} className="text-left p-4 text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: c.state === 'running' ? '#a855f7' : '#ef4444', boxShadow: c.state === 'running' ? '0 0 8px #a855f7' : 'none' }}></div>
                      <span className="text-gray-200 text-sm font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-600 text-xs font-mono bg-white/3 px-2 py-1 rounded-lg">{c.image}</span>
                  </td>
                  <td className="p-4"><span className="text-gray-600 text-xs">{c.status}</span></td>
                  <td className="p-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      c.state === 'running'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>{c.state}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {c.state !== 'running' ? (
                        <button onClick={() => handleStart(c.id)} disabled={actionLoading[c.id]}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-xs disabled:opacity-50">
                          <FaPlay size={9} />{actionLoading[c.id] === 'starting' ? 'Starting...' : 'Start'}
                        </button>
                      ) : (
                        <button onClick={() => handleStop(c.id)} disabled={actionLoading[c.id]}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-xs disabled:opacity-50">
                          <FaStop size={9} />{actionLoading[c.id] === 'stopping' ? 'Stopping...' : 'Stop'}
                        </button>
                      )}
                      <button onClick={() => handleLogs(c.id, c.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all text-xs">
                        <MdTerminal size={12} />Logs
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Logs Modal */}
      {logs && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="glass rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
            style={{ boxShadow: '0 20px 80px rgba(168,85,247,0.2)' }}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <MdTerminal className="text-purple-400" />
                <span className="grad-text">{selectedContainer}</span>
              </h3>
              <button onClick={() => setLogs(null)}
                className="p-2 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition-all">✕</button>
            </div>
            <div className="flex-1 overflow-auto m-4 rounded-xl bg-black/50 border border-white/5">
              <pre className="text-purple-300 text-xs font-mono leading-relaxed p-4">{logs}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Containers;