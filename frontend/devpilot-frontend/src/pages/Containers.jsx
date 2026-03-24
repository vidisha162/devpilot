import { useState, useEffect } from 'react';
import API from '../utils/api';
import { FaDocker, FaPlay, FaStop } from 'react-icons/fa';
import { MdRefresh, MdTerminal } from 'react-icons/md';

const Containers = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [logs, setLogs] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState(null);

  const fetchContainers = async () => {
    try {
      const { data } = await API.get('/docker/containers');
      setContainers(data);
    } catch (error) {
      console.error('Error fetching containers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const handleStart = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'starting' }));
    try {
      await API.post(`/docker/containers/${id}/start`);
      await fetchContainers();
    } catch (error) {
      console.error('Error starting container:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleStop = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'stopping' }));
    try {
      await API.post(`/docker/containers/${id}/stop`);
      await fetchContainers();
    } catch (error) {
      console.error('Error stopping container:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleLogs = async (id, name) => {
    setSelectedContainer(name);
    try {
      const { data } = await API.get(`/docker/containers/${id}/logs`);
      setLogs(data.logs);
    } catch (error) {
      setLogs('Error fetching logs');
    }
  };

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
          <h1 className="text-2xl font-bold text-white">Container Management</h1>
          <p className="text-gray-400 text-sm mt-1">{containers.length} containers found</p>
        </div>
        <button
          onClick={fetchContainers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-sm"
        >
          <MdRefresh size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card-glow rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#00ff88]">{containers.length}</p>
          <p className="text-gray-400 text-sm">Total</p>
        </div>
        <div className="card-glow rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#00d4ff]">
            {containers.filter(c => c.state === 'running').length}
          </p>
          <p className="text-gray-400 text-sm">Running</p>
        </div>
        <div className="card-glow rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {containers.filter(c => c.state !== 'running').length}
          </p>
          <p className="text-gray-400 text-sm">Stopped</p>
        </div>
      </div>

      {/* Containers Table */}
      <div className="card-glow rounded-2xl overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaDocker className="text-[#00d4ff]" />
            All Containers
          </h2>
        </div>
        {containers.length === 0 ? (
          <div className="text-center py-16">
            <FaDocker className="text-gray-700 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No containers found</p>
            <p className="text-gray-600 text-sm mt-2">Start some Docker containers to see them here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">Name</th>
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">Image</th>
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">State</th>
                  <th className="text-left p-4 text-gray-400 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((container) => (
                  <tr key={container.id} className="border-b border-gray-800/50 hover:bg-white/2 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FaDocker className="text-[#00d4ff] text-sm" />
                        <span className="text-white font-medium text-sm">{container.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400 text-sm font-mono">{container.image}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-500 text-xs">{container.status}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        container.state === 'running'
                          ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {container.state}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {container.state !== 'running' ? (
                          <button
                            onClick={() => handleStart(container.id)}
                            disabled={actionLoading[container.id]}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 hover:bg-[#00ff88]/20 transition-all text-xs disabled:opacity-50"
                          >
                            <FaPlay size={10} />
                            {actionLoading[container.id] === 'starting' ? 'Starting...' : 'Start'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStop(container.id)}
                            disabled={actionLoading[container.id]}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all text-xs disabled:opacity-50"
                          >
                            <FaStop size={10} />
                            {actionLoading[container.id] === 'stopping' ? 'Stopping...' : 'Stop'}
                          </button>
                        )}
                        <button
                          onClick={() => handleLogs(container.id, container.name)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/30 hover:bg-[#7c3aed]/20 transition-all text-xs"
                        >
                          <MdTerminal size={12} />
                          Logs
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Logs Modal */}
      {logs && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-[#0d1224] border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <MdTerminal className="text-[#00ff88]" />
                Logs: {selectedContainer}
              </h3>
              <button
                onClick={() => setLogs(null)}
                className="text-gray-400 hover:text-white transition-colors text-xl"
              >
                ✕
              </button>
            </div>
            <pre className="p-6 text-green-400 text-xs font-mono overflow-auto flex-1 leading-relaxed">
              {logs || 'No logs available'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Containers;