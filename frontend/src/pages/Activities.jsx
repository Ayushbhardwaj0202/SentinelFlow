import React, { useEffect, useState } from 'react';
import { activitiesAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import RiskBadge from '../components/RiskBadge';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    activity_type: 'FILE_ACCESS',
    resource: '',
    source_ip: '192.168.1.100',
    device_id: '',
    metadata: ''
  });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await activitiesAPI.getAll();
      setActivities(Array.isArray(res.data) ? res.data : res.data.activities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        metadata: formData.metadata ? JSON.parse(formData.metadata) : {}
      };
      await activitiesAPI.create(payload);
      setShowModal(false);
      fetchActivities();
      // Reset form
      setFormData({
        activity_type: 'FILE_ACCESS',
        resource: '',
        source_ip: '192.168.1.100',
        device_id: '',
        metadata: ''
      });
    } catch (err) {
      alert('Failed to log activity: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="fade-in">
      <PageHeader 
        title="Activity Log" 
        subtitle="Monitor user and system activities" 
        actions={
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Log Activity
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : activities.length === 0 ? (
        <EmptyState message="No activities found" icon="⚡" />
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Resource</th>
                  <th>IP Address</th>
                  <th>Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(act => (
                  <tr key={act.id}>
                    <td>{new Date(act.timestamp || act.createdAt).toLocaleString()}</td>
                    <td>{act.User ? act.User.username : act.user_id}</td>
                    <td><span className="badge badge-neutral">{act.activity_type}</span></td>
                    <td>{act.resource || '-'}</td>
                    <td>{act.source_ip || '-'}</td>
                    <td>
                      {act.risk_score > 0 ? (
                        <RiskBadge level={act.risk_score > 70 ? 'HIGH' : (act.risk_score > 30 ? 'MEDIUM' : 'LOW')} />
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content slide-up">
            <div className="modal-header">
              <h2 className="text-xl font-bold">Log New Activity</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Activity Type</label>
                  <select 
                    className="form-select" 
                    value={formData.activity_type}
                    onChange={(e) => setFormData({...formData, activity_type: e.target.value})}
                  >
                    <option value="LOGIN">LOGIN</option>
                    <option value="LOGOUT">LOGOUT</option>
                    <option value="FILE_ACCESS">FILE_ACCESS</option>
                    <option value="DATA_EXPORT">DATA_EXPORT</option>
                    <option value="SYSTEM_CHANGE">SYSTEM_CHANGE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Resource</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.resource}
                    onChange={(e) => setFormData({...formData, resource: e.target.value})}
                    placeholder="e.g. /etc/passwd or customer_data.csv"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Source IP</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.source_ip}
                    onChange={(e) => setFormData({...formData, source_ip: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Metadata (JSON format)</label>
                  <textarea 
                    className="form-textarea" 
                    value={formData.metadata}
                    onChange={(e) => setFormData({...formData, metadata: e.target.value})}
                    placeholder='{"bytes_transferred": 5000}'
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Log Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
