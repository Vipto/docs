import React, { useState } from 'react';
import {
  Star,
  Share2,
  MessageSquare,
  History,
  Download,
  Smile,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { Page, Space, BreadcrumbItem, UserRole, PresenceUser } from '@/types';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Avatar } from '@/components/common/Avatar';
import { DocIcon, AVAILABLE_DOC_ICONS } from '@/components/common/DocIcon';
import { PageActionsMenu } from './PageActionsMenu';
import { LivePresenceHeader } from './LivePresenceHeader';
import { PageReactions } from './PageReactions';
import { formatDate, formatRelativeTime } from '@/utils/formatters';

interface PageHeaderProps {
  page: Page;
  space: Space | null;
  breadcrumbs: BreadcrumbItem[];
  userRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  isFavorite: boolean;
  commentsCount: number;
  collaborators?: PresenceUser[];
  isFullWidth?: boolean;
  onToggleFullWidth?: () => void;
  onToggleFavorite: () => void;
  onOpenShare: () => void;
  onOpenComments: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  onOpenMove: () => void;
  onOpenRestrictions?: () => void;
  onOpenCoverPicker?: () => void;
  onToggleReaction?: (emoji: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onTitleChange: (newTitle: string) => void;
  onIconChange: (newIcon: string) => void;
  readOnly?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  page,
  space,
  breadcrumbs,
  userRole,
  currentUserId,
  currentUserName,
  isFavorite,
  commentsCount,
  collaborators = [],
  isFullWidth = false,
  onToggleFullWidth,
  onToggleFavorite,
  onOpenShare,
  onOpenComments,
  onOpenHistory,
  onOpenExport,
  onOpenMove,
  onOpenRestrictions,
  onOpenCoverPicker,
  onToggleReaction,
  onDuplicate,
  onDelete,
  onTitleChange,
  onIconChange,
  readOnly = false,
}) => {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isWatching, setIsWatching] = useState(false);

  return (
    <div className="space-y-4 pb-4 border-b border-border/80">
      {/* Breadcrumbs Navigation & Live Presence */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Breadcrumbs items={breadcrumbs} />

        <div className="flex items-center gap-2">
          {/* Live Multiplayer Presence Avatars */}
          {collaborators.length > 0 && (
            <LivePresenceHeader collaborators={collaborators} currentUserId={currentUserId} />
          )}

          {/* Add Cover Button (if no cover active) */}
          {!(page.coverUrl || page.coverImage) && !readOnly && onOpenCoverPicker && (
            <button
              type="button"
              onClick={onOpenCoverPicker}
              className="text-xs text-muted-foreground/70 hover:text-foreground flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-border/60 hover:bg-muted transition-colors"
              title="Add Header Banner"
            >
              <ImageIcon className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline font-medium">Add cover</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Header Actions Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Page Icon Picker & Title */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="relative shrink-0 mt-0.5">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="p-2.5 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-transform active:scale-95 disabled:hover:bg-primary/10 shadow-2xs border border-primary/20 flex items-center justify-center"
              title={readOnly ? 'Page Icon' : 'Change Icon'}
            >
              <DocIcon icon={page.icon} className="w-6 h-6 text-primary" />
            </button>

            {showIconPicker && (
              <div className="absolute left-0 top-full mt-2 p-3 rounded-2xl border border-border bg-popover shadow-2xl z-50 w-64 animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-bold uppercase text-muted-foreground mb-2 px-1">
                  Select Document Icon
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {AVAILABLE_DOC_ICONS.map((item) => {
                    const IconCmp = item.icon;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          onIconChange(item.name);
                          setShowIconPicker(false);
                        }}
                        className="p-2 flex flex-col items-center justify-center gap-1 rounded-xl hover:bg-muted text-foreground transition-transform hover:scale-105"
                        title={item.label}
                      >
                        <IconCmp className="w-4 h-4 text-primary" />
                        <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {readOnly ? (
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {page.title}
              </h1>
            ) : (
              <input
                type="text"
                value={page.title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Untitled Document"
                className="w-full text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/30"
              />
            )}
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Restrictions Padlock Button */}
          {onOpenRestrictions && (() => {
            const restrictionLevel = page.restrictions?.lockType || page.restrictions?.level || 'open';
            const isRestricted = restrictionLevel !== 'open';
            return (
              <button
                type="button"
                onClick={onOpenRestrictions}
                className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isRestricted
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold shadow-2xs'
                    : 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
                title={`Page Access Restrictions: ${restrictionLevel}`}
              >
                {isRestricted ? (
                  <Lock className="w-4 h-4 text-amber-500" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
                <span className="hidden lg:inline capitalize">
                  {restrictionLevel.replace('_', ' ')}
                </span>
              </button>
            );
          })()}

          {/* Full Width / Fixed Width Toggle */}
          {onToggleFullWidth && (
            <button
              type="button"
              onClick={onToggleFullWidth}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors hidden md:flex items-center gap-1.5 ${
                isFullWidth
                  ? 'bg-primary/15 border-primary/40 text-primary font-bold shadow-2xs'
                  : 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title={isFullWidth ? 'Switch to Fixed Width (Centered)' : 'Switch to Full Width (Fluid)'}
            >
              {isFullWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden xl:inline">{isFullWidth ? 'Full width' : 'Fixed width'}</span>
            </button>
          )}

          {/* Watch Toggle */}
          <button
            type="button"
            onClick={() => setIsWatching(!isWatching)}
            className={`p-2 rounded-xl border text-xs font-medium transition-colors hidden lg:flex items-center gap-1.5 ${
              isWatching
                ? 'bg-primary/15 border-primary/40 text-primary font-semibold'
                : 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title={isWatching ? 'Unwatch page' : 'Watch page for updates'}
          >
            {isWatching ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{isWatching ? 'Watching' : 'Watch'}</span>
          </button>

          {/* Favorite Star */}
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`p-2 rounded-xl transition-colors ${
              isFavorite
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title={isFavorite ? 'Remove from Starred' : 'Add to Starred'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={onOpenShare}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Share page"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Comments */}
          <button
            type="button"
            onClick={onOpenComments}
            className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Open Comments Panel"
          >
            <MessageSquare className="w-4 h-4" />
            {commentsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary text-primary-foreground">
                {commentsCount}
              </span>
            )}
          </button>

          {/* History */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Page Version Snapshots & Diff"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={onOpenExport}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors hidden sm:inline-flex"
            title="Export Document"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* More actions dropdown */}
          <PageActionsMenu
            page={page}
            userRole={userRole}
            currentUserId={currentUserId}
            onMoveClick={onOpenMove}
            onDuplicateClick={onDuplicate}
            onExportClick={onOpenExport}
            onHistoryClick={onOpenHistory}
            onDeleteClick={onDelete}
            onCopyLink={onOpenShare}
          />
        </div>
      </div>

      {/* Confluence Metadata Sub-row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Avatar name={page.authorName} avatarUrl={page.authorAvatar} size="sm" />
            <span className="font-semibold text-foreground">{page.authorName}</span>
          </div>

          <span className="text-border">&bull;</span>
          <span>Created {formatDate(page.createdAt)}</span>

          <span className="text-border">&bull;</span>
          <span>Last modified {formatRelativeTime(page.updatedAt)}</span>

          <span className="text-border">&bull;</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-muted text-muted-foreground font-semibold">
            v{page.version || 1}
          </span>
        </div>
      </div>

      {/* Page Reactions Bar */}
      {onToggleReaction && (
        <PageReactions
          pageId={page.id}
          reactions={page.reactions || {}}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onToggleReaction={onToggleReaction}
        />
      )}
    </div>
  );
};
