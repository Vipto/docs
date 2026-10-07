import React from 'react';

export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div className={`animate-pulse rounded bg-muted/70 ${className}`} />
  );
};

export const PageSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted" />
        <div className="h-8 w-64 rounded-md bg-muted" />
      </div>
      <div className="flex items-center gap-4">
        <div className="w-6 h-6 rounded-full bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </div>
      <div className="space-y-3 pt-6">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-4/6 rounded bg-muted" />
      </div>
      <div className="h-40 rounded-xl bg-muted/60" />
      <div className="space-y-3 pt-4">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
    </div>
  );
};
