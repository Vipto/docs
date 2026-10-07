import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useOutletContext } from 'react-router-dom';
import {
  Search,
  FileText,
  Folder,
  Filter,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import { searchDocumentation } from '@/services/searchService';
import { SearchResult, Space } from '@/types';
import { formatRelativeTime, formatDate } from '@/utils/formatters';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { spaces } = useOutletContext<{ spaces: Space[] }>();

  const [queryText, setQueryText] = useState(initialQuery);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'page' | 'space'>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!queryText.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const filter = selectedSpaceId === 'all' ? undefined : selectedSpaceId;
        const found = await searchDocumentation('vipto-workspace', queryText, filter);
        setResults(found);
        setSearchParams({ q: queryText });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [queryText, selectedSpaceId]);

  // Apply Client-Side Facet Filters
  const filteredResults = results.filter((res) => {
    // Type Filter
    if (selectedType !== 'all' && res.type !== selectedType) return false;

    // Date Range Filter
    if (selectedDateRange !== 'all') {
      const itemTime = new Date(res.updatedAt).getTime();
      const now = Date.now();
      const diffHours = (now - itemTime) / (1000 * 60 * 60);

      if (selectedDateRange === '24h' && diffHours > 24) return false;
      if (selectedDateRange === '7d' && diffHours > 24 * 7) return false;
      if (selectedDateRange === '30d' && diffHours > 24 * 30) return false;
    }

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Enterprise Search & Discovery</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Full-text indexing with faceted filters across all spaces, documents, and technical specifications.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search keyword, API endpoint, guide, PRD, or topic..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary shadow-xs"
            autoFocus
          />
        </div>

        {/* Space Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedSpaceId}
            onChange={(e) => setSelectedSpaceId(e.target.value)}
            className="w-full sm:w-48 px-3 py-3 rounded-2xl border border-border bg-card text-foreground text-xs font-medium outline-none focus:ring-2 focus:ring-primary shadow-xs"
          >
            <option value="all">All Spaces</option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.key})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faceted Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border pb-4 text-xs">
        {/* Content Type Filter */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border">
          {(['all', 'page', 'space'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                selectedType === type
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {type === 'all' ? 'All Types' : type === 'page' ? 'Documents' : 'Spaces'}
            </button>
          ))}
        </div>

        {/* Date Modified Filter */}
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Last Modified:</span>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs font-medium outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Any time</option>
            <option value="24h">Past 24 hours</option>
            <option value="7d">Past 7 days</option>
            <option value="30d">Past 30 days</option>
          </select>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isSearching
              ? 'Searching index...'
              : `Found ${filteredResults.length} matching result${filteredResults.length === 1 ? '' : 's'}`}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden shadow-2xs">
          {filteredResults.length === 0 && !isSearching ? (
            <div className="p-16 text-center text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm font-bold text-foreground">No documents matched your search</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Try searching for keywords like "API", "PRD", "Architecture", or reset your facet filters.
              </p>
            </div>
          ) : (
            filteredResults.map((res) => (
              <Link
                key={res.id}
                to={res.type === 'page' ? `/spaces/${res.spaceKey}/${res.id}` : `/spaces/${res.spaceKey}`}
                className="flex items-start justify-between p-5 hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2 rounded-xl bg-background border border-border shrink-0 mt-0.5 group-hover:border-primary/40 group-hover:scale-105 transition-all">
                    {res.type === 'space' ? (
                      <Folder className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {res.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-muted text-muted-foreground font-bold">
                        {res.spaceKey}
                      </span>
                      {res.type === 'space' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                          Space
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-2xl leading-relaxed">
                      {res.snippet}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                  <span className="text-[11px] font-mono">{formatRelativeTime(res.updatedAt)}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

