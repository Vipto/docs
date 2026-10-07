import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '@/types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground overflow-x-auto py-1.5 scrollbar-none">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0 font-medium"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Vipto</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={item.id || index}>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
          {item.link && !item.isCurrent ? (
            <Link
              to={item.link}
              className="hover:text-foreground transition-colors truncate max-w-[160px] md:max-w-[220px]"
            >
              {item.title}
            </Link>
          ) : (
            <span
              className={`truncate max-w-[180px] md:max-w-[300px] ${
                item.isCurrent ? 'font-semibold text-foreground' : ''
              }`}
            >
              {item.title}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
