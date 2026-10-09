import React from 'react';

const RiskBadge = ({ level }) => {
  let badgeClass = 'badge-neutral';
  
  switch (level?.toUpperCase()) {
    case 'LOW':
      badgeClass = 'badge-low';
      break;
    case 'MEDIUM':
      badgeClass = 'badge-medium';
      break;
    case 'HIGH':
      badgeClass = 'badge-high';
      break;
    case 'CRITICAL':
      badgeClass = 'badge-critical';
      break;
    default:
      badgeClass = 'badge-neutral';
  }

  return <span className={`badge ${badgeClass}`}>{level || 'UNKNOWN'}</span>;
};

export default RiskBadge;
