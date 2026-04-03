import { useState, useEffect } from 'react';
import API from '../utils/api';
import { MdRefresh, MdMemory } from 'react-icons/md';
import { SiKubernetes } from 'react-icons/si';
import { FaServer, FaDocker, FaCube } from 'react-icons/fa';

const StatusBadge = ({ status }) => {
  const colors = {
    Running: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Ready: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Active: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    Unknown: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    NotReady: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${colors[status] || colors.Unknown}`}>
      {status}
    </span>
  );
};

const StatCard = ({ icon, title, value, sub, color }) => (
  <div className="glass rounded-2xl p-5 card-glow">
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-xl" style={{ background: `${color}15`, border: `1px solid ${color}25`, color }}>
        {icon}
      </div>
      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 8px ${color}` }}></div>
    </div>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-gray-500 text-sm">{title}</p>
    {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
  </div>
);

const Kubernetes = () => {
  const [clusterInfo, setClusterInfo] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [pods, setPods] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [services, setServices] = useState([]);
  const [namespaces, setNamespaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [infoRes, nodesRes, podsRes, depRes, svcRes, nsRes] = await Promise.all([
        API.get('/k8s/info'),
        API.get('/k8s/nodes'),
        API.get('/k8s/pods'),
        API.get('/k8s/deployments'),
        API.get('/k8s/services'),
        API.get('/k8s/namespaces'),
      ]);
      setClusterInfo(infoRes.data);
      setNodes(nodesRes.data);
      setPods(podsRes.data);
      setDeployments(depRes.data);
      setServices(svcRes.data);
      setNamespaces(nsRes.data);
    } catch (e) {
      setError(e.message);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const i = setInterval(fetchAll, 15000);
    return () => clearInterval(i);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'nodes', label: `Nodes (${nodes.length})` },
    { id: 'pods', label: `Pods (${pods.length})` },
    { id: 'deployments', label: `Deployments (${deployments.length})` },
    { id: 'services', label: `Services (${services.length})` },
    { id: 'namespaces', label: `Namespaces (${namespaces.length})` },
  ];

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-400 animate-spin mx-auto mb-4"></div>
        <p className="grad-text text-sm animate-pulse">Connecting to cluster...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="glass rounded-2xl p-8 text-center max-w-md">
        <SiKubernetes className="text-red-400 text-5xl mx-auto mb-4" />
        <h2 className="text-white font-bold text-xl mb-2">Cluster Unreachable</h2>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button onClick={fetchAll} className="px-6 py-2.5 rounded-xl btn-grad text-white font-medium">
          Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-8 overflow-auto relative z-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl glass">
            <SiKubernetes className="text-purple-400 text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold grad-text">Kubernetes</h1>
            <p className="text-gray-600 text-sm mt-0.5">kind-tws-clutser · {clusterInfo?.nodes?.total} nodes</p>
          </div>
        </div>
        <button onClick={fetchAll}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass hover:border-purple-500/30 text-gray-400 hover:text-purple-300 transition-all text-sm">
          <MdRefresh size={16} />Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FaServer size={18} />}
          title="Nodes"
          value={clusterInfo?.nodes?.total || 0}
          sub={`${clusterInfo?.nodes?.ready} Ready`}
          color="#a855f7"
        />
        <StatCard
          icon={<FaCube size={18} />}
          title="Pods"
          value={clusterInfo?.pods?.total || 0}
          sub={`${clusterInfo?.pods?.running} Running`}
          color="#06b6d4"
        />
        <StatCard
          icon={<FaDocker size={18} />}
          title="Deployments"
          value={clusterInfo?.deployments?.total || 0}
          sub={`${clusterInfo?.deployments?.ready} Ready`}
          color="#ec4899"
        />
        <StatCard
          icon={<MdMemory size={18} />}
          title="Namespaces"
          value={clusterInfo?.namespaces || 0}
          sub="Active"
          color="#f59e0b"
        />
      </div>

      {/* Pod Status Row */}
      <div className="glass rounded-2xl p-5 mb-6">
        <h2 className="text-white font-semibold mb-4">Pod Status Overview</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Running', val: clusterInfo?.pods?.running, color: '#a855f7' },
            { label: 'Pending', val: clusterInfo?.pods?.pending, color: '#f59e0b' },
            { label: 'Failed', val: clusterInfo?.pods?.failed, color: '#ef4444' },
            { label: 'Unknown', val: clusterInfo?.pods?.unknown, color: '#6b7280' },
          ].map(s => (
            <div key={s.label} className="text-center p-4 rounded-xl bg-white/3 border border-white/5">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.val || 0}</p>
              <p className="text-gray-600 text-xs mt-1">{s.label}</p>
              <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${clusterInfo?.pods?.total ? ((s.val || 0) / clusterInfo.pods.total) * 100 : 0}%`,
                    background: s.color
                  }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === t.id
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'glass text-gray-500 hover:text-gray-300'
            }`}>{t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Nodes preview */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FaServer className="text-purple-400" size={14} />Nodes
            </h3>
            <div className="space-y-2">
              {nodes.map(n => (
                <div key={n.name} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full"
                      style={{ background: n.status === 'Ready' ? '#a855f7' : '#ef4444', boxShadow: n.status === 'Ready' ? '0 0 6px #a855f7' : 'none' }}></div>
                    <span className="text-gray-200 text-sm">{n.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-xs">{n.version}</span>
                    <StatusBadge status={n.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Pods */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FaCube className="text-cyan-400" size={14} />Recent Pods
            </h3>
            <div className="space-y-2">
              {pods.slice(0, 6).map(p => (
                <div key={`${p.namespace}-${p.name}`} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: p.status === 'Running' ? '#a855f7' : p.status === 'Pending' ? '#f59e0b' : '#ef4444' }}></div>
                    <div className="min-w-0">
                      <p className="text-gray-200 text-xs font-medium truncate">{p.name}</p>
                      <p className="text-gray-600 text-xs">{p.namespace}</p>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nodes' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'Status', 'Roles', 'Version', 'OS', 'CPU', 'Memory'].map(h => (
                  <th key={h} className="text-left p-4 text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nodes.map(n => (
                <tr key={n.name} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: n.status === 'Ready' ? '#a855f7' : '#ef4444', boxShadow: n.status === 'Ready' ? '0 0 6px #a855f7' : 'none' }}></div>
                      <span className="text-gray-200 text-sm font-medium">{n.name}</span>
                    </div>
                  </td>
                  <td className="p-4"><StatusBadge status={n.status} /></td>
                  <td className="p-4"><span className="text-gray-400 text-xs">{n.roles.join(', ')}</span></td>
                  <td className="p-4"><span className="text-gray-500 text-xs font-mono">{n.version}</span></td>
                  <td className="p-4"><span className="text-gray-500 text-xs">{n.os}</span></td>
                  <td className="p-4"><span className="text-cyan-400 text-xs">{n.cpu}</span></td>
                  <td className="p-4"><span className="text-purple-400 text-xs">{n.memory}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'pods' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'Namespace', 'Status', 'Ready', 'Restarts', 'Node'].map(h => (
                  <th key={h} className="text-left p-4 text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pods.map(p => (
                <tr key={`${p.namespace}-${p.name}`} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: p.status === 'Running' ? '#a855f7' : p.status === 'Pending' ? '#f59e0b' : '#6b7280' }}></div>
                      <span className="text-gray-200 text-xs font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4"><span className="text-gray-500 text-xs bg-white/5 px-2 py-1 rounded-lg">{p.namespace}</span></td>
                  <td className="p-4"><StatusBadge status={p.status} /></td>
                  <td className="p-4"><span className="text-gray-400 text-xs">{p.ready}</span></td>
                  <td className="p-4">
                    <span className={`text-xs font-bold ${p.restarts > 0 ? 'text-yellow-400' : 'text-gray-600'}`}>{p.restarts}</span>
                  </td>
                  <td className="p-4"><span className="text-gray-600 text-xs">{p.node}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'deployments' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'Namespace', 'Ready', 'Available', 'Image'].map(h => (
                  <th key={h} className="text-left p-4 text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deployments.map(d => (
                <tr key={`${d.namespace}-${d.name}`} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full"
                        style={{ background: d.readyReplicas === d.replicas ? '#a855f7' : '#f59e0b' }}></div>
                      <span className="text-gray-200 text-sm font-medium">{d.name}</span>
                    </div>
                  </td>
                  <td className="p-4"><span className="text-gray-500 text-xs bg-white/5 px-2 py-1 rounded-lg">{d.namespace}</span></td>
                  <td className="p-4">
                    <span className={`text-sm font-bold ${d.readyReplicas === d.replicas ? 'text-purple-400' : 'text-yellow-400'}`}>
                      {d.readyReplicas}/{d.replicas}
                    </span>
                  </td>
                  <td className="p-4"><span className="text-gray-400 text-xs">{d.availableReplicas}</span></td>
                  <td className="p-4"><span className="text-gray-600 text-xs font-mono truncate max-w-xs block">{d.image}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'Namespace', 'Type', 'Cluster IP', 'Ports'].map(h => (
                  <th key={h} className="text-left p-4 text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={`${s.namespace}-${s.name}`} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                  <td className="p-4"><span className="text-gray-200 text-sm font-medium">{s.name}</span></td>
                  <td className="p-4"><span className="text-gray-500 text-xs bg-white/5 px-2 py-1 rounded-lg">{s.namespace}</span></td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      s.type === 'ClusterIP' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      s.type === 'NodePort' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                      'bg-pink-500/10 text-pink-400 border-pink-500/20'
                    }`}>{s.type}</span>
                  </td>
                  <td className="p-4"><span className="text-gray-500 text-xs font-mono">{s.clusterIP}</span></td>
                  <td className="p-4"><span className="text-gray-400 text-xs">{s.ports}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'namespaces' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'Status', 'Age'].map(h => (
                  <th key={h} className="text-left p-4 text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {namespaces.map(n => (
                <tr key={n.name} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 6px #06b6d4' }}></div>
                      <span className="text-gray-200 text-sm font-medium">{n.name}</span>
                    </div>
                  </td>
                  <td className="p-4"><StatusBadge status={n.status} /></td>
                  <td className="p-4"><span className="text-gray-600 text-xs">{new Date(n.age).toLocaleDateString()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Kubernetes;