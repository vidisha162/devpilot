import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdDashboard, MdMonitor, MdStorage, MdLogout } from 'react-icons/md';
import { SiKubernetes } from 'react-icons/si';
import { FaDocker, FaRocket } from 'react-icons/fa';


const Sidebar = () => {
  const { user, logout } = useNavigate ? useAuth() : { user: null, logout: () => {} };
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { path: '/dashboard', icon: <MdDashboard size={18} />, label: 'Dashboard' },
    { path: '/containers', icon: <FaDocker size={18} />, label: 'Containers' },
    { path: '/kubernetes', icon: <SiKubernetes size={18} />, label: 'Kubernetes' },
    { path: '/deploy', icon: <FaRocket size={18} />, label: 'Deploy' },
    { path: '/server', icon: <MdMonitor size={18} />, label: 'Server Health' },
    { path: '/system', icon: <MdStorage size={18} />, label: 'System Info' },
  ];

  return (
    <div className="glass-sidebar w-60 min-h-screen flex flex-col relative z-10">
      {/* Logo */}
      <div className="p-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl glass glow-purple">
            <FaRocket className="text-purple-400 text-lg animate-float" />
          </div>
          <div>
            <h1 className="text-lg font-bold grad-text">DevPilot</h1>
            <p className="text-xs text-gray-600">Cloud Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'nav-active text-purple-300'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Tech badges */}
      <div className="px-3 mb-4">
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-gray-600 mb-3 uppercase tracking-wider">Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {['Docker', 'K8s', 'AWS', 'CI/CD'].map(t => (
              <span key={t} className="text-xs px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-purple-400">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <MdLogout size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;