import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AlertBadge from '../components/AlertBadge';
import StatusBadge from '../components/StatusBadge';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const res = await alertsAPI.getAll();
        setAlerts(Array.isArray(res.data) ? res.data : res.data.alerts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="fade-in">
      <PageHeader title="Alerts Management" subtitle="Review and triage security alerts" />
      
      {loading ? (
        <LoadingSpinner />
      ) : alerts.length === 0 ? (
        <EmptyState message="No alerts generated" icon="🔔" />
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(alert => (
                  <tr key={alert.id} className="row-clickable" onClick={() => navigate(`/alerts/${alert.id}`)}>
                    <td>{alert.id.toString().substring(0,8)}...</td>
                    <td className="font-medium">{alert.title}</td>
                    <td><AlertBadge severity={alert.severity} /></td>
                    <td><StatusBadge status={alert.status} /></td>
                    <td>{new Date(alert.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
