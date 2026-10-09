import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { investigationsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

const Investigations = () => {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvestigations = async () => {
      try {
        setLoading(true);
        const res = await investigationsAPI.getAll();
        setInvestigations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvestigations();
  }, []);

  return (
    <div className="fade-in">
      <PageHeader title="Investigations" subtitle="Manage security investigation cases" />
      
      {loading ? (
        <LoadingSpinner />
      ) : investigations.length === 0 ? (
        <EmptyState message="No investigations found" icon="🔍" />
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case #</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {investigations.map(inv => (
                  <tr key={inv.id} className="row-clickable" onClick={() => navigate(`/investigations/${inv.id}`)}>
                    <td>{inv.case_number || inv.id.substring(0,8)}</td>
                    <td className="font-medium">{inv.title}</td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td><span className={`badge ${inv.priority === 'HIGH' ? 'badge-high' : 'badge-neutral'}`}>{inv.priority}</span></td>
                    <td>{new Date(inv.createdAt).toLocaleString()}</td>
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

export default Investigations;
