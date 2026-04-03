import { useState, useEffect } from 'react';
import API from '../utils/api';
import { SiKubernetes } from 'react-icons/si';
import { FaRocket, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { MdRefresh, MdWarning } from 'react-icons/md';

const Deploy = () => {
  const [form, setForm] = useState({
    appName: '',
    image: '',
    replicas: 1,
    port: 80,
    namespace: 'default'
  });
  const [deployments, setDeployments] = useState([]);
  const [namespaces, setNamespaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [scaling, setScaling] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [depRes, nsRes] = await Promise.all([
        API.get('/k8s/deployments'),
        API.get('/k8s/namespaces')
      ]);
      setDeployments(depRes.data);
      setNamespaces(nsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 15000);
    return () => clearInterval(i);
  }, []);

  const handleDeploy = async (e) => {
    e.preventDefault();
    setDeploying(true);
    setResult(null);
    setError(null);
    try {
      const { data } = await API.post('/k8s/deploy', form);
      setResult(data);
      setForm({ appName: '', image: '', replicas: 1, port: 80, namespace: 'default' });
      setTimeout(fetchData, 2000);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setDeploying(false);
    }
  };

  const handleDelete = async (appName, namespace) => {
    try {
      await API.delete(`/k8s/delete/${namespace}/${appName}`);
      setDeleteConfirm(null);
      setTimeout(fetchData, 1000);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const handleScale = async (appName, namespace, replicas) => {
    setScaling(p => ({ ...p, [`${namespace}-${appName}`]: true }));
    try {
      await API.patch(`/k8s/scale/${namespace}/${appName}`, { replicas });
      setTimeout(fetchData, 1000);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setScaling(p => ({ ...p, [`${namespace}-${appName}`]: false }));
    }
  };

  const quickDeploy = [
    { name: 'nginx-app', image: 'nginx:latest', port: 80 },
    { name: 'redis-cache', image: 'redis:alpine', port: 6379 },
    { name: 'mongo-db', image: 'mongo:latest', port: 27017 },
  ];

  return (
    <div className="flex-1 p-8 overflow-auto relative z-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl glass">
            <FaRocket className="text-purple-400 text-xl animate-float" />
          </div>
          <div>
            <h1 className="text-3xl font-bold grad-text">Deploy</h1>
            <p className="text-gray-600 text-sm mt-0.5">One-click Kubernetes deployments</p>
          </div>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass hover:border-purple-500/30 text-gray-400 hover:text-purple-300 transition-all text-sm">
          <MdRefresh size={16} />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Deploy Form */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
            <SiKubernetes className="text-purple-400" />
            Deploy New App
          </h2>
          <p className="text-gray-600 text-xs mb-5">No YAML needed — just fill and deploy!</p>

          {result && (
            <div className="mb-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 animate-fade-in">
              <p className="text-purple-300 text-sm font-medium">{result.message}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <span>Deployment: <span className="text-purple-400">{result.deployment}</span></span>
                <span>Service: <span className="text-cyan-400">{result.service}</span></span>
                <span>Replicas: <span className="text-white">{result.replicas}</span></span>
                <span>Namespace: <span className="text-white">{result.namespace}</span></span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in flex items-start gap-2">
              <MdWarning className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleDeploy} className="space-y-4">
            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">App Name</label>
              <input
                type="text"
                value={form.appName}
                onChange={e => setForm(p => ({ ...p, appName: e.target.value.toLowerCase().replace(/\s/g, '-') }))}
                placeholder="my-awesome-app"
                className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/40 transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Docker Image</label>
              <input
                type="text"
                value={form.image}
                onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                placeholder="nginx:latest or username/image:tag"
                className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/40 transition-all text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Replicas</label>
                <div className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => setForm(p => ({ ...p, replicas: Math.max(1, p.replicas - 1) }))}
                    className="p-2 rounded-lg glass text-gray-400 hover:text-purple-300 transition-all">
                    <FaMinus size={10} />
                  </button>
                  <span className="text-white font-bold text-lg w-8 text-center">{form.replicas}</span>
                  <button type="button"
                    onClick={() => setForm(p => ({ ...p, replicas: Math.min(10, p.replicas + 1) }))}
                    className="p-2 rounded-lg glass text-gray-400 hover:text-purple-300 transition-all">
                    <FaPlus size={10} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Port</label>
                <input
                  type="number"
                  value={form.port}
                  onChange={e => setForm(p => ({ ...p, port: e.target.value }))}
                  className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/40 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Namespace</label>
              <select
                value={form.namespace}
                onChange={e => setForm(p => ({ ...p, namespace: e.target.value }))}
                className="w-full bg-[#0d0018] border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/40 transition-all text-sm">
                {namespaces.map(n => (
                  <option key={n.name} value={n.name}>{n.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={deploying}
              className="w-full py-3.5 rounded-xl btn-grad text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2">
              {deploying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Deploying to Kubernetes...
                </>
              ) : (
                <>
                  <FaRocket size={16} />
                  Deploy to Kubernetes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Deploy */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1">Quick Deploy</h2>
          <p className="text-gray-600 text-xs mb-5">Common apps — one click to deploy</p>

          <div className="space-y-3 mb-6">
            {quickDeploy.map(app => (
              <div key={app.name} className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5 hover:border-purple-500/20 transition-all">
                <div>
                  <p className="text-gray-200 text-sm font-medium">{app.name}</p>
                  <p className="text-gray-600 text-xs font-mono mt-0.5">{app.image}</p>
                  <p className="text-gray-700 text-xs mt-0.5">Port: {app.port}</p>
                </div>
                <button
                  onClick={() => setForm({ appName: app.name, image: app.image, replicas: 1, port: app.port, namespace: 'default' })}
                  className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-xs font-medium">
                  Use This
                </button>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/3 border border-white/5 text-center">
              <p className="text-2xl font-bold text-purple-400">{deployments.length}</p>
              <p className="text-gray-600 text-xs mt-1">Total Deployments</p>
            </div>
            <div className="p-4 rounded-xl bg-white/3 border border-white/5 text-center">
              <p className="text-2xl font-bold text-cyan-400">
                {deployments.filter(d => d.readyReplicas === d.replicas).length}
              </p>
              <p className="text-gray-600 text-xs mt-1">Healthy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deployments Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <SiKubernetes className="text-purple-400" />
          <span className="text-white font-medium">Active Deployments</span>
          <span className="ml-auto text-xs text-gray-600">{deployments.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-400 rounded-full animate-spin"></div>
          </div>
        ) : deployments.length === 0 ? (
          <div className="text-center py-12">
            <SiKubernetes className="text-gray-800 text-5xl mx-auto mb-3" />
            <p className="text-gray-600">No deployments found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'Namespace', 'Image', 'Replicas', 'Status', 'Scale', 'Actions'].map(h => (
                  <th key={h} className="text-left p-4 text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deployments.map(d => (
                <tr key={`${d.namespace}-${d.name}`} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background: d.readyReplicas === d.replicas ? '#a855f7' : '#f59e0b',
                          boxShadow: d.readyReplicas === d.replicas ? '0 0 6px #a855f7' : 'none'
                        }}></div>
                      <span className="text-gray-200 text-sm font-medium">{d.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-500 text-xs bg-white/5 px-2 py-1 rounded-lg">{d.namespace}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-600 text-xs font-mono truncate max-w-[120px] block">{d.image}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-bold ${d.readyReplicas === d.replicas ? 'text-purple-400' : 'text-yellow-400'}`}>
                      {d.readyReplicas}/{d.replicas}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${
                      d.readyReplicas === d.replicas
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {d.readyReplicas === d.replicas ? 'Healthy' : 'Updating'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleScale(d.name, d.namespace, Math.max(1, d.replicas - 1))}
                        disabled={scaling[`${d.namespace}-${d.name}`] || d.replicas <= 1}
                        className="p-1.5 rounded-lg glass text-gray-500 hover:text-purple-300 transition-all disabled:opacity-30">
                        <FaMinus size={9} />
                      </button>
                      <span className="text-white text-xs w-6 text-center font-bold">{d.replicas}</span>
                      <button
                        onClick={() => handleScale(d.name, d.namespace, d.replicas + 1)}
                        disabled={scaling[`${d.namespace}-${d.name}`]}
                        className="p-1.5 rounded-lg glass text-gray-500 hover:text-purple-300 transition-all disabled:opacity-30">
                        <FaPlus size={9} />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    {deleteConfirm === `${d.namespace}-${d.name}` ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(d.name, d.namespace)}
                          className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs hover:bg-red-500/30 transition-all">
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 rounded-lg glass text-gray-500 text-xs transition-all">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(`${d.namespace}-${d.name}`)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                        <FaTrash size={11} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 max-w-sm w-full mx-4"
            style={{ boxShadow: '0 20px 60px rgba(239,68,68,0.2)' }}>
            <h3 className="text-white font-bold text-lg mb-2">Delete Deployment?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will delete the deployment and its service permanently.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const [ns, ...nameParts] = deleteConfirm.split('-');
                  handleDelete(nameParts.join('-'), ns);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-medium hover:bg-red-500/30 transition-all">
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl glass text-gray-400 font-medium transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deploy;