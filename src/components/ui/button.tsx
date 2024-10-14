import React from "react";
import { cm } from "../../utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
}

interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
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
        props.disabled ? "opacity-50" : "",
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
    <a
      className={cm(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
};

const baseStyles =
  "font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
const variantStyles = {
  default: "bg-blue-600 text-white hover:bg-blue-700",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  ghost: "text-gray-700 hover:bg-gray-100",
};
const sizeStyles = {
  default: "px-4 py-2",
  sm: "px-3 py-1 text-sm",
  lg: "px-6 py-3 text-lg",
  icon: "size-10 flex items-center justify-center",
};
