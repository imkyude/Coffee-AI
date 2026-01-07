import React from 'react';

const ModelIndicator = ({ modelName, status = 'active' }) => {
  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-400',
    loading: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
      <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`}></div>
      <span className="text-sm font-medium text-gray-700">{modelName}</span>
      <span className={`text-xs px-2 py-1 rounded-full ${
        status === 'active' ? 'bg-green-100 text-green-800' :
        status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
        status === 'error' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
    </div>
  );
};

export default ModelIndicator;
