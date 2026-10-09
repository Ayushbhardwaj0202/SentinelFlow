import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const REPORT_TYPES = [
  { value: 'SECURITY_SUMMARY', label: 'Security Summary' },
  { value: 'INCIDENT_REPORT', label: 'Incident Report' },
  { value: 'RISK_ASSESSMENT', label: 'Risk Assessment' },
  { value: 'COMPLIANCE', label: 'Compliance Report' },
];

function ReportViewer({ report, onClose }) {
  const content = report.content || {};
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 700, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: 'var(--accent)', margin: 0 }}>{report.title}</h2>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div style={{ marginBottom: 12 }}>
          <span className="badge badge-medium">{report.report_type?.replace('_', ' ')}</span>
          <span style={{ color: 'var(--text-secondary)', marginLeft: 12, fontSize: '0.85rem' }}>
            Generated: {new Date(report.created_at).toLocaleString()}
          </span>
        </div>
        {report.summary && (
          <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{report.summary}</p>
          </div>
        )}
        <div className="card">
          <h4 style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: 12 }}>Report Data</h4>
          {content.totalUsers !== undefined && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Total Users', value: content.totalUsers },
                { label: 'Active Devices', value: content.activeDevices },
                { label: 'Total Activities', value: content.totalActivities },
                { label: 'Open Alerts', value: content.openAlerts },
                { label: 'High Risk Users', value: content.highRiskUsers },
                { label: 'Open Investigations', value: content.openInvestigations },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{item.label}</div>
                  <div style={{ color: 'var(--accent)', fontSize: '1.4rem', fontWeight: 700 }}>{item.value ?? '—'}</div>
                </div>
              ))}
            </div>
          )}
          {content.alertsBySeverity && (
            <div style={{ marginBottom: 16 }}>
              <h5 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Alerts by Severity</h5>
              <div style={{ display: 'flex', gap: 12 }}>
                {Object.entries(content.alertsBySeverity).map(([sev, count]) => (
                  <div key={sev} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                    <div className={`badge badge-${sev.toLowerCase()}`}>{sev}</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.2rem', marginTop: 4 }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {content.riskDistribution && (
            <div style={{ marginBottom: 16 }}>
              <h5 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Risk Distribution</h5>
              <div style={{ display: 'flex', gap: 12 }}>
                {Object.entries(content.riskDistribution).map(([level, count]) => (
                  <div key={level} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                    <div className={`badge badge-${level.toLowerCase()}`}>{level}</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.2rem', marginTop: 4 }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {content.topRiskyUsers && content.topRiskyUsers.length > 0 && (
            <div>
              <h5 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Top Risky Users</h5>
              <table className="data-table">
                <thead><tr><th>Username</th><th>Risk Level</th><th>Department</th></tr></thead>
                <tbody>
                  {content.topRiskyUsers.map((u, i) => (
                    <tr key={i}>
                      <td>{u.username}</td>
                      <td><span className={`badge badge-${u.risk_level?.toLowerCase()}`}>{u.risk_level}</span></td>
                      <td>{u.department || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Fallback: raw JSON if no structured content */}
          {content.totalUsers === undefined && !content.alertsBySeverity && (
            <pre style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(content, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewReport, setViewReport] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    report_type: 'SECURITY_SUMMARY',
    period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
  });

  const fetchReports = async () => {
    try {
      const res = await reportsAPI.getAll();
      setReports(res.data);
    } catch (e) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setGenerating(true);
    setError('');
    try {
      const res = await reportsAPI.generate(form);
      setReports(prev => [res.data, ...prev]);
      setSuccess('Report generated successfully!');
      setShowForm(false);
      setViewReport(res.data);
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Security Reports"
        subtitle="Generate and view security analysis reports"
        actions={
          <button className="btn btn-primary" id="generate-report-btn" onClick={() => setShowForm(true)}>
            📊 Generate Report
          </button>
        }
      />

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'var(--accent)', marginTop: 0 }}>Generate New Report</h3>
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label">Report Title *</label>
                <input
                  id="report-title"
                  className="form-input"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Weekly Security Summary"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Report Type</label>
                <select id="report-type" className="form-select" value={form.report_type} onChange={e => setForm({ ...form, report_type: e.target.value })}>
                  {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Period Start</label>
                  <input id="report-period-start" type="date" className="form-input" value={form.period_start} onChange={e => setForm({ ...form, period_start: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Period End</label>
                  <input id="report-period-end" type="date" className="form-input" value={form.period_end} onChange={e => setForm({ ...form, period_end: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={generating} id="submit-report-btn">
                  {generating ? 'Generating...' : '📊 Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewReport && <ReportViewer report={viewReport} onClose={() => setViewReport(null)} />}

      {loading ? <LoadingSpinner /> : reports.length === 0 ? (
        <EmptyState message="No reports generated yet. Click Generate Report to create your first report." icon="📊" />
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Generated By</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.title}</td>
                  <td><span className="badge badge-medium">{r.report_type?.replace(/_/g, ' ')}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.generated_by_username || r.generated_by || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(r.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                      onClick={() => setViewReport(r)}
                    >
                      👁 View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
