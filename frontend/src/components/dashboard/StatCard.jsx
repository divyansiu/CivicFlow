import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  badge,
  onClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return 'border-red-200 bg-red-50/40 text-red-700';
      case 'warning':
        return 'border-amber-200 bg-amber-50/40 text-amber-700';
      case 'success':
        return 'border-emerald-200 bg-emerald-50/40 text-[#126B37]';
      case 'neutral':
      default:
        return 'border-[#DDE1E5] bg-white text-[#1A1A1A]';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded border transition-all ${getVariantStyles()} ${
        onClick ? 'cursor-pointer hover:shadow-xs hover:border-gray-300' : ''
      }`}
    >
      <div className="flex items-center justify-between text-xs font-medium text-[#5F6368] mb-1.5">
        <span>{title}</span>
        {Icon && <Icon className="w-4 h-4 text-[#5F6368]" />}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
          {value}
        </span>
        {badge && (
          <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-[#5F6368]">
            {badge}
          </span>
        )}
      </div>
      {subtext && (
        <p className="text-xs text-[#5F6368] mt-1 line-clamp-1">{subtext}</p>
      )}
    </div>
  );
};

export default StatCard;
