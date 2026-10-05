import React from 'react';

export const UrgencyScore = ({ score = 0, showLabel = true }) => {
  const numericScore = Number(score) || 0;

  return (
    <div className="flex flex-col">
      {showLabel && (
        <span className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider mb-1">
          Urgency Score (0-100)
        </span>
      )}
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold font-mono text-[#1A1A1A]">
          {numericScore.toFixed(1)}
        </span>
      </div>
      <p className="text-[11px] text-[#5F6368] mt-1 italic">
        Signals how quickly intervention is required (complaint spikes, deterioration)
      </p>
    </div>
  );
};

export default UrgencyScore;
