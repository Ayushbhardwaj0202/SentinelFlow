import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const allNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞', roles: ['employee','analyst','admin'] },
  { path: '/activities', label: 'Activities', icon: '⚡', roles: ['employee','analyst','admin'] },
  { path: '/devices', label: 'Devices', icon: '💻', roles: ['employee','analyst','admin'] },
  { path: '/sessions', label: 'Sessions', icon: '🔗', roles: ['analyst','admin'] },
  { path: '/threats', label: 'Threats', icon: '⚠️', roles: ['analyst','admin'] },
  { path: '/alerts', label: 'Alerts', icon: '🔔', roles: ['employee','analyst','admin'] },
  { path: '/investigations', label: 'Investigations', icon: '🔍', roles: ['analyst','admin'] },
  { path: '/reports', label: 'Reports', icon: '📊', roles: ['analyst','admin'] },
  { path: '/audit-logs', label: 'Audit Logs', icon: '📋', roles: ['admin','analyst'] },
  { path: '/users', label: 'Users', icon: '👥', roles: ['admin'] },
  { path: '/policies', label: 'Policies', icon: '📜', roles: ['admin'] },
  { path: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = allNavItems.filter(item => item.roles.includes(user?.role));

  const currentNavItem = allNavItems.find(item => location.pathname.startsWith(item.path));
  const pageTitle = currentNavItem ? currentNavItem.label : 'SentinelFlow';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span style={{ color: 'var(--accent-blue)', marginRight: '8px' }}>⚡</span>
          SentinelFlow
        </div>
        <nav className="sidebar-content">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-item ${isActive || location.pathname.startsWith(item.path) && item.path !== '/' ? 'active' : ''}`}
            >
              <span style={{ width: '20px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="font-semibold">{pageTitle}</div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-secondary">
              Welcome, <span className="text-primary font-medium">{user?.full_name || user?.username}</span>
            </div>
            <span className="badge badge-blue">{user?.role}</span>
            <button onClick={handleLogout} className="btn btn-ghost text-sm">
              Logout
            </button>
          </div>
        </header>
        
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
