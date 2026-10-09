import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

const INFO_ROWS = [
  { label: 'Application', value: 'SentinelFlow' },
  { label: 'Version', value: '1.0.0 (MVP)' },
  { label: 'Frontend', value: 'React 19 + Vite 7' },
  { label: 'Backend', value: 'Node.js + Express 5' },
  { label: 'Database', value: 'PostgreSQL' },
  { label: 'Auth', value: 'JWT + bcryptjs' },
  { label: 'Architecture', value: 'REST API' },
];

const DETECTION_RULES = [
  { name: 'Multiple Failed Logins', condition: 'failed_logins >= 3 in 24h', severity: 'MEDIUM', active: true },
  { name: 'Large Data Export', condition: 'activity_type = DATA_EXPORT', severity: 'HIGH', active: true },
  { name: 'Off-hours Access', condition: 'login_time outside 08:00-18:00', severity: 'MEDIUM', active: true },
  { name: 'Sensitive Resource Access', condition: 'resource contains admin/export', severity: 'HIGH', active: true },
  { name: 'Unknown Device Login', condition: 'device_id is null', severity: 'HIGH', active: true },
  { name: 'Critical Risk Score', condition: 'risk_score >= 80', severity: 'CRITICAL', active: true },
  { name: 'High Activity Volume', condition: 'activities > 100 in 24h', severity: 'MEDIUM', active: true },
];

export default function Settings() {
  const [apiStatus, setApiStatus] = useState('checking...');
  const [apiStatusColor, setApiStatusColor] = useState('#f59e0b');

  useEffect(() => {
    api.get('/').then(res => {
      setApiStatus(`✅ ${res.data.message}`);
      setApiStatusColor('#10b981');
    }).catch(() => {
      setApiStatus('❌ Backend unreachable');
      setApiStatusColor('#ef4444');
    });
  }, []);

  const severityColor = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' };

  return (
    <div className="fade-in">
      <PageHeader title="System Settings" subtitle="Platform configuration and detection rules" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* System Info */}
        <div className="card">
          <h3 style={{ color: 'var(--accent)', marginTop: 0, marginBottom: 16 }}>⚙️ System Information</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {INFO_ROWS.map(row => (
                <tr key={row.label} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 0', color: 'var(--text-secondary)', fontSize: '0.9rem', width: '40%' }}>{row.label}</td>
                  <td style={{ padding: '8px 0', color: 'var(--text-primary)', fontWeight: 500 }}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* API Health */}
        <div className="card">
          <h3 style={{ color: 'var(--accent)', marginTop: 0, marginBottom: 16 }}>🔌 Backend Health</h3>
          <div style={{
            background: 'var(--bg-elevated)', borderRadius: 8, padding: 16,
            border: `1px solid ${apiStatusColor}44`, marginBottom: 12
          }}>
            <div style={{ color: apiStatusColor, fontWeight: 600, marginBottom: 4 }}>API Status</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{apiStatus}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>http://localhost:5000</div>
          </div>

          <h4 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Environment</h4>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 12 }}>
            {[
              { key: 'NODE_ENV', val: 'development' },
              { key: 'PORT', val: '5000' },
              { key: 'DATABASE_URL', val: 'postgresql://***@localhost:5432/sentinelflow' },
              { key: 'JWT_EXPIRES_IN', val: '24h' },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.key}</span>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detection Rules */}
      <div className="card">
        <h3 style={{ color: 'var(--accent)', marginTop: 0, marginBottom: 4 }}>🛡️ Active Detection Rules</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 0, marginBottom: 16 }}>
          Rule-based anomaly detection engine. These rules are evaluated when new activities are recorded.
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Rule Name</th>
              <th>Condition</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {DETECTION_RULES.map((rule, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{rule.name}</td>
                <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>{rule.condition}</td>
                <td>
                  <span style={{
                    background: (severityColor[rule.severity] || '#6b7280') + '22',
                    color: severityColor[rule.severity] || '#6b7280',
                    borderRadius: 4, padding: '2px 8px', fontSize: '0.8rem', fontWeight: 600
                  }}>{rule.severity}</span>
                </td>
                <td>
                  <span style={{ background: '#10b98122', color: '#10b981', borderRadius: 4, padding: '2px 8px', fontSize: '0.8rem', fontWeight: 600 }}>
                    ✓ ACTIVE
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Demo Credentials */}
      <div className="card" style={{ borderLeft: '3px solid var(--accent)', marginTop: 20 }}>
        <h3 style={{ color: 'var(--accent)', marginTop: 0 }}>🔑 Demo Credentials</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { role: 'Employee', user: 'employee1', pass: 'Employee@123', color: '#10b981' },
            { role: 'Security Analyst', user: 'analyst', pass: 'Analyst@123', color: '#3b82f6' },
            { role: 'Administrator', user: 'admin', pass: 'Admin@123', color: '#ef4444' },
          ].map(cred => (
            <div key={cred.role} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14, border: `1px solid ${cred.color}33` }}>
              <div style={{ color: cred.color, fontWeight: 700, marginBottom: 6 }}>{cred.role}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Username: <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{cred.user}</span></div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Password: <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{cred.pass}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
