import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Star,
  Clock,
  Folder,
  Plus,
  ChevronRight,
  ChevronDown,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Search,
  FileText,
} from 'lucide-react';
import { Space, Page } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { getUserFavorites } from '@/services/favoriteService';
import { getUserRecentPages, RecentPageItem } from '@/services/recentService';
import { getAllPages, createPage } from '@/services/pageService';
import { canCreateSpace, canCreatePage } from '@/permissions/roles';
import { DocIcon } from '@/components/common/DocIcon';
import { SpaceIcon } from '@/components/common/SpaceIcon';
import { SidebarPageTreeItem } from './SidebarPageTreeItem';

interface SidebarProps {
  spaces: Space[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewSpaceClick: () => void;
  onTemplateClick: () => void;
  onOpenSearch?: () => void;
}

interface SidebarSectionConfig {
  id: 'starred' | 'recents' | 'spaces';
  label: string;
  enabled: boolean;
  order: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  spaces,
  isCollapsed,
  onToggleCollapse,
  onNewSpaceClick,
  onTemplateClick,
  onOpenSearch,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('vipto_sidebar_width');
    return saved ? Math.max(240, Math.min(480, parseInt(saved, 10))) : 280;
  });
  const [isResizing, setIsResizing] = useState(false);

  const [allPages, setAllPages] = useState<Page[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [recents, setRecents] = useState<RecentPageItem[]>([]);
  const [starredOpen, setStarredOpen] = useState(true);
  const [recentsOpen, setRecentsOpen] = useState(true);
  const [spacesOpen, setSpacesOpen] = useState(true);
  const [spaceFilter, setSpaceFilter] = useState('');
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // Expand / collapse state for spaces and pages
  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>(() => {
    // Default all spaces to expanded for quick access
    const initial: Record<string, boolean> = {};
    spaces.forEach((s) => {
      initial[s.id] = true;
    });
    return initial;
  });

  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});

  // Inline page creation state
  const [creatingState, setCreatingState] = useState<{ spaceId: string; parentId: string | null } | null>(null);
  const [spaceRootInlineTitle, setSpaceRootInlineTitle] = useState('');
  const [isCreatingRootPage, setIsCreatingRootPage] = useState(false);
  const rootInputRef = useRef<HTMLInputElement>(null);

  const [sectionsConfig, setSectionsConfig] = useState<SidebarSectionConfig[]>(() => {
    const saved = localStorage.getItem('vipto_sidebar_sections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [
      { id: 'starred', label: 'Starred Pages', enabled: true, order: 0 },
      { id: 'recents', label: 'Recent Documents', enabled: true, order: 1 },
      { id: 'spaces', label: 'Spaces Directory', enabled: true, order: 2 },
    ];
  });

  // Extract active page ID from URL: /spaces/:spaceKey/:pageId
  const pathParts = location.pathname.split('/');
  const activeSpaceKey = pathParts[1] === 'spaces' ? pathParts[2] : undefined;
  const activePageId = pathParts[1] === 'spaces' && pathParts[3] ? pathParts[3] : undefined;

  const loadAllData = async () => {
    if (!user) return;
    try {
      const [favs, rec, pages] = await Promise.all([
        getUserFavorites(user.uid),
        getUserRecentPages(user.uid, 6),
        getAllPages(),
      ]);
      setFavorites(favs);
      setRecents(rec);
      setAllPages(pages);

      // Auto-expand current space and parent pages
      if (activePageId && pages.length > 0) {
        const currentPage = pages.find((p) => p.id === activePageId);
        if (currentPage) {
          setExpandedSpaces((prev) => ({ ...prev, [currentPage.spaceId]: true }));

          // Expand all ancestors
          let parentId = currentPage.parentId;
          const ancestors: Record<string, boolean> = {};
          while (parentId) {
            ancestors[parentId] = true;
            const parent = pages.find((p) => p.id === parentId);
            parentId = parent ? parent.parentId : null;
          }
          if (Object.keys(ancestors).length > 0) {
            setExpandedPages((prev) => ({ ...prev, ...ancestors }));
          }
        }
      }
    } catch (e) {
      console.warn('Sidebar data load error:', e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user?.uid, location.pathname, spaces.length]);

  // Handle Drag Resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(240, Math.min(480, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        localStorage.setItem('vipto_sidebar_width', String(sidebarWidth));
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  // Focus root inline input when creating root page in space
  useEffect(() => {
    if (creatingState && creatingState.parentId === null) {
      setSpaceRootInlineTitle('');
      setTimeout(() => {
        rootInputRef.current?.focus();
      }, 50);
    }
  }, [creatingState]);

  const toggleSectionEnabled = (sectionId: string) => {
    setSectionsConfig((prev) => {
      const updated = prev.map((s) => (s.id === sectionId ? { ...s, enabled: !s.enabled } : s));
      localStorage.setItem('vipto_sidebar_sections', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleSpaceExpand = (spaceId: string) => {
    setExpandedSpaces((prev) => ({
      ...prev,
      [spaceId]: !prev[spaceId],
    }));
  };

  const togglePageExpand = (pageId: string) => {
    setExpandedPages((prev) => ({
      ...prev,
      [pageId]: !prev[pageId],
    }));
  };

  const handleStartCreate = (spaceId: string, parentId: string | null) => {
    setExpandedSpaces((prev) => ({ ...prev, [spaceId]: true }));
    if (parentId) {
      setExpandedPages((prev) => ({ ...prev, [parentId]: true }));
    }
    setCreatingState({ spaceId, parentId });
  };

  const handleCancelCreate = () => {
    setCreatingState(null);
    setSpaceRootInlineTitle('');
  };

  const handleCreatePageSubmit = async (title: string, spaceId: string, parentId: string | null) => {
    if (!user) return;
    const targetSpace = spaces.find((s) => s.id === spaceId);
    if (!targetSpace) return;

    try {
      const created = await createPage({
        workspaceId: targetSpace.workspaceId || 'vipto-workspace',
        spaceId: targetSpace.id,
        parentId: parentId || null,
        title: title || 'Untitled Document',
        authorId: user.uid,
        authorName: user.name,
      });

      // Update local pages list immediately
      setAllPages((prev) => [...prev, created]);
      setCreatingState(null);
      setSpaceRootInlineTitle('');

      // Auto expand parent
      if (parentId) {
        setExpandedPages((prev) => ({ ...prev, [parentId]: true }));
      }
      setExpandedSpaces((prev) => ({ ...prev, [spaceId]: true }));

      // Navigate to new page with focus=editor for immediate typing
      navigate(`/spaces/${targetSpace.key}/${created.id}?focus=editor`);
    } catch (e) {
      console.error('Failed to create page inline:', e);
    }
  };

  const handleRootInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, spaceId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isCreatingRootPage) return;
      setIsCreatingRootPage(true);
      const titleToUse = spaceRootInlineTitle.trim() || 'Untitled Document';
      await handleCreatePageSubmit(titleToUse, spaceId, null);
      setIsCreatingRootPage(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelCreate();
    }
  };

  const handleRootInputBlur = async (spaceId: string) => {
    setTimeout(async () => {
      if (creatingState?.spaceId === spaceId && creatingState?.parentId === null && !isCreatingRootPage) {
        if (spaceRootInlineTitle.trim().length > 0) {
          setIsCreatingRootPage(true);
          await handleCreatePageSubmit(spaceRootInlineTitle.trim(), spaceId, null);
          setIsCreatingRootPage(false);
        } else {
          handleCancelCreate();
        }
      }
    }, 150);
  };

  const filteredSpaces = spaces.filter(
    (s) =>
      s.name.toLowerCase().includes(spaceFilter.toLowerCase()) ||
      s.key.toLowerCase().includes(spaceFilter.toLowerCase())
  );

  // Collapsed Sidebar View (Minimal icon bar)
  if (isCollapsed) {
    return (
      <aside className="w-14 border-r border-border bg-card/80 flex flex-col items-center py-4 space-y-4 shrink-0 hidden md:flex transition-all">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Expand Sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>

        <div className="w-8 h-px bg-border my-1" />

        <Link
          to="/"
          className={`p-2 rounded-xl transition-colors ${
            location.pathname === '/' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
          title="Home / For You"
        >
          <Home className="w-4 h-4" />
        </Link>

        <button
          onClick={onTemplateClick}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Templates Browser"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
        </button>

        <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto py-2 w-full">
          {spaces.map((s) => (
            <Link
              key={s.id}
              to={`/spaces/${s.key}`}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs transition-transform hover:scale-105 ${
                location.pathname.includes(`/spaces/${s.key}`)
                  ? 'bg-primary/20 ring-2 ring-primary text-primary font-bold'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground'
              }`}
              title={`${s.name} (${s.key})`}
            >
              <SpaceIcon icon={s.icon} className="w-4 h-4" />
            </Link>
          ))}
        </div>

        <Link
          to="/settings"
          className={`p-2 rounded-xl transition-colors ${
            location.pathname.startsWith('/settings') ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
          title="Workspace Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </aside>
    );
  }

  const isSectionEnabled = (id: string) => sectionsConfig.find((s) => s.id === id)?.enabled ?? true;

  return (
    <aside
      style={{ width: `${sidebarWidth}px` }}
      className="relative border-r border-border bg-card/75 backdrop-blur-md flex flex-col h-[calc(100vh-3.5rem)] shrink-0 select-none transition-width duration-75"
    >
      {/* Workspace Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-border/80">
        <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
          <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary font-black text-xs flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform shadow-2xs">
            V
          </div>
          <div className="truncate min-w-0">
            <span className="font-bold text-xs text-foreground block truncate">Vipto Workspace</span>
            <span className="text-[10px] text-muted-foreground block truncate">Documentation Cloud</span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowCustomizeModal(!showCustomizeModal)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted hidden sm:block transition-colors"
            title="Customize Sidebar"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted hidden md:block transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customize Sidebar Popover */}
      {showCustomizeModal && (
        <div className="mx-3 mt-2 p-3 rounded-xl border border-border bg-popover shadow-xl text-xs space-y-2 z-30 animate-in fade-in zoom-in-95">
          <div className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Customize Navigation</span>
            <button
              onClick={() => setShowCustomizeModal(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              &times;
            </button>
          </div>
          <div className="space-y-1.5 pt-1">
            {sectionsConfig.map((sec) => (
              <label key={sec.id} className="flex items-center justify-between p-1 rounded hover:bg-muted cursor-pointer">
                <span className="text-foreground">{sec.label}</span>
                <input
                  type="checkbox"
                  checked={sec.enabled}
                  onChange={() => toggleSectionEnabled(sec.id)}
                  className="rounded accent-primary"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {/* Core Primary Navigation Links */}
        <div className="space-y-0.5">
          <Link
            to="/"
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Home className="w-4 h-4 text-primary" />
            <span>Home</span>
          </Link>

          <button
            onClick={onTemplateClick}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 text-left transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Templates</span>
          </button>
        </div>

        {/* Starred Pages Section */}
        {isSectionEnabled('starred') && favorites.length > 0 && (
          <div className="space-y-1">
            <button
              onClick={() => setStarredOpen(!starredOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Starred ({favorites.length})</span>
              </div>
              {starredOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {starredOpen && (
              <div className="space-y-0.5 pl-2">
                {favorites.map((fav) => (
                  <Link
                    key={fav.id}
                    to={`/spaces/${fav.spaceId}/${fav.id}`}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors truncate ${
                      location.pathname.includes(fav.id)
                        ? 'bg-primary/15 text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <DocIcon icon={fav.icon} className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{fav.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Pages Section */}
        {isSectionEnabled('recents') && recents.length > 0 && (
          <div className="space-y-1">
            <button
              onClick={() => setRecentsOpen(!recentsOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Recent ({recents.length})</span>
              </div>
              {recentsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {recentsOpen && (
              <div className="space-y-0.5 pl-2">
                {recents.map((rec) => (
                  <Link
                    key={rec.id}
                    to={`/spaces/${rec.spaceId}/${rec.id}`}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors truncate ${
                      location.pathname.includes(rec.id)
                        ? 'bg-primary/15 text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <DocIcon icon={rec.icon} className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{rec.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Spaces Directory & Hierarchical Page Tree */}
        {isSectionEnabled('spaces') && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2 py-1">
              <button
                onClick={() => setSpacesOpen(!spacesOpen)}
                className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <Folder className="w-3.5 h-3.5 text-indigo-500" />
                <span>Spaces ({spaces.length})</span>
              </button>

              {canCreateSpace(user?.role || 'Viewer') && (
                <button
                  type="button"
                  onClick={onNewSpaceClick}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Create Space"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {spacesOpen && (
              <div className="space-y-1">
                {/* Optional quick space filter */}
                {spaces.length > 5 && (
                  <div className="px-1 mb-1.5">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/40 border border-border text-[11px]">
                      <Search className="w-3 h-3 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Filter spaces..."
                        value={spaceFilter}
                        onChange={(e) => setSpaceFilter(e.target.value)}
                        className="bg-transparent border-none outline-none text-foreground w-full placeholder:text-muted-foreground text-[11px]"
                      />
                    </div>
                  </div>
                )}

                {/* Spaces List with Nested Page Trees */}
                <div className="space-y-1">
                  {filteredSpaces.map((space) => {
                    const isSpaceActive = activeSpaceKey === space.key || activeSpaceKey === space.id;
                    const isSpaceExpanded = !!expandedSpaces[space.id];
                    const rootPages = allPages
                      .filter((p) => p.spaceId === space.id && !p.parentId)
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                    const isCreatingRoot =
                      creatingState?.spaceId === space.id && creatingState?.parentId === null;

                    return (
                      <div key={space.id} className="flex flex-col">
                        {/* Space Header Row */}
                        <div
                          className={`group flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            isSpaceActive && !activePageId
                              ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            {/* Chevron Toggle Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSpaceExpand(space.id);
                              }}
                              className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                              title={isSpaceExpanded ? 'Collapse space' : 'Expand space'}
                            >
                              {isSpaceExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Space Link */}
                            <Link
                              to={`/spaces/${space.key}`}
                              onClick={() => {
                                if (!isSpaceExpanded) {
                                  toggleSpaceExpand(space.id);
                                }
                              }}
                              className="flex items-center gap-2 min-w-0 flex-1 truncate"
                              title={`${space.name} (${space.key})`}
                            >
                              <SpaceIcon icon={space.icon} className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                              <span className="truncate font-semibold">{space.name}</span>
                            </Link>
                          </div>

                          {/* Right side: Space key badge + on-hover '+' create root page button */}
                          <div className="flex items-center gap-1 shrink-0">
                            {canCreatePage(user?.role || 'Viewer') && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleStartCreate(space.id, null);
                                }}
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                                title={`Create new document in ${space.name}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <span className="text-[10px] font-mono text-muted-foreground/80 px-1.5 py-0.2 rounded bg-muted/60 shrink-0">
                              {space.key}
                            </span>
                          </div>
                        </div>

                        {/* Space Children (Hierarchical Page Tree & Inline Root Input) */}
                        {isSpaceExpanded && (
                          <div className="flex flex-col space-y-0.5 mt-0.5 pl-2 border-l border-border/50 ml-3">
                            {/* Inline Input for New Root Page in this Space */}
                            {isCreatingRoot && (
                              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/20 my-0.5 animate-in fade-in zoom-in-95">
                                <FileText className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
                                <input
                                  ref={rootInputRef}
                                  type="text"
                                  value={spaceRootInlineTitle}
                                  onChange={(e) => setSpaceRootInlineTitle(e.target.value)}
                                  onKeyDown={(e) => handleRootInputKeyDown(e, space.id)}
                                  onBlur={() => handleRootInputBlur(space.id)}
                                  disabled={isCreatingRootPage}
                                  placeholder="Page title... (Press Enter)"
                                  className="w-full text-xs font-medium text-foreground bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/60"
                                />
                              </div>
                            )}

                            {/* Root Pages of Space */}
                            {rootPages.map((page) => (
                              <SidebarPageTreeItem
                                key={page.id}
                                page={page}
                                allPages={allPages}
                                spaceKey={space.key}
                                activePageId={activePageId}
                                level={0}
                                expandedPages={expandedPages}
                                onToggleExpand={togglePageExpand}
                                creatingState={creatingState}
                                onStartCreate={handleStartCreate}
                                onSubmitCreate={handleCreatePageSubmit}
                                onCancelCreate={handleCancelCreate}
                              />
                            ))}

                            {rootPages.length === 0 && !isCreatingRoot && (
                              <div className="py-1 px-2.5 text-[11px] text-muted-foreground/60 italic">
                                No pages yet
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Workspace Settings & Shortcuts */}
      <div className="p-3 border-t border-border/80 bg-muted/20">
        <Link
          to="/settings"
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            location.pathname.startsWith('/settings')
              ? 'bg-primary/15 text-primary font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span>Workspace Settings</span>
        </Link>
      </div>

      {/* Resizer Handle */}
      <div
        onMouseDown={() => setIsResizing(true)}
        className={`sidebar-resizer ${isResizing ? 'is-resizing' : ''}`}
        title="Drag to resize sidebar"
      />
    </aside>
  );
};
