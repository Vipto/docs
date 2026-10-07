import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-extrabold text-foreground">Page Not Found</h1>
      <p className="text-xs text-muted-foreground max-w-sm">
        The documentation page or space you are looking for doesn't exist or may have been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
      >
        <Home className="w-3.5 h-3.5" /> Return to Workspace Home
      </Link>
    </div>
  );
};
