import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ username, password });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          ⚡ <span>Sentinel</span>Flow
        </div>
        <h2 className="text-center text-xl mb-6">Sign in to SOC</h2>
        
        {error && (
          <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--danger-red)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-4 text-sm text-secondary" style={{ borderTop: '1px solid var(--border-color)' }}>
          <p className="mb-2">Demo Credentials:</p>
          <div className="flex gap-2">
            <button type="button" className="badge badge-neutral cursor-pointer" onClick={() => autofill('admin', 'Admin@123')}>Admin</button>
            <button type="button" className="badge badge-neutral cursor-pointer" onClick={() => autofill('analyst', 'Analyst@123')}>Analyst</button>
            <button type="button" className="badge badge-neutral cursor-pointer" onClick={() => autofill('employee1', 'Employee@123')}>Employee</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
