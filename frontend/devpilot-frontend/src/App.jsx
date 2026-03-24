import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Containers from './pages/Containers';
import ServerHealth from './pages/ServerHealth';
import SystemInfo from './pages/SystemInfo';
import Sidebar from './components/Sidebar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin"></div>
    </div>
  );
  return user ? children : <Navigate to="/" />;
};

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-[#0a0e1a]">
    <Sidebar />
    {children}
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout><Dashboard /></Layout>
            </PrivateRoute>
          } />
          <Route path="/containers" element={
            <PrivateRoute>
              <Layout><Containers /></Layout>
            </PrivateRoute>
          } />
          <Route path="/server" element={
            <PrivateRoute>
              <Layout><ServerHealth /></Layout>
            </PrivateRoute>
          } />
          <Route path="/system" element={
            <PrivateRoute>
              <Layout><SystemInfo /></Layout>
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;