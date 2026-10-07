import React, { useEffect, useState } from 'react';
import { AlignLeft } from 'lucide-react';
import { TableOfContentsItem } from '@/types';

interface TableOfContentsProps {
  items: TableOfContentsItem[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items }) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0% -60% 0%' }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToHeading = (id: string, text: string) => {
    // Look for element by id, or search headings by text
    let target = document.getElementById(id);
    if (!target) {
      const headings = document.querySelectorAll('h1, h2, h3');
      for (let i = 0; i < headings.length; i++) {
        if (headings[i].textContent?.trim() === text.trim()) {
          target = headings[i] as HTMLElement;
          break;
        }
      }
    }

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="sticky top-20 w-64 hidden xl:block shrink-0 pl-6 border-l border-border self-start max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        <AlignLeft className="w-3.5 h-3.5" />
        <span>On this page</span>
      </div>
      <nav className="space-y-1.5 text-xs">
        {items.map((item, index) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={`${item.id}-${index}`}
              onClick={() => scrollToHeading(item.id, item.text)}
              style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
              className={`block w-full text-left py-1 rounded transition-colors truncate border-l-2 -ml-[25px] ${
                isActive
                  ? 'border-primary text-primary font-medium bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {item.text || 'Untitled section'}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
