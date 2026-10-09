import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { alertsAPI, investigationsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBadge from '../components/AlertBadge';
import StatusBadge from '../components/StatusBadge';

const AlertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAlert = async () => {
    try {
      setLoading(true);
      const res = await alertsAPI.getById(id);
      setAlertData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlert();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await alertsAPI.update(id, { status: newStatus });
      fetchAlert();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const createInvestigation = async () => {
    try {
      const res = await investigationsAPI.create({
        title: `Investigation for Alert ${id}`,
        alert_id: id,
        priority: alertData.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM'
      });
      navigate(`/investigations/${res.data.id}`);
    } catch (err) {
      alert('Failed to create investigation');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!alertData) return <div className="text-danger p-6">Alert not found</div>;

  return (
    <div className="fade-in">
      <PageHeader 
        title={`Alert: ${alertData.title}`} 
        actions={
          <>
            <button className="btn btn-outline" onClick={() => updateStatus('ACKNOWLEDGED')}>Acknowledge</button>
            <button className="btn btn-primary" onClick={createInvestigation}>Create Investigation</button>
            <button className="btn btn-danger" onClick={() => updateStatus('FALSE_POSITIVE')}>False Positive</button>
          </>
        }
      />

      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="flex-col gap-6">
          <div className="card mb-6">
            <h3 className="card-title">Description</h3>
            <p className="mt-2 text-secondary">{alertData.description || 'No description available.'}</p>
          </div>

          <div className="card">
            <h3 className="card-title">Raw Data / Context</h3>
            <pre className="mt-2 p-4 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.3)', overflowX: 'auto', fontSize: '0.875rem' }}>
              {JSON.stringify(alertData.context_data || {}, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex-col gap-6">
          <div className="card mb-6">
            <h3 className="card-title">Details</h3>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-secondary">Severity</span>
                <AlertBadge severity={alertData.severity} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Status</span>
                <StatusBadge status={alertData.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Created At</span>
                <span>{new Date(alertData.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetail;
