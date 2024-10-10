import React from 'react'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className = '', ...props }) => {
  return (
    <label className="flex items-center">
      <input
        type="checkbox"
        className={`form-checkbox h-5 w-5 text-blue-600 ${className}`}
        {...props}
      />
      {label && <span className="ml-2 text-gray-700">{label}</span>}
    </label>
  )
}