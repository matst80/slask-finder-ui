import React from "react";
import { cm } from "../../utils";
import { Link, LinkProps } from "react-router-dom";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
}

interface ButtonLinkProps extends LinkProps {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  return (
    <button
      className={cm(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
        props.disabled ? "opacity-50" : ""
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const ButtonLink: React.FC<ButtonLinkProps> = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  return (
    <Link
      className={cm(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

const baseStyles =
  "font-medium rounded-sm focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:cursor-not-allowed";
const variantStyles = {
  default: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white/20",
  ghost: "text-gray-700 hover:bg-gray-100",
};
const sizeStyles = {
  default: "px-4 py-2",
  sm: "px-3 py-1 text-sm",
  lg: "px-6 py-3 text-lg",
  icon: "size-10 flex items-center justify-center",
};
