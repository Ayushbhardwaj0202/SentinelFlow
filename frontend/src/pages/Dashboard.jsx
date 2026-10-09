import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, alertsAPI, activitiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBadge from '../components/AlertBadge';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // We'll attempt to load summary, alerts, and activities
        const [sumRes, alertRes, actRes] = await Promise.all([
          dashboardAPI.getSummary().catch(() => ({ data: null })),
          alertsAPI.getAll({ limit: 5 }).catch(() => ({ data: [] })),
          activitiesAPI.getAll({ limit: 5 }).catch(() => ({ data: [] }))
        ]);
        
        setSummary(sumRes.data);
        setAlerts(Array.isArray(alertRes.data) ? alertRes.data : alertRes.data.alerts || []);
        setActivities(Array.isArray(actRes.data) ? actRes.data : actRes.data.activities || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  // Defaults if summary fails
  const stats = summary || {
    totalUsers: 0, activeDevices: 0, activitiesToday: 0, openAlerts: 0, highRiskUsers: 0, criticalThreats: 0
  };

  return (
    <div className="fade-in">
      <PageHeader title="Security Dashboard" subtitle="Overview of your security posture" />
      
      {error && <div className="text-danger mb-4">{error}</div>}

      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {(user.role === 'admin' || user.role === 'analyst') && (
          <>
            <StatCard title="Total Users" value={stats.totalUsers || 0} icon="👥" color="var(--accent-blue)" />
            <StatCard title="Active Devices" value={stats.activeDevices || 0} icon="💻" color="var(--accent-green)" />
            <StatCard title="High Risk Users" value={stats.highRiskUsers || 0} icon="⚠️" color="var(--warning-yellow)" />
            <StatCard title="Critical Threats" value={stats.criticalThreats || 0} icon="🚨" color="var(--danger-red)" />
          </>
        )}
        <StatCard title="Activities Today" value={stats.activitiesToday || 0} icon="⚡" color="var(--text-primary)" />
        <StatCard title="Open Alerts" value={stats.openAlerts || 0} icon="🔔" color="var(--danger-red)" />
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {/* Recent Alerts */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Alerts</h2>
            <button className="btn btn-ghost text-sm" onClick={() => navigate('/alerts')}>View All</button>
          </div>
          {alerts.length === 0 ? (
            <div className="text-center p-4 text-secondary">No recent alerts</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Severity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(alert => (
                    <tr key={alert.id} className="row-clickable" onClick={() => navigate(`/alerts/${alert.id}`)}>
                      <td>{alert.title}</td>
                      <td><AlertBadge severity={alert.severity} /></td>
                      <td><StatusBadge status={alert.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activities</h2>
            <button className="btn btn-ghost text-sm" onClick={() => navigate('/activities')}>View All</button>
          </div>
          {activities.length === 0 ? (
            <div className="text-center p-4 text-secondary">No recent activities</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>User</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map(act => (
                    <tr key={act.id}>
                      <td><span className="badge badge-neutral">{act.activity_type}</span></td>
                      <td>{act.User ? act.User.username : act.user_id}</td>
                      <td>{act.risk_score > 0 ? <RiskBadge level={act.risk_score > 70 ? 'HIGH' : (act.risk_score > 30 ? 'MEDIUM' : 'LOW')} /> : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
