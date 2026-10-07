import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Plus,
  MoreHorizontal,
  Trash2,
  Copy,
  FolderInput,
  Edit2,
  ExternalLink,
  Link as LinkIcon,
  GripVertical,
} from 'lucide-react';
import { Page, UserRole } from '@/types';
import { canEditPage } from '@/permissions/roles';
import { DocIcon } from '@/components/common/DocIcon';

interface PageTreeItemProps {
  page: Page;
  allPages: Page[];
  spaceKey: string;
  activePageId?: string;
  level?: number;
  userRole: UserRole;
  expandAllSignal?: boolean | null;
  onAddChildPage: (parentId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  onMovePage: (page: Page) => void;
  onRenamePage?: (pageId: string, newTitle: string) => void;
  onReorderPage?: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
}

export const PageTreeItem: React.FC<PageTreeItemProps> = ({
  page,
  allPages,
  spaceKey,
  activePageId,
  level = 0,
  userRole,
  expandAllSignal,
  onAddChildPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
  onRenamePage,
  onReorderPage,
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameTitle, setRenameTitle] = useState(page.title);
  const [isDragOver, setIsDragOver] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const childPages = allPages
    .filter((p) => p.parentId === page.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const hasChildren = childPages.length > 0;
  const isActive = activePageId === page.id;

  // Auto-expand if active page is a descendant
  useEffect(() => {
    if (activePageId && childPages.some((c) => c.id === activePageId || allPages.some(ap => ap.parentId === c.id && ap.id === activePageId))) {
      setIsExpanded(true);
    }
  }, [activePageId]);

  // Handle global expand/collapse signal
  useEffect(() => {
    if (expandAllSignal !== null && expandAllSignal !== undefined) {
      setIsExpanded(expandAllSignal);
    }
  }, [expandAllSignal]);

  // Click outside listener for menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    if (isRenaming) {
      setTimeout(() => renameInputRef.current?.focus(), 50);
    }
  }, [isRenaming]);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRenaming) {
      navigate(`/spaces/${spaceKey}/${page.id}`);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(true);
  };

  const handleRenameSubmit = () => {
    if (renameTitle.trim() && renameTitle !== page.title) {
      onRenamePage?.(page.id, renameTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', page.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== page.id) {
      onReorderPage?.(draggedId, page.id, 'inside');
    }
  };

  const copyPageUrl = () => {
    const fullUrl = `${window.location.origin}/spaces/${spaceKey}/${page.id}`;
    navigator.clipboard.writeText(fullUrl);
  };

  return (
    <div
      className={`select-none ${isDragOver ? 'ring-2 ring-primary/60 rounded-xl bg-primary/5' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        draggable={!isRenaming}
        onDragStart={handleDragStart}
        style={{ paddingLeft: `${level * 14 + 6}px` }}
        className={`group relative flex items-center justify-between py-1.5 pr-2 rounded-xl cursor-pointer text-xs transition-colors ${
          isActive
            ? 'bg-primary/15 text-primary font-bold shadow-2xs'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Drag Handle on hover */}
          <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-40 text-muted-foreground cursor-grab shrink-0 -ml-1" />

          {/* Expand/Collapse Chevron */}
          <button
            type="button"
            onClick={toggleExpand}
            className={`p-0.5 rounded hover:bg-muted text-muted-foreground/80 hover:text-foreground transition-transform ${
              !hasChildren ? 'invisible' : ''
            }`}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Icon */}
          <DocIcon icon={page.icon} className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />

          {/* Title or Inline Rename Input */}
          {isRenaming ? (
            <input
              ref={renameInputRef}
              type="text"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') setIsRenaming(false);
              }}
              onClick={(e) => e.stopPropagation()}
              className="px-1.5 py-0.5 rounded bg-background border border-primary text-foreground text-xs outline-none w-full"
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (canEditPage(userRole)) setIsRenaming(true);
              }}
              className="truncate flex-1 font-medium"
              title={page.title}
            >
              {page.title || 'Untitled'}
            </span>
          )}
        </div>

        {/* Hover Actions */}
        {canEditPage(userRole) && !isRenaming && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddChildPage(page.id);
              }}
              className="p-1 rounded-md hover:bg-background text-muted-foreground hover:text-foreground"
              title="Add child page"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-md hover:bg-background text-muted-foreground hover:text-foreground"
                title="Page actions"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 w-44 bg-popover border border-border rounded-xl shadow-2xl p-1.5 z-50 text-xs font-normal animate-in fade-in zoom-in-95"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/spaces/${spaceKey}/${page.id}`);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-primary" /> Open Document
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      window.open(`/spaces/${spaceKey}/${page.id}`, '_blank');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground text-left"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" /> Open in New Tab
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onAddChildPage(page.id);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground text-left"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-500" /> Add Sub-page
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsRenaming(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-500" /> Rename Title
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDuplicatePage(page.id);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground text-left"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onMovePage(page);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground text-left"
                  >
                    <FolderInput className="w-3.5 h-3.5" /> Move page
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      copyPageUrl();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground text-left"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" /> Copy Page Link
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDeletePage(page.id);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-destructive/10 text-destructive text-left border-t border-border mt-1 pt-1.5 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Children Nodes */}
      {isExpanded && hasChildren && (
        <div className="space-y-0.5">
          {childPages.map((child) => (
            <PageTreeItem
              key={child.id}
              page={child}
              allPages={allPages}
              spaceKey={spaceKey}
              activePageId={activePageId}
              level={level + 1}
              userRole={userRole}
              expandAllSignal={expandAllSignal}
              onAddChildPage={onAddChildPage}
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
