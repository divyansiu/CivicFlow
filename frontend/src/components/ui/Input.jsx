import React from 'react';

export const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-[#1A1A1A] flex items-center justify-between">
          <span>{label} {required && <span className="text-red-500">*</span>}</span>
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 text-sm bg-white border ${
          error ? 'border-red-500 focus:border-red-600' : 'border-[#DDE1E5] focus:border-[#168A44]'
        } text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#168A44] transition-colors rounded disabled:bg-gray-100 disabled:cursor-not-allowed`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#5F6368] mt-0.5">{helperText}</p>}
    </div>
  );
};
