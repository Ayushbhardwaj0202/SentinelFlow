import React from 'react';

const AlertBadge = ({ severity }) => {
  let badgeClass = 'badge-neutral';
  
  switch (severity?.toUpperCase()) {
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
      badgeClass = 'badge-critical pulse';
      break;
    default:
      badgeClass = 'badge-neutral';
  }

  return <span className={`badge ${badgeClass}`}>{severity || 'UNKNOWN'}</span>;
};

export default AlertBadge;
