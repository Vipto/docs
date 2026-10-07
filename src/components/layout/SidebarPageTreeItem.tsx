import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Page } from '@/types';
import { DocIcon } from '@/components/common/DocIcon';

interface SidebarPageTreeItemProps {
  page: Page;
  allPages: Page[];
  spaceKey: string;
  activePageId?: string;
  level: number;
  expandedPages: Record<string, boolean>;
  onToggleExpand: (pageId: string) => void;
  creatingState: { spaceId: string; parentId: string | null } | null;
  onStartCreate: (spaceId: string, parentId: string | null) => void;
  onSubmitCreate: (title: string, spaceId: string, parentId: string | null) => Promise<void>;
  onCancelCreate: () => void;
}

export const SidebarPageTreeItem: React.FC<SidebarPageTreeItemProps> = ({
  page,
  allPages,
  spaceKey,
  activePageId,
  level = 0,
  expandedPages,
  onToggleExpand,
  creatingState,
  onStartCreate,
  onSubmitCreate,
  onCancelCreate,
}) => {
  const navigate = useNavigate();
  const [inlineTitle, setInlineTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const childPages = allPages
    .filter((p) => p.parentId === page.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const hasChildren = childPages.length > 0;
  const isExpanded = !!expandedPages[page.id];
  const isActive = activePageId === page.id;
  const isCreatingChild = creatingState?.spaceId === page.spaceId && creatingState?.parentId === page.id;

  // Auto focus input when inline creation starts
  useEffect(() => {
    if (isCreatingChild) {
      setInlineTitle('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isCreatingChild]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);
      const titleToCreate = inlineTitle.trim() || 'Untitled Document';
      await onSubmitCreate(titleToCreate, page.spaceId, page.id);
      setIsSubmitting(false);
      setInlineTitle('');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancelCreate();
      setInlineTitle('');
    }
  };

  const handleBlur = async () => {
    // Small delay so button clicks or unmount doesn't conflict
    setTimeout(async () => {
      if (isCreatingChild && !isSubmitting) {
        if (inlineTitle.trim().length > 0) {
          setIsSubmitting(true);
          await onSubmitCreate(inlineTitle.trim(), page.spaceId, page.id);
          setIsSubmitting(false);
          setInlineTitle('');
        } else {
          onCancelCreate();
        }
      }
    }, 150);
  };

  const paddingLeft = Math.min(level * 14 + 10, 80);

  return (
    <div className="flex flex-col select-none">
      {/* Page Row */}
      <div
        style={{ paddingLeft: `${paddingLeft}px` }}
        className={`group relative flex items-center justify-between pr-1.5 py-1 rounded-lg text-xs font-medium transition-all ${
          isActive
            ? 'bg-primary/15 text-primary font-semibold shadow-2xs'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Chevron expand/collapse button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(page.id);
              }}
              className="p-0.5 rounded text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors shrink-0"
              title={isExpanded ? 'Collapse subpages' : 'Expand subpages'}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-3.5 shrink-0" />
          )}

          {/* Page Link */}
          <Link
            to={`/spaces/${spaceKey}/${page.id}`}
            onClick={() => {
              if (hasChildren && !isExpanded) {
                onToggleExpand(page.id);
              }
            }}
            className="flex items-center gap-2 min-w-0 flex-1 truncate py-0.5"
            title={page.title}
          >
            <DocIcon icon={page.icon} className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="truncate">{page.title}</span>
          </Link>
        </div>

        {/* Action button: '+' create subpage */}
        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onStartCreate(page.spaceId, page.id);
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Add subpage"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Inline Input Field for Creating Subpage */}
      {isCreatingChild && (
        <div
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
          className="flex items-center gap-2 py-1 pr-2 rounded-lg bg-primary/5 border border-primary/20 my-0.5 animate-in fade-in zoom-in-95"
        >
          <FileText className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={inlineTitle}
            onChange={(e) => setInlineTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={isSubmitting}
            placeholder="Page title... (Press Enter)"
            className="w-full text-xs font-medium text-foreground bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/60"
          />
        </div>
      )}

      {/* Recursive Render of Subpages */}
      {isExpanded && hasChildren && (
        <div className="flex flex-col space-y-0.5 mt-0.5">
          {childPages.map((child) => (
            <SidebarPageTreeItem
              key={child.id}
              page={child}
              allPages={allPages}
              spaceKey={spaceKey}
              activePageId={activePageId}
              level={level + 1}
              expandedPages={expandedPages}
              onToggleExpand={onToggleExpand}
              creatingState={creatingState}
              onStartCreate={onStartCreate}
              onSubmitCreate={onSubmitCreate}
              onCancelCreate={onCancelCreate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
