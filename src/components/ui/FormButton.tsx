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
  const baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200";
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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