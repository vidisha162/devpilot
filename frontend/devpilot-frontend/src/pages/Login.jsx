import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaDocker, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdCloud } from 'react-icons/md';

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
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00ff88] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#00d4ff] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30">
              <MdCloud className="text-[#00ff88] text-4xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Dev<span className="text-[#00ff88]">Pilot</span></h1>
              <p className="text-gray-400 text-sm">DevOps Automation Platform</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="card-glow rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Welcome back 👋</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-[#0a0e1a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_10px_rgba(0,255,136,0.2)] transition-all"
                required
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-[#0a0e1a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_10px_rgba(0,255,136,0.2)] transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00ff88] transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#00ff88] text-[#0a0e1a] font-bold text-lg hover:bg-[#00ff88]/90 transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FaDocker className="text-[#00d4ff]" />
              <span>Kubernetes · Docker · AWS · CI/CD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;