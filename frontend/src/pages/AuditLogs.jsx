import React, { useState, useEffect } from 'react';
import { auditAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const ACTION_COLORS = {
  LOGIN: '#10b981',
  LOGOUT: '#6b7280',
  CREATE_USER: '#3b82f6',
  UPDATE_USER: '#f59e0b',
  DELETE_USER: '#ef4444',
  RECORD_ACTIVITY: '#8b5cf6',
  CREATE_ALERT: '#f59e0b',
  UPDATE_ALERT: '#f59e0b',
  CREATE_INVESTIGATION: '#3b82f6',
  UPDATE_INVESTIGATION: '#f59e0b',
  GENERATE_REPORT: '#10b981',
  DEFAULT: '#94a3b8',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ action: '', entity_type: '', page: 1 });
  const PAGE_SIZE = 20;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.action) params.action = filters.action;
        if (filters.entity_type) params.entity_type = filters.entity_type;
        params.limit = PAGE_SIZE;
        params.offset = (filters.page - 1) * PAGE_SIZE;
        const res = await auditAPI.getAll(params);
        setLogs(res.data);
      } catch (e) {
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [filters]);

  const getActionColor = (action) => ACTION_COLORS[action] || ACTION_COLORS.DEFAULT;

  return (
    <div className="fade-in">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable trail of all security-relevant actions"
      />

      {error && <div className="alert-error">{error}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 160px' }}>
            <input
              id="audit-filter-action"
              className="form-input"
              placeholder="Filter by action..."
              value={filters.action}
              onChange={e => setFilters(f => ({ ...f, action: e.target.value, page: 1 }))}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 160px' }}>
            <input
              id="audit-filter-entity"
              className="form-input"
              placeholder="Filter by entity type..."
              value={filters.entity_type}
              onChange={e => setFilters(f => ({ ...f, entity_type: e.target.value, page: 1 }))}
            />
          </div>
          <button className="btn btn-ghost" onClick={() => setFilters({ action: '', entity_type: '', page: 1 })}>
            ✕ Clear
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : logs.length === 0 ? (
        <EmptyState message="No audit log entries found." icon="📋" />
      ) : (
        <>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>Description</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--accent)', fontWeight: 500 }}>
                      {log.actor_username || `User #${log.actor_id}`}
                    </td>
                    <td>
                      <span style={{
                        background: getActionColor(log.action) + '22',
                        color: getActionColor(log.action),
                        borderRadius: 4,
                        padding: '2px 8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        fontFamily: 'monospace',
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {log.entity_type || '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {log.entity_id || '—'}
                    </td>
                    <td style={{ color: 'var(--text-primary)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={log.description}>
                      {log.description || '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      {log.ip_address || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            <button
              className="btn btn-ghost"
              disabled={filters.page === 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            >
              ← Prev
            </button>
            <span style={{ color: 'var(--text-secondary)', padding: '8px 16px' }}>Page {filters.page}</span>
            <button
              className="btn btn-ghost"
              disabled={logs.length < PAGE_SIZE}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
