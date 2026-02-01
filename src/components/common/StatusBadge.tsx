import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = status ? status.toLowerCase() : 'unknown';
  
  const styles: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    locked: 'bg-red-50 text-red-700 border-red-200',
    inactive: 'bg-gray-100 text-gray-500 border-gray-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-red-50 text-red-600 border-red-100',
  };

  const className = styles[s] || 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${className} uppercase tracking-wider`}>
      {status}
    </span>
  );
};

export default StatusBadge;