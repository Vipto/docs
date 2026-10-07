import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Folder,
  Plus,
  Moon,
  Sun,
  Settings,
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
  Filter,
  User,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { searchDocumentation } from '@/services/searchService';
import { SearchResult } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { formatRelativeTime } from '@/utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewPageClick?: () => void;
  onNewSpaceClick?: () => void;
  onTemplateClick?: () => void;
}

type SearchFilterFacet = 'all' | 'pages' | 'spaces';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNewPageClick,
  onNewSpaceClick,
  onTemplateClick,
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [queryText, setQueryText] = useState('');
  const [activeFacet, setActiveFacet] = useState<SearchFilterFacet>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('vipto_recent_searches') || '[]');
    } catch (_) {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQueryText('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!queryText.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const found = await searchDocumentation('vipto-workspace', queryText);
        setResults(found);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [queryText]);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentQueries.filter((q) => q !== query)].slice(0, 5);
    setRecentQueries(updated);
    localStorage.setItem('vipto_recent_searches', JSON.stringify(updated));
  };

  // Quick actions when no query is typed
  const quickActions = [
    {
      id: 'action-new-page',
      title: 'Create new document',
      description: 'Add a new page to the workspace',
      icon: <Plus className="w-4 h-4 text-primary" />,
      action: () => {
        onClose();
        onNewPageClick?.();
      },
    },
    {
      id: 'action-new-space',
      title: 'Create new space',
      description: 'Create a team knowledge repository',
      icon: <Folder className="w-4 h-4 text-emerald-500" />,
      action: () => {
        onClose();
        onNewSpaceClick?.();
      },
    },
    {
      id: 'action-templates',
      title: 'Browse page templates',
      description: 'PRDs, RFCs, Meeting Notes, Postmortems',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      action: () => {
        onClose();
        onTemplateClick?.();
      },
    },
    {
      id: 'action-theme',
      title: `Toggle theme (${theme === 'dark' ? 'Light mode' : 'Dark mode'})`,
      description: 'Switch between dark and light themes',
      icon: theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />,
      action: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      id: 'action-settings',
      title: 'Workspace settings & members',
      description: 'Manage permissions, roles, and integrations',
      icon: <Settings className="w-4 h-4 text-muted-foreground" />,
      action: () => {
        onClose();
        navigate('/settings');
      },
    },
  ];

  const filteredResults = results.filter((r) => {
    if (activeFacet === 'pages') return r.type === 'page';
    if (activeFacet === 'spaces') return r.type === 'space';
    return true;
  });

  const totalItemsCount = queryText.trim() ? filteredResults.length : quickActions.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalItemsCount));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItemsCount) % Math.max(1, totalItemsCount));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (queryText.trim()) {
        const item = filteredResults[selectedIndex];
        if (item) {
          saveRecentSearch(queryText.trim());
          onClose();
          if (item.type === 'page') {
            navigate(`/spaces/${item.spaceKey}/${item.id}`);
          } else {
            navigate(`/spaces/${item.spaceKey}`);
          }
        }
      } else {
        const action = quickActions[selectedIndex];
        if (action) action.action();
      }
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-primary/20 text-primary font-bold rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <div className="-m-5">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={queryText}
            onChange={(e) => {
              setQueryText(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, spaces, or run workspace commands..."
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm font-medium"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-muted-foreground bg-muted rounded-md border border-border">
            ESC
          </kbd>
        </div>

        {/* Facet Filters */}
        {queryText.trim() && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/20 text-xs">
            <span className="text-muted-foreground text-[11px] font-medium">Filter:</span>
            <button
              onClick={() => setActiveFacet('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                activeFacet === 'all'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({results.length})
            </button>
            <button
              onClick={() => setActiveFacet('pages')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                activeFacet === 'pages'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pages ({results.filter((r) => r.type === 'page').length})
            </button>
            <button
              onClick={() => setActiveFacet('spaces')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                activeFacet === 'spaces'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Spaces ({results.filter((r) => r.type === 'space').length})
            </button>
          </div>
        )}

        {/* Search Results / Quick Actions */}
        <div className="max-h-[440px] overflow-y-auto p-2">
          {queryText.trim() ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {isSearching ? 'Searching Workspace...' : `Search Results (${filteredResults.length})`}
              </div>
              {filteredResults.length === 0 && !isSearching ? (
                <div className="p-12 text-center text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold text-foreground">No documents found for "{queryText}"</p>
                  <p className="text-xs text-muted-foreground mt-1">Try another search keyword or create a new page.</p>
                </div>
              ) : (
                filteredResults.map((res, index) => (
                  <div
                    key={res.id}
                    onClick={() => {
                      saveRecentSearch(queryText.trim());
                      onClose();
                      if (res.type === 'page') {
                        navigate(`/spaces/${res.spaceKey}/${res.id}`);
                      } else {
                        navigate(`/spaces/${res.spaceKey}`);
                      }
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-start gap-3.5 p-3 rounded-2xl cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-primary/15' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-background border border-border shrink-0 mt-0.5 shadow-2xs">
                      {res.type === 'space' ? (
                        <Folder className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-foreground truncate">
                          {highlightMatch(res.title, queryText)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono text-muted-foreground font-semibold shrink-0">
                          {res.spaceKey}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">
                        {highlightMatch(res.snippet, queryText)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Recent Searches Chips */}
              {recentQueries.length > 0 && (
                <div className="px-3 pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" /> Recent Searches:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentQueries.map((q) => (
                      <button
                        key={q}
                        onClick={() => setQueryText(q)}
                        className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-foreground text-xs font-medium transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Quick Actions & Navigation
                </div>
                {quickActions.map((action, index) => (
                  <div
                    key={action.id}
                    onClick={action.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-primary/15' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-background border border-border shrink-0 shadow-2xs">
                        {action.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">{action.title}</div>
                        <div className="text-[11px] text-muted-foreground">{action.description}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-50" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/30 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Navigate <kbd className="font-mono bg-background border border-border px-1.5 py-0.5 rounded">↑</kbd> <kbd className="font-mono bg-background border border-border px-1.5 py-0.5 rounded">↓</kbd></span>
            <span>Select <kbd className="font-mono bg-background border border-border px-1.5 py-0.5 rounded">↵</kbd></span>
          </div>
          <span>Vipto Docs Global Search</span>
        </div>
      </div>
    </Modal>
  );
};
