import React from 'react';

const StatCard = ({ title, value, icon, trend, color, subtitle }) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span>{title}</span>
        <span className="stat-icon" style={{ color: color || 'var(--text-secondary)' }}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      {subtitle && (
        <div className="stat-footer">
          {trend && (
            <span style={{ color: trend > 0 ? 'var(--accent-green)' : (trend < 0 ? 'var(--danger-red)' : 'var(--text-secondary)') }}>
              {trend > 0 ? '↑' : (trend < 0 ? '↓' : '→')} {Math.abs(trend)}%
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
