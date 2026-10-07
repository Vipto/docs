import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Folder,
  Plus,
  Settings,
  FileText,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  Users,
  Eye,
  EyeOff,
  Layers,
  BookOpen,
  Radio,
  ExternalLink,
  Share2,
  Trash2,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { Space, Page } from '@/types';
import { getSpaceByKey, getSpace } from '@/services/spaceService';
import { getPagesBySpace, createPage, duplicatePage, deletePage } from '@/services/pageService';
import { PageTree } from '@/components/pages/PageTree';
import { SpaceSettingsModal } from '@/components/spaces/SpaceSettingsModal';
import { MovePageModal } from '@/components/pages/MovePageModal';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatRelativeTime } from '@/utils/formatters';
import { canManageSpace, canCreatePage } from '@/permissions/roles';
import { DocIcon } from '@/components/common/DocIcon';
import { SpaceIcon } from '@/components/common/SpaceIcon';

type SpaceTab = 'overview' | 'pages' | 'livedocs' | 'blog' | 'shortcuts';

export const SpaceDetailPage: React.FC = () => {
  const { spaceKey } = useParams<{ spaceKey: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { spaces, refreshSpaces } = useOutletContext<{ spaces: Space[]; refreshSpaces: () => void }>();

  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [activeTab, setActiveTab] = useState<SpaceTab>('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [moveModalPage, setMoveModalPage] = useState<Page | null>(null);

  // Custom shortcuts state
  const [shortcuts, setShortcuts] = useState<Array<{ id: string; title: string; url: string }>>(() => {
    return [
      { id: '1', title: 'GitHub Repository', url: 'https://github.com/vipto' },
      { id: '2', title: 'Figma Design System', url: 'https://figma.com/@vipto' },
      { id: '3', title: 'API Documentation', url: 'https://api.vipto.io' },
    ];
  });

  const fetchSpaceData = async () => {
    if (!spaceKey) return;
    setLoading(true);
    try {
      let foundSpace = await getSpaceByKey('vipto-workspace', spaceKey);
      if (!foundSpace) {
        foundSpace = await getSpace(spaceKey);
      }
      setCurrentSpace(foundSpace);

      if (foundSpace) {
        const spacePages = await getPagesBySpace(foundSpace.id);
        setPages(spacePages);
      }
    } catch (e) {
      console.warn('Error fetching space data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaceData();
  }, [spaceKey]);

  const handleCreatePage = async (parentId?: string | null) => {
    if (!currentSpace || !user) return;
    try {
      const created = await createPage({
        workspaceId: currentSpace.workspaceId,
        spaceId: currentSpace.id,
        parentId: parentId || null,
        title: 'Untitled Document',
        authorId: user.uid,
        authorName: user.name,
      });
      refreshSpaces?.();
      navigate(`/spaces/${currentSpace.key}/${created.id}`);
    } catch (e) {
      console.error('Failed to create page:', e);
    }
  };

  const handleDuplicatePage = async (pageId: string) => {
    if (!user || !currentSpace) return;
    try {
      const duplicated = await duplicatePage(pageId, user.uid, user.name);
      fetchSpaceData();
      refreshSpaces?.();
      navigate(`/spaces/${currentSpace.key}/${duplicated.id}`);
    } catch (e) {
      console.error('Duplicate error:', e);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    try {
      await deletePage(pageId, user.uid, user.name);
      fetchSpaceData();
      refreshSpaces?.();
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-36 bg-muted/60 rounded-2xl" />
        <div className="h-10 bg-muted/40 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-muted/50 rounded-2xl" />
          <div className="h-64 bg-muted/50 rounded-2xl md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!currentSpace) {
    return (
      <div className="p-16 text-center text-muted-foreground">
        <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <h2 className="text-xl font-bold text-foreground">Space Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1">The space "{spaceKey}" could not be found.</p>
        <Link to="/" className="mt-4 inline-block text-xs text-primary font-semibold hover:underline">
          Return to Workspace Home
        </Link>
      </div>
    );
  }

  const isSpaceOwner = currentSpace.ownerId === user?.uid;
  const userRole = user?.role || 'Viewer';

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(pageSearchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Space Hero Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shrink-0">
              <SpaceIcon icon={currentSpace.icon} className="w-8 h-8 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight truncate">
                  {currentSpace.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-muted text-muted-foreground border border-border shrink-0">
                  {currentSpace.key}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl line-clamp-2">
                {currentSpace.description || 'Central documentation repository for this team.'}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isFollowing
                  ? 'bg-primary/15 border-primary/40 text-primary font-semibold'
                  : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title={isFollowing ? 'Unwatch Space' : 'Watch Space for updates'}
            >
              {isFollowing ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{isFollowing ? 'Watching' : 'Watch Space'}</span>
            </button>

            {canCreatePage(userRole) && (
              <button
                type="button"
                onClick={() => handleCreatePage(null)}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> New Page
              </button>
            )}

            {canManageSpace(userRole, isSpaceOwner) && (
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Space Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confluence-style Space Sub-Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-border text-xs font-semibold text-muted-foreground overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
            activeTab === 'overview'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent hover:text-foreground hover:border-border'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
            activeTab === 'pages'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent hover:text-foreground hover:border-border'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Pages ({pages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('livedocs')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
            activeTab === 'livedocs'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent hover:text-foreground hover:border-border'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-500" />
          <span>Live Docs</span>
        </button>

        <button
          onClick={() => setActiveTab('blog')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
            activeTab === 'blog'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent hover:text-foreground hover:border-border'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Blog / Updates</span>
        </button>

        <button
          onClick={() => setActiveTab('shortcuts')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
            activeTab === 'shortcuts'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent hover:text-foreground hover:border-border'
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          <span>Shortcuts ({shortcuts.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Space Page Tree */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Document Hierarchy
              </span>
              <span className="text-[11px] text-muted-foreground">{pages.length} docs</span>
            </div>
            <PageTree
              pages={pages}
              spaceKey={currentSpace.key}
              userRole={userRole}
              onAddPage={handleCreatePage}
              onDuplicatePage={handleDuplicatePage}
              onDeletePage={handleDeletePage}
              onMovePage={(p) => setMoveModalPage(p)}
            />
          </div>

          {/* Overview Right Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Documents in this space */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Featured Documents in {currentSpace.name}</span>
                </h3>
              </div>

              {pages.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No pages created in this space yet</p>
                  {canCreatePage(userRole) && (
                    <button
                      onClick={() => handleCreatePage(null)}
                      className="mt-2 text-xs text-primary font-semibold hover:underline"
                    >
                      + Create the first page
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {pages.slice(0, 8).map((p) => (
                    <Link
                      key={p.id}
                      to={`/spaces/${currentSpace.key}/${p.id}`}
                      className="flex items-center justify-between py-3 hover:bg-muted/40 px-2.5 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <DocIcon icon={p.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-xs text-foreground group-hover:text-primary truncate block">
                            {p.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate block mt-0.5">
                            {p.excerpt || 'No summary'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
                        <span>{formatRelativeTime(p.updatedAt)}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pages Grid & Search */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search pages in this space..."
                value={pageSearchQuery}
                onChange={(e) => setPageSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {canCreatePage(userRole) && (
              <button
                type="button"
                onClick={() => handleCreatePage(null)}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Create Page
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPages.map((p) => (
              <Link
                key={p.id}
                to={`/spaces/${currentSpace.key}/${p.id}`}
                className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <DocIcon icon={p.icon} className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      v{p.version || 1}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {p.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {p.excerpt || 'No description available for this document.'}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Modified {formatRelativeTime(p.updatedAt)}</span>
                  <span className="text-primary font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Live Docs */}
      {activeTab === 'livedocs' && (
        <div className="p-8 rounded-2xl border border-border bg-card text-center space-y-3">
          <Radio className="w-10 h-10 mx-auto text-emerald-500 animate-pulse" />
          <h3 className="text-base font-bold text-foreground">Collaborative Live Docs</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Live docs enable real-time multiplayer editing, whiteboarding, and sprint brainstorming directly within the {currentSpace.name} space.
          </p>
          <button
            onClick={() => handleCreatePage(null)}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Start New Live Doc
          </button>
        </div>
      )}

      {/* Tab 4: Blog / Updates */}
      {activeTab === 'blog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Recent Space Announcements & Changelogs</h3>
          </div>
          <div className="space-y-3">
            {pages.slice(0, 4).map((p, idx) => (
              <div key={p.id} className="p-5 rounded-2xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{p.authorName}</span>
                  <span>{formatDate(p.updatedAt)}</span>
                </div>
                <h4 className="font-bold text-sm text-foreground">{p.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.excerpt || 'Published an update to this documentation page.'}</p>
                <div className="pt-2">
                  <Link to={`/spaces/${currentSpace.key}/${p.id}`} className="text-xs text-primary font-semibold hover:underline">
                    View full update &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Shortcuts */}
      {activeTab === 'shortcuts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Pinned External Shortcuts</h3>
            <button
              onClick={() => {
                const title = window.prompt('Shortcut Title:');
                const url = window.prompt('Shortcut URL:');
                if (title && url) {
                  setShortcuts((prev) => [...prev, { id: String(Date.now()), title, url }]);
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Shortcut
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {shortcuts.map((sc) => (
              <a
                key={sc.id}
                href={sc.url}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-foreground group-hover:text-primary truncate block">
                      {sc.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate block">
                      {sc.url}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Space Settings Modal */}
      <SpaceSettingsModal
        space={currentSpace}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSpaceUpdated={(updated) => {
          setCurrentSpace(updated);
          refreshSpaces?.();
        }}
        onSpaceDeleted={() => {
          refreshSpaces?.();
          navigate('/');
        }}
      />

      {/* Move Page Modal */}
      <MovePageModal
        page={moveModalPage}
        spaces={spaces}
        allPages={pages}
        isOpen={!!moveModalPage}
        onClose={() => setMoveModalPage(null)}
        onPageMoved={() => {
          fetchSpaceData();
          refreshSpaces?.();
        }}
      />
    </div>
  );
};
