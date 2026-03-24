import { useState, useEffect } from 'react';
import API from '../utils/api';
import { MdStorage, MdRefresh } from 'react-icons/md';
import { FaServer, FaMemory, FaMicrochip, FaCode } from 'react-icons/fa';

const InfoCard = ({ icon, label, value, color }) => (
  <div className="card-glow rounded-xl p-5 flex items-center gap-4">
    <div className="p-3 rounded-xl" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
      <div style={{ color }}>{icon}</div>
    </div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-white font-bold mt-1">{value}</p>
    </div>
  </div>
);

const SystemInfo = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInfo = async () => {
    try {
      const { data } = await API.get('/server/info');
      setInfo(data);
    } catch (error) {
      console.error('Error fetching system info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

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
          <h1 className="text-2xl font-bold text-white">System Info</h1>
          <p className="text-gray-400 text-sm mt-1">Detailed system information</p>
        </div>
        <button
          onClick={fetchInfo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all text-sm"
        >
          <MdRefresh size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <InfoCard
          icon={<FaServer size={20} />}
          label="Hostname"
          value={info?.hostname || 'N/A'}
          color="#00ff88"
        />
        <InfoCard
          icon={<FaMicrochip size={20} />}
          label="Platform"
          value={`${info?.platform} (${info?.arch})`}
          color="#00d4ff"
        />
        <InfoCard
          icon={<FaCode size={20} />}
          label="Node.js Version"
          value={info?.nodeVersion || 'N/A'}
          color="#7c3aed"
        />
        <InfoCard
          icon={<FaMicrochip size={20} />}
          label="CPU Cores"
          value={`${info?.cpuCount} Cores`}
          color="#f59e0b"
        />
        <InfoCard
          icon={<FaMemory size={20} />}
          label="Total Memory"
          value={`${info?.totalMemoryGB} GB`}
          color="#00ff88"
        />
        <InfoCard
          icon={<FaMemory size={20} />}
          label="Free Memory"
          value={`${info?.freeMemoryGB} GB`}
          color="#00d4ff"
        />
        <InfoCard
          icon={<FaServer size={20} />}
          label="Uptime"
          value={info?.uptime || 'N/A'}
          color="#f59e0b"
        />
        <InfoCard
          icon={<MdStorage size={20} />}
          label="Architecture"
          value={info?.arch || 'N/A'}
          color="#7c3aed"
        />
      </div>

      {/* Raw Info Card */}
      <div className="card-glow rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Raw System Data</h2>
        <pre className="text-[#00ff88] text-sm font-mono bg-[#0a0e1a] p-4 rounded-xl overflow-auto">
          {JSON.stringify(info, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SystemInfo;