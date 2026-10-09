import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { investigationsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

const InvestigationDetail = () => {
  const { id } = useParams();
  const [investigation, setInvestigation] = useState(null);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newFinding, setNewFinding] = useState({ finding_type: 'NOTE', content: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const invRes = await investigationsAPI.getById(id);
      setInvestigation(invRes.data);
      
      const findRes = await investigationsAPI.getFindings(id);
      setFindings(Array.isArray(findRes.data) ? findRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddFinding = async (e) => {
    e.preventDefault();
    try {
      await investigationsAPI.addFinding(id, newFinding);
      setNewFinding({ finding_type: 'NOTE', content: '' });
      fetchData();
    } catch (err) {
      alert('Failed to add finding');
    }
  };

  const resolveCase = async () => {
    try {
      await investigationsAPI.update(id, { status: 'RESOLVED', resolution_summary: 'Resolved manually.' });
      fetchData();
    } catch (err) {
      alert('Failed to resolve case');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!investigation) return <div className="text-danger p-6">Investigation not found</div>;

  return (
    <div className="fade-in">
      <PageHeader 
        title={`Investigation: ${investigation.title}`} 
        actions={
          investigation.status !== 'RESOLVED' && (
            <button className="btn btn-success" style={{ backgroundColor: 'var(--accent-green)', color: '#fff' }} onClick={resolveCase}>
              Resolve Case
            </button>
          )
        }
      />

      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card p-4">
          <div className="text-secondary text-sm">Status</div>
          <div className="mt-1"><StatusBadge status={investigation.status} /></div>
        </div>
        <div className="card p-4">
          <div className="text-secondary text-sm">Priority</div>
          <div className="mt-1 font-semibold">{investigation.priority}</div>
        </div>
        <div className="card p-4">
          <div className="text-secondary text-sm">Created By</div>
          <div className="mt-1">{investigation.analyst_id || 'Unknown'}</div>
        </div>
        <div className="card p-4">
          <div className="text-secondary text-sm">Created At</div>
          <div className="mt-1">{new Date(investigation.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <h3 className="card-title">Findings & Notes</h3>
          <div className="flex flex-col gap-4 mt-4">
            {findings.length === 0 ? (
              <div className="text-secondary">No findings yet.</div>
            ) : (
              findings.map(finding => (
                <div key={finding.id} className="p-4 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="badge badge-neutral">{finding.finding_type}</span>
                    <span className="text-sm text-secondary">{new Date(finding.createdAt).toLocaleString()}</span>
                  </div>
                  <p>{finding.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="card-title">Add Finding</h3>
          <form onSubmit={handleAddFinding} className="mt-4">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select 
                className="form-select" 
                value={newFinding.finding_type}
                onChange={(e) => setNewFinding({...newFinding, finding_type: e.target.value})}
              >
                <option value="NOTE">Note</option>
                <option value="EVIDENCE">Evidence</option>
                <option value="CONCLUSION">Conclusion</option>
                <option value="ACTION_TAKEN">Action Taken</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea 
                className="form-textarea" 
                value={newFinding.content}
                onChange={(e) => setNewFinding({...newFinding, content: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">Add Finding</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvestigationDetail;
