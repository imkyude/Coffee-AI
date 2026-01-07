import React from 'react';

const UsageIndicator = ({ current, limit, type = 'messages' }) => {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getUsageColor = () => {
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (isAtLimit) return 'text-red-600';
    if (isNearLimit) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {type === 'messages' ? 'Messages' : 'API Calls'} Usage
        </span>
        <span className={`text-sm font-semibold ${getTextColor()}`}>
          {current} / {limit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getUsageColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <p className={`text-xs mt-2 ${getTextColor()}`}>
        {isAtLimit 
          ? 'You have reached your limit. Upgrade to continue.'
          : isNearLimit 
          ? 'You are approaching your limit.'
          : `${Math.round(percentage)}% of your quota used.`
        }
      </p>
    </div>
  );
};

export default UsageIndicator;
