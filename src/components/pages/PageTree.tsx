import React, { useState } from 'react';
import { Plus, FileText, ChevronsUpDown, ChevronsDownUp, FolderPlus } from 'lucide-react';
import { Page, UserRole } from '@/types';
import { PageTreeItem } from './PageTreeItem';
import { canCreatePage } from '@/permissions/roles';

interface PageTreeProps {
  pages: Page[];
  spaceKey: string;
  activePageId?: string;
  userRole: UserRole;
  onAddPage: (parentId?: string | null) => void;
  onDuplicatePage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  onMovePage: (page: Page) => void;
  onRenamePage?: (pageId: string, newTitle: string) => void;
  onReorderPage?: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
}

export const PageTree: React.FC<PageTreeProps> = ({
  pages,
  spaceKey,
  activePageId,
  userRole,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
  onRenamePage,
  onReorderPage,
}) => {
  const [expandAllSignal, setExpandAllSignal] = useState<boolean | null>(null);

  const rootPages = pages
    .filter((p) => !p.parentId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-1.5">
      {/* Tree Header Controls */}
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <span>Pages</span>
          <span className="px-1.5 py-0.2 rounded bg-muted text-[10px]">{pages.length}</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setExpandAllSignal((prev) => (prev === true ? false : true))}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Expand/Collapse All"
          >
            {expandAllSignal === true ? (
              <ChevronsDownUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronsUpDown className="w-3.5 h-3.5" />
            )}
          </button>

          {canCreatePage(userRole) && (
            <button
              type="button"
              onClick={() => onAddPage(null)}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Create Root Page"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
            </button>
          )}
        </div>
      </div>

      {rootPages.length === 0 ? (
        <div className="px-3 py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
          <FileText className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
          <p className="font-medium text-foreground">No pages yet</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Create your team's first documentation page.</p>
          {canCreatePage(userRole) && (
            <button
              onClick={() => onAddPage(null)}
              className="mt-2.5 px-3 py-1 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Create Page
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-0.5">
          {rootPages.map((page) => (
            <PageTreeItem
              key={page.id}
              page={page}
              allPages={pages}
              spaceKey={spaceKey}
              activePageId={activePageId}
              userRole={userRole}
              expandAllSignal={expandAllSignal}
              onAddChildPage={(parentId) => onAddPage(parentId)}
              onDuplicatePage={onDuplicatePage}
              onDeletePage={onDeletePage}
              onMovePage={onMovePage}
              onRenamePage={onRenamePage}
              onReorderPage={onReorderPage}
            />
          ))}
        </div>
      )}
    </div>
  );
};
