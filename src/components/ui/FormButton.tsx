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
  const baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300";
  const variantClasses = {
    primary: "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white hover:shadow-lg hover:shadow-[#6366f1]/25 hover:-translate-y-0.5 disabled:opacity-50",
    secondary: "bg-[#1a1a2e] border border-[#27272a] text-[#a1a1aa] hover:bg-[#16213e] hover:border-[#6366f1] hover:text-white"
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