import React, { useState, useRef, useEffect } from 'react';
import {
  MoreHorizontal,
  FolderInput,
  Copy,
  Download,
  History,
  Trash2,
  Link,
  Check,
} from 'lucide-react';
import { Page, UserRole } from '@/types';
import { canDeletePage } from '@/permissions/roles';

interface PageActionsMenuProps {
  page: Page;
  userRole: UserRole;
  currentUserId: string;
  onMoveClick: () => void;
  onDuplicateClick: () => void;
  onExportClick: () => void;
  onHistoryClick: () => void;
  onDeleteClick: () => void;
  onCopyLink: () => void;
}

export const PageActionsMenu: React.FC<PageActionsMenuProps> = ({
  page,
  userRole,
  currentUserId,
  onMoveClick,
  onDuplicateClick,
  onExportClick,
  onHistoryClick,
  onDeleteClick,
  onCopyLink,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthor = page.authorId === currentUserId;
  const userCanDelete = canDeletePage(userRole, isAuthor);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCopy = () => {
    onCopyLink();
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="More actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl p-1.5 z-40 text-xs animate-in fade-in zoom-in-95">
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted text-foreground text-left transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Link className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <span>{copied ? 'Copied link!' : 'Copy page link'}</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onMoveClick();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted text-foreground text-left transition-colors"
          >
            <FolderInput className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Move page...</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onDuplicateClick();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted text-foreground text-left transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Duplicate page</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onHistoryClick();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted text-foreground text-left transition-colors"
          >
            <History className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Version history</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onExportClick();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted text-foreground text-left transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Export document</span>
          </button>

          {userCanDelete && (
            <button
              onClick={() => {
                setIsOpen(false);
                onDeleteClick();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-destructive/10 text-destructive text-left transition-colors border-t border-border mt-1 pt-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete page</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
