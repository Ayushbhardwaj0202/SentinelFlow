import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("sentinelflow_token");
    localStorage.removeItem("sentinelflow_user");
    navigate("/login");
  };

  const navItems = [
    {
      path: "/dashboard",
      icon: "▦",
      label: "Dashboard",
    },
    {
      path: "/activities",
      icon: "◉",
      label: "Activities",
    },
    {
      path: "/threats",
      icon: "⚠",
      label: "Threat Detection",
    },
    {
      path: "/investigations",
      icon: "⌕",
      label: "Investigations",
    },
    {
      path: "/reports",
      icon: "▤",
      label: "Reports",
    },
    {
      path: "/audit-logs",
      icon: "◫",
      label: "Audit Logs",
    },
  ];

  return (
    <div className="sentinelflow-shell">
      <aside className="sentinelflow-sidebar">

        <div className="sidebar-brand">
          <div className="brand-logo">
            S
          </div>

          <div>
            <div className="brand-name">
              SentinelFlow
            </div>

            <div className="brand-subtitle">
              Security Operations
            </div>
          </div>
        </div>

        <div className="sidebar-section-title">
          SECURITY OPERATIONS
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? "sidebar-link-active"
                    : ""
                }`
              }
            >
              <span className="sidebar-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">

          <div className="system-status">
            <span className="status-dot"></span>

            <div>
              <div className="status-title">
                System Operational
              </div>

              <div className="status-text">
                All services running
              </div>
            </div>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">
              SA
            </div>

            <div className="user-details">
              <div className="user-name">
                Security Analyst
              </div>

              <div className="user-role">
                SOC Analyst
              </div>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>
      </aside>

      <main className="sentinelflow-main">
        <Outlet />
      </main>
    </div>
  );
}