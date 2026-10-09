import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const ROLES = ['employee', 'analyst', 'admin'];
const STATUSES = ['active', 'inactive', 'suspended'];
const DEPARTMENTS = ['Engineering', 'Finance', 'Security', 'IT Administration', 'HR', 'Legal', 'Operations'];

function StatusBadgeLocal({ status }) {
  const colors = { active: '#10b981', inactive: '#6b7280', suspended: '#ef4444' };
  const color = colors[status] || '#6b7280';
  return (
    <span style={{ background: color + '22', color, borderRadius: 4, padding: '2px 8px', fontSize: '0.8rem', fontWeight: 600 }}>
      {status?.toUpperCase()}
    </span>
  );
}

function RoleBadge({ role }) {
  const colors = { admin: '#ef4444', analyst: '#3b82f6', employee: '#10b981' };
  const color = colors[role] || '#94a3b8';
  return (
    <span style={{ background: color + '22', color, borderRadius: 4, padding: '2px 8px', fontSize: '0.8rem', fontWeight: 600 }}>
      {role?.toUpperCase()}
    </span>
  );
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '', role: 'employee', department: 'Engineering', status: 'active' });

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data);
    } catch (e) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditUser(null);
    setForm({ username: '', email: '', full_name: '', password: '', role: 'employee', department: 'Engineering', status: 'active' });
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ username: u.username, email: u.email, full_name: u.full_name, password: '', role: u.role_name || 'employee', department: u.department || 'Engineering', status: u.status || 'active' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editUser) {
        const payload = { full_name: form.full_name, email: form.email, role: form.role, department: form.department, status: form.status };
        if (form.password) payload.password = form.password;
        await usersAPI.update(editUser.id, payload);
        setSuccess('User updated successfully');
      } else {
        if (!form.username || !form.email || !form.full_name || !form.password) {
          setError('All fields required for new user');
          return;
        }
        await usersAPI.create(form);
        setSuccess('User created successfully');
      }
      setShowForm(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError(e.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await usersAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setSuccess('User deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="User Management"
        subtitle="Manage system users, roles, and access"
        actions={
          <button className="btn btn-primary" id="add-user-btn" onClick={openCreate}>
            ＋ Add User
          </button>
        }
      />

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'var(--accent)', marginTop: 0 }}>{editUser ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleSubmit}>
              {!editUser && (
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input id="user-username" className="form-input" value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })} placeholder="username" required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input id="user-fullname" className="form-input" value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Full Name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input id="user-email" type="email" className="form-input" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">{editUser ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input id="user-password" type="password" className="form-input" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select id="user-role" className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select id="user-dept" className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              {editUser && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select id="user-status" className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="submit-user-btn">
                  {editUser ? '💾 Save Changes' : '＋ Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner /> : users.length === 0 ? (
        <EmptyState message="No users found." icon="👥" />
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Risk Level</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{u.username}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{u.full_name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
                  <td><RoleBadge role={u.role_name || u.role} /></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.department || '—'}</td>
                  <td><StatusBadgeLocal status={u.status} /></td>
                  <td><RiskBadge level={u.risk_level} /></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '3px 8px' }}
                        onClick={() => openEdit(u)}>✏️ Edit</button>
                      {u.id !== currentUser?.id && (
                        <button className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '3px 8px' }}
                          onClick={() => handleDelete(u.id)}>🗑</button>
                      )}
                    </div>
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
