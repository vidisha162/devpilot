import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdCloud, MdDashboard, MdStorage, MdMonitor, MdLogout } from 'react-icons/md';
import { FaDocker } from 'react-icons/fa';
import { SiKubernetes } from 'react-icons/si';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: <MdDashboard size={20} />, label: 'Dashboard' },
    { path: '/containers', icon: <FaDocker size={20} />, label: 'Containers' },
    { path: '/server', icon: <MdMonitor size={20} />, label: 'Server Health' },
    { path: '/system', icon: <MdStorage size={20} />, label: 'System Info' },
  ];

  return (
    <div className="w-64 min-h-screen bg-[#0d1224] border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30">
            <MdCloud className="text-[#00ff88] text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Dev<span className="text-[#00ff88]">Pilot</span></h1>
            <p className="text-xs text-gray-500">DevOps Platform</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Tech Stack Badge */}
      <div className="p-4 mx-4 mb-4 rounded-xl bg-[#0a0e1a] border border-gray-800">
        <p className="text-xs text-gray-500 mb-2">Tech Stack</p>
        <div className="flex flex-wrap gap-1">
          {['Docker', 'K8s', 'AWS', 'CI/CD'].map((tech) => (
            <span key={tech} className="text-xs px-2 py-1 rounded-md bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium text-sm">{user?.username}</p>
            <p className="text-xs text-[#00ff88]">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <MdLogout size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;