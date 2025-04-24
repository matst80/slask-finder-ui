import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => {
  return (
    <input
      className={`
        w-full px-3 py-2
        bg-white
        border border-gray-200
        rounded-sm
        text-sm text-gray-900
        placeholder:text-gray-400
        focus:outline-hidden
        focus:ring-2 focus:ring-blue-500/20
        focus:border-blue-500
        transition-colors duration-200
        hover:border-gray-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  );
};
