import React from 'react';

const EmptyState = ({ message, icon = '📋' }) => {
  return (
    <div className="text-center p-6 slide-up" style={{ color: 'var(--text-secondary)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>{icon}</div>
      <p className="text-lg">{message || 'No data available'}</p>
    </div>
  );
};

export default EmptyState;
