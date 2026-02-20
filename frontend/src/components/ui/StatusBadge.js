import React from 'react';

export const StatusBadge = ({ status }) => {
  const variants = {
    sleeping: 'bg-blue-100 text-blue-700 border-blue-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200'
  };

  const labels = {
    sleeping: 'Sleeping',
    active: 'Active',
    error: 'Error'
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${variants[status]}`}
      data-testid={`status-badge-${status}`}
    >
      {labels[status]}
    </span>
  );
};
