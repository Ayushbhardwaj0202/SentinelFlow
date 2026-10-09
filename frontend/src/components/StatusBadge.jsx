import React from 'react';

const StatusBadge = ({ status }) => {
  let badgeClass = 'badge-neutral';
  
  switch (status?.toUpperCase()) {
    case 'OPEN':
    case 'ACTIVE':
    case 'IN_PROGRESS':
      badgeClass = 'badge-blue';
      break;
    case 'ACKNOWLEDGED':
    case 'UNDER_INVESTIGATION':
      badgeClass = 'badge-medium';
      break;
    case 'RESOLVED':
    case 'CLOSED':
    case 'INACTIVE':
      badgeClass = 'badge-low';
      break;
    case 'FALSE_POSITIVE':
    case 'BLOCKED':
      badgeClass = 'badge-neutral';
      break;
    default:
      badgeClass = 'badge-neutral';
  }

  return <span className={`badge ${badgeClass}`}>{status ? status.replace(/_/g, ' ') : 'UNKNOWN'}</span>;
};

export default StatusBadge;
