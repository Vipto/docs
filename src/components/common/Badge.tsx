import React from 'react';
import { UserRole } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
  role?: UserRole;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  role,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
  };

  let variantClass = 'bg-secondary text-secondary-foreground border-transparent';

  if (role) {
    switch (role) {
      case 'Owner':
        variantClass = 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
        break;
      case 'Admin':
        variantClass = 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        break;
      case 'Editor':
        variantClass = 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        break;
      case 'Viewer':
        variantClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        break;
    }
  } else {
    switch (variant) {
      case 'primary':
        variantClass = 'bg-primary/15 text-primary border-primary/20';
        break;
      case 'success':
        variantClass = 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200';
        break;
      case 'warning':
        variantClass = 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200';
        break;
      case 'danger':
        variantClass = 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200';
        break;
      case 'outline':
        variantClass = 'bg-transparent border-border text-foreground';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size]} ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
};
