import React, { useState, useEffect } from 'react';
import { policiesAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const POLICY_TYPES = ['ACCESS', 'DATA', 'NETWORK', 'DEVICE', 'PASSWORD', 'GENERAL'];

function PolicyTypeBadge({ type }) {
  const colors = {
    ACCESS: '#3b82f6', DATA: '#f59e0b', NETWORK: '#10b981',
    DEVICE: '#8b5cf6', PASSWORD: '#ef4444', GENERAL: '#6b7280',
  };
  const color = colors[type] || '#6b7280';
  return (
    <span style={{ background: color + '22', color, borderRadius: 4, padding: '2px 8px', fontSize: '0.8rem', fontWeight: 600 }}>
      {type}
    </span>
  );
}

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', policy_type: 'ACCESS', status: 'active' });

  const fetchPolicies = async () => {
    try {
      const res = await policiesAPI.getAll();
      setPolicies(res.data);
    } catch (e) {
      setError('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Policy name is required'); return; }
    setError('');
    try {
      const res = await policiesAPI.create(form);
      setPolicies(prev => [res.data, ...prev]);
      setSuccess('Policy created successfully');
      setShowForm(false);
      setForm({ name: '', description: '', policy_type: 'ACCESS', status: 'active' });
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create policy');
    }
  };

  const toggleStatus = async (policy) => {
    const newStatus = policy.status === 'active' ? 'inactive' : 'active';
    try {
      await policiesAPI.update(policy.id, { status: newStatus });
      setPolicies(prev => prev.map(p => p.id === policy.id ? { ...p, status: newStatus } : p));
    } catch (e) {
      setError('Failed to update policy status');
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Security Policies"
        subtitle="Manage access control and security policies"
        actions={
          <button className="btn btn-primary" id="add-policy-btn" onClick={() => setShowForm(true)}>
            ＋ Add Policy
          </button>
        }
      />

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'var(--accent)', marginTop: 0 }}>Create Security Policy</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Policy Name *</label>
                <input id="policy-name" className="form-input" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Block Off-hours Access" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea id="policy-desc" className="form-input" rows={3} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe what this policy enforces..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Policy Type</label>
                  <select id="policy-type" className="form-select" value={form.policy_type}
                    onChange={e => setForm({ ...form, policy_type: e.target.value })}>
                    {POLICY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select id="policy-status" className="form-select" value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="submit-policy-btn">＋ Create Policy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner /> : policies.length === 0 ? (
        <EmptyState message="No policies configured. Add your first security policy." icon="📜" />
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {policies.map(policy => (
            <div key={policy.id} className="card" style={{
              borderLeft: `3px solid ${policy.status === 'active' ? 'var(--accent-green)' : '#6b7280'}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{policy.name}</h4>
                  <PolicyTypeBadge type={policy.policy_type} />
                  <span style={{
                    background: policy.status === 'active' ? '#10b98122' : '#6b728022',
                    color: policy.status === 'active' ? '#10b981' : '#6b7280',
                    borderRadius: 4, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 600
                  }}>
                    {policy.status?.toUpperCase()}
                  </span>
                </div>
                {policy.description && (
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{policy.description}</p>
                )}
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Created: {new Date(policy.created_at).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 16, flexShrink: 0 }}>
                <button
                  className={`btn ${policy.status === 'active' ? 'btn-ghost' : 'btn-primary'}`}
                  style={{ fontSize: '0.8rem', padding: '5px 12px' }}
                  onClick={() => toggleStatus(policy)}
                  id={`toggle-policy-${policy.id}`}
                >
                  {policy.status === 'active' ? '⏸ Disable' : '▶ Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
