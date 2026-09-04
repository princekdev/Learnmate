import React from 'react';

const ProgressBar = ({ value = 0, max = 100, color = 'primary', size = 'md', showLabel = false, label = '' }) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colors = {
    primary: 'bg-primary-600',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-600">{label}</span>
          <span className="text-xs font-semibold text-gray-700">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full ${colors[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
