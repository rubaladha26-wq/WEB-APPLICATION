import React from 'react';
import { getStatusBadge } from '../../utils/formatters';

const Badge = ({ status, className = '' }) => {
  const styles = getStatusBadge(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles.bg} ${styles.text} ${styles.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {status}
    </span>
  );
};

export default Badge;

