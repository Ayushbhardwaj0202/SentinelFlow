import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { threatsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import AlertBadge from '../components/AlertBadge';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';

const Threats = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        setLoading(true);
        const res = await threatsAPI.getAll();
        setThreats(Array.isArray(res.data) ? res.data : res.data.threats || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchThreats();
  }, []);

  return (
    <div className="fade-in">
      <PageHeader title="Threats" subtitle="Detected threats and anomalies" />
      
      {loading ? (
        <LoadingSpinner />
      ) : threats.length === 0 ? (
        <EmptyState message="No threats detected" icon="⚠️" />
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Risk Score</th>
                  <th>Detected On</th>
                </tr>
              </thead>
              <tbody>
                {threats.map(threat => (
                  <tr key={threat.id} className="row-clickable" onClick={() => navigate(`/alerts/${threat.alert_id || threat.id}`)}>
                    <td className="font-medium">{threat.title || threat.threat_type || 'Unknown Threat'}</td>
                    <td><AlertBadge severity={threat.severity} /></td>
                    <td><StatusBadge status={threat.status} /></td>
                    <td>
                      {threat.risk_score ? (
                        <RiskBadge level={threat.risk_score > 70 ? 'HIGH' : (threat.risk_score > 30 ? 'MEDIUM' : 'LOW')} />
                      ) : '-'}
                    </td>
                    <td>{new Date(threat.createdAt).toLocaleString()}</td>
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

export default Threats;
