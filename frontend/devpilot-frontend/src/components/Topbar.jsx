import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MdNotifications, MdNotificationsActive } from 'react-icons/md';
import { FiClock } from 'react-icons/fi';

const Topbar = ({ alerts = [] }) => {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const unread = alerts.filter(a => !a.read).length;

  return (
    <div className="h-16 flex items-center justify-between px-8 border-b border-white/5 relative z-10"
      style={{ background: 'rgba(3,0,8,0.8)', backdropFilter: 'blur(20px)' }}>

      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="status-dot" style={{ background: '#a855f7', boxShadow: '0 0 10px #a855f7' }}></div>
        <span className="text-purple-400 text-sm">All Systems Operational</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <FiClock size={13} className="text-purple-500" />
          <span className="font-mono text-gray-400">{time.toLocaleTimeString()}</span>
        </div>

        {/* Bell */}
        <div className="relative">
          <button onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-2 rounded-xl glass hover:border-purple-500/30 transition-all">
            {unread > 0
              ? <MdNotificationsActive className="text-purple-400" size={20} />
              : <MdNotifications className="text-gray-500" size={20} />
            }
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full text-xs flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 top-12 w-72 glass rounded-2xl shadow-2xl z-50 animate-fade-in overflow-hidden"
              style={{ boxShadow: '0 20px 60px rgba(168,85,247,0.2)' }}>
              <div className="p-4 border-b border-white/5">
                <p className="text-white font-semibold text-sm">Notifications</p>
              </div>
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-gray-600 text-sm">
                  ✨ All systems normal
                </div>
              ) : alerts.map((a, i) => (
                <div key={i} className="p-4 border-b border-white/5 hover:bg-white/3 transition-colors">
                  <p className="text-white text-sm font-medium">{a.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{a.message}</p>
                  <p className="text-gray-700 text-xs mt-1">{a.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User pill */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span className="text-gray-300 text-sm">{user?.username}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400">{user?.role}</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;