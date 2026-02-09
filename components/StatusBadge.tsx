
import React from 'react';
import { PropertyStatus } from '../types';

interface Props {
  status: PropertyStatus;
}

const StatusBadge: React.FC<Props> = ({ status }) => {
  const styles = {
    [PropertyStatus.INTERESTED]: 'bg-blue-100 text-blue-700 border-blue-200',
    [PropertyStatus.CONTACTED]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [PropertyStatus.VISITED]: 'bg-green-100 text-green-700 border-green-200',
    [PropertyStatus.DISCARDED]: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
