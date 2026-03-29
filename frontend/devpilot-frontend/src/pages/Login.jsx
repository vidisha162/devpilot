import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash, FaRocket, FaDocker } from 'react-icons/fa';
import { SiKubernetes } from 'react-icons/si';
import { MdSecurity, MdMonitor } from 'react-icons/md';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030008] flex relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="absolute inset-0 bg-grid opacity-40"></div>

      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-16 relative z-10">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 rounded-2xl glass glow-purple animate-float">
              <FaRocket className="text-purple-400 text-3xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold grad-text">DevPilot</h1>
              <p className="text-gray-600 text-sm mt-1">Cloud & DevOps Platform</p>
            </div>
          </div>

          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            Monitor infrastructure, manage containers, and automate deployments from one beautiful dashboard.
          </p>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { icon: <FaDocker className="text-cyan-400" />, text: 'Docker Container Management', sub: 'Start, stop, view logs' },
              { icon: <SiKubernetes className="text-purple-400" />, text: 'Kubernetes Orchestration', sub: 'Pod & service management' },
              { icon: <MdMonitor className="text-pink-400" />, text: 'Real-time Monitoring', sub: 'CPU, memory, uptime' },
              { icon: <MdSecurity className="text-cyan-300" />, text: 'Secure Authentication', sub: 'JWT role-based access' },
            ].map((f, i) => (
              <div key={i} className="glass rounded-xl p-4 flex items-center gap-4"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-xl">{f.icon}</div>
                <div>
                  <p className="text-gray-200 text-sm font-medium">{f.text}</p>
                  <p className="text-gray-600 text-xs">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold grad-text">DevPilot</h1>
          </div>

          <div className="glass rounded-3xl p-8" style={{ boxShadow: '0 20px 80px rgba(168,85,247,0.15)' }}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 focus:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 focus:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all pr-12"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-purple-400 transition-colors">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl btn-grad text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </span>
                ) : 'Sign In →'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-6 text-gray-700 text-xs">
              <span className="flex items-center gap-1.5"><FaDocker /><span>Docker</span></span>
              <span className="flex items-center gap-1.5"><SiKubernetes /><span>Kubernetes</span></span>
              <span className="flex items-center gap-1.5"><FaRocket /><span>CI/CD</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;