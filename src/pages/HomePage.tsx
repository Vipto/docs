import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Search,
  Folder,
  Star,
  Clock,
  ArrowRight,
  FileText,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  Edit3,
  Radio,
  FileEdit,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Space, Page } from '@/types';
import { getRecentUpdatedPages, createPage } from '@/services/pageService';
import { getUserFavorites } from '@/services/favoriteService';
import { getUserRecentPages, RecentPageItem } from '@/services/recentService';
import { formatDate, formatRelativeTime } from '@/utils/formatters';
import { Avatar } from '@/components/common/Avatar';
import { DocIcon } from '@/components/common/DocIcon';
import { SpaceIcon } from '@/components/common/SpaceIcon';

type HomeSegment = 'foryou' | 'recent' | 'starred' | 'drafts';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { spaces, refreshSpaces } = useOutletContext<{ spaces: Space[]; refreshSpaces: () => void }>();

  const [activeSegment, setActiveSegment] = useState<HomeSegment>('foryou');
  const [recentUpdates, setRecentUpdates] = useState<Page[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [recentVisits, setRecentVisits] = useState<RecentPageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const updates = await getRecentUpdatedPages('vipto-workspace', 10);
        setRecentUpdates(updates);

        if (user) {
          const favs = await getUserFavorites(user.uid);
          setFavorites(favs);
          const visits = await getUserRecentPages(user.uid, 8);
          setRecentVisits(visits);
        }
      } catch (e) {
        console.warn('Home data load error:', e);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [user]);

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickCreatePage = async (spaceId: string) => {
    const targetSpace = spaces.find((s) => s.id === spaceId) || spaces[0];
    if (!targetSpace) return;

    try {
      const newPage = await createPage({
        workspaceId: 'vipto-workspace',
        spaceId: targetSpace.id,
        title: 'Untitled Document',
        authorId: user?.uid || 'u1',
        authorName: user?.name || 'Ayush Kumar',
      });
      refreshSpaces?.();
      navigate(`/spaces/${targetSpace.key}/${newPage.id}`);
    } catch (e) {
      console.error('Quick create page error:', e);
    }
  };

  const myWorkedOnPages = recentUpdates.filter(
    (p) => p.authorId === user?.uid || p.lastModifiedById === user?.uid
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/30">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-bold border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Vipto Documentation Cloud</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {getTimeOfDayGreeting()}, {user?.name?.split(' ')[0] || 'Team Member'}!
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed max-w-xl">
            Central repository for engineering architecture, product PRDs, sprint wikis, and design guidelines.
          </p>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {spaces.length > 0 && (
              <button
                onClick={() => handleQuickCreatePage(spaces[0].id)}
                className="px-4 py-2 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" /> Create Document
              </button>
            )}

            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                window.dispatchEvent(event);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 backdrop-blur-xs border border-white/10"
            >
              <Search className="w-3.5 h-3.5" /> Search Documentation (Ctrl+K)
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Segmented Home Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border text-xs font-semibold text-muted-foreground pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveSegment('foryou')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors shrink-0 ${
            activeSegment === 'foryou'
              ? 'bg-primary/15 text-primary font-bold shadow-2xs'
              : 'hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>For You</span>
        </button>

        <button
          onClick={() => setActiveSegment('recent')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors shrink-0 ${
            activeSegment === 'recent'
              ? 'bg-primary/15 text-primary font-bold shadow-2xs'
              : 'hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Recent Visits ({recentVisits.length})</span>
        </button>

        <button
          onClick={() => setActiveSegment('starred')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors shrink-0 ${
            activeSegment === 'starred'
              ? 'bg-primary/15 text-primary font-bold shadow-2xs'
              : 'hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Starred ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveSegment('drafts')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors shrink-0 ${
            activeSegment === 'drafts'
              ? 'bg-primary/15 text-primary font-bold shadow-2xs'
              : 'hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>Worked on by you ({myWorkedOnPages.length})</span>
        </button>
      </div>

      {/* Segment 1: For You */}
      {activeSegment === 'foryou' && (
        <div className="space-y-8">
          {/* Continue where you left off */}
          {recentVisits.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>Continue Where You Left Off</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentVisits.slice(0, 3).map((rec) => (
                  <Link
                    key={rec.id}
                    to={`/spaces/${rec.spaceId}/${rec.id}`}
                    className="p-4 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <DocIcon icon={rec.icon} className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatRelativeTime(rec.visitedAt)}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {rec.title}
                      </h4>
                    </div>

                    <div className="pt-2 mt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Jump back in</span>
                      <ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Spaces Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Spaces Directory</h2>
                <p className="text-xs text-muted-foreground">
                  Knowledge hubs organized by squads and functional domains.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {spaces.map((space) => (
                <Link
                  key={space.id}
                  to={`/spaces/${space.key}`}
                  className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        <SpaceIcon icon={space.icon} className="w-5 h-5 text-indigo-500" />
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border">
                        {space.key}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {space.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {space.description || 'Team documentation space'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-border text-[11px] text-muted-foreground">
                    <span>{space.pageCount || 0} pages</span>
                    <span className="text-primary font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recently Modified Documentation Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Recently Modified</h2>
                <p className="text-xs text-muted-foreground">
                  Latest edits and publications across the Vipto workspace.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
              {recentUpdates.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No pages modified recently</p>
                </div>
              ) : (
                recentUpdates.slice(0, 6).map((page) => {
                  const space = spaces.find((s) => s.id === page.spaceId);
                  return (
                    <Link
                      key={page.id}
                      to={`/spaces/${space?.key || page.spaceId}/${page.id}`}
                      className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <DocIcon icon={page.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-foreground group-hover:text-primary truncate">
                              {page.title}
                            </span>
                            {space && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-muted text-muted-foreground">
                                {space.key}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate max-w-md mt-0.5">
                            {page.excerpt || 'No excerpt available'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                        <div className="hidden sm:flex items-center gap-1.5">
                          <Avatar name={page.authorName} avatarUrl={page.authorAvatar} size="sm" />
                          <span className="text-[11px]">{page.authorName}</span>
                        </div>
                        <span className="text-[11px]">{formatRelativeTime(page.updatedAt)}</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Segment 2: Recent Visits */}
      {activeSegment === 'recent' && (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          {recentVisits.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-xs">
              No recent visits recorded yet. Open pages to see them here.
            </div>
          ) : (
            recentVisits.map((rec) => (
              <Link
                key={rec.id}
                to={`/spaces/${rec.spaceId}/${rec.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <DocIcon icon={rec.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-foreground group-hover:text-primary truncate block">
                      {rec.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Space: {rec.spaceId}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Visited {formatRelativeTime(rec.visitedAt)}
                </span>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Segment 3: Starred */}
      {activeSegment === 'starred' && (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          {favorites.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-xs">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-500" />
              <p className="font-semibold text-foreground">No starred pages yet</p>
              <p className="text-[11px] mt-0.5">Click the star icon at the top of any page to pin it here.</p>
            </div>
          ) : (
            favorites.map((fav) => (
              <Link
                key={fav.id}
                to={`/spaces/${fav.spaceId}/${fav.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                    <DocIcon icon={fav.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-foreground group-hover:text-primary truncate block">
                      {fav.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Space: {fav.spaceId}
                    </span>
                  </div>
                </div>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </Link>
            ))
          )}
        </div>
      )}

      {/* Segment 4: Drafts / Worked On */}
      {activeSegment === 'drafts' && (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          {myWorkedOnPages.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-xs">
              No recent documents created or edited by your account.
            </div>
          ) : (
            myWorkedOnPages.map((page) => (
              <Link
                key={page.id}
                to={`/spaces/${page.spaceId}/${page.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <DocIcon icon={page.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-foreground group-hover:text-primary truncate block">
                      {page.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Last modified {formatRelativeTime(page.updatedAt)}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground">
                  v{page.version || 1}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};
