import React from 'react';

interface AvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = 'User',
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const getInitials = (text: string) => {
    const parts = text.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm font-semibold',
    xl: 'w-14 h-14 text-base font-bold',
  };

  // Consistent background color based on name
  const colors = [
    'bg-indigo-600 text-white',
    'bg-emerald-600 text-white',
    'bg-blue-600 text-white',
    'bg-violet-600 text-white',
    'bg-amber-600 text-white',
    'bg-rose-600 text-white',
    'bg-teal-600 text-white',
  ];
  const colorIndex = Math.abs(
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  );
  const colorClass = colors[colorIndex];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0 border border-border ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center shrink-0 select-none shadow-sm ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
