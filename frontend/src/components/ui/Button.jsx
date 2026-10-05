import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed select-none text-center rounded";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base"
  };

  const variantStyles = {
    primary: "bg-[#168A44] hover:bg-[#126B37] text-white border border-[#168A44]",
    secondary: "bg-white hover:bg-gray-50 text-[#1A1A1A] border border-[#DDE1E5]",
    outline: "bg-transparent hover:bg-gray-50 text-[#1A1A1A] border border-[#DDE1E5]",
    danger: "bg-red-600 hover:bg-red-700 text-white border border-red-600",
    light: "bg-[#DCFCE7] hover:bg-emerald-100 text-[#126B37] border border-emerald-200",
    ghost: "bg-transparent text-[#5F6368] hover:text-[#1A1A1A] hover:bg-gray-100 border border-transparent"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
