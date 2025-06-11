import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormButtonProps {
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const FormButton: React.FC<FormButtonProps> = ({
  type = 'button',
  variant = 'primary',
  onClick,
  disabled,
  loading,
  icon: Icon,
  children
}) => {
  const baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}; 