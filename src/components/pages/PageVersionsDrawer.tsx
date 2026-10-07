import React, { useEffect, useState } from 'react';
import { X, History, RotateCcw, Eye, ArrowLeft, GitCompare, Plus, Minus, Check } from 'lucide-react';
import { Page, PageVersion } from '@/types';
import { getPageHistory, restorePageVersion } from '@/services/historyService';
import { formatDate, extractTextFromHtml, formatRelativeTime } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/common/Avatar';

interface PageVersionsDrawerProps {
  page: Page | null;
  isOpen: boolean;
  onClose: () => void;
  onVersionRestored: () => void;
}

interface DiffChunk {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

function computeSimpleDiff(oldText: string, newText: string): DiffChunk[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const chunks: DiffChunk[] = [];

  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length) {
      if (oldLines[i] === newLines[j]) {
        chunks.push({ type: 'unchanged', text: oldLines[i] });
        i++;
        j++;
      } else {
        chunks.push({ type: 'removed', text: oldLines[i] });
        chunks.push({ type: 'added', text: newLines[j] });
        i++;
        j++;
      }
    } else if (i < oldLines.length) {
      chunks.push({ type: 'removed', text: oldLines[i] });
      i++;
    } else if (j < newLines.length) {
      chunks.push({ type: 'added', text: newLines[j] });
      j++;
    }
  }

  return chunks;
}

export const PageVersionsDrawer: React.FC<PageVersionsDrawerProps> = ({
  page,
  isOpen,
  onClose,
  onVersionRestored,
}) => {
  const { user } = useAuth();
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<PageVersion | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (page && isOpen) {
      setLoading(true);
      setSelectedVersion(null);
      setCompareMode(false);
      getPageHistory(page.id)
        .then((items) => {
          setVersions(items);
          if (items.length > 0) setSelectedVersion(items[0]);
        })
        .finally(() => setLoading(false));
    }
  }, [page, isOpen]);

  if (!isOpen || !page) return null;

  const handleRestore = async (version: PageVersion) => {
    if (!user) return;
    const ok = window.confirm(
      `Restore Version ${version.versionNumber}? Your current changes will be preserved in a new revision.`
    );
    if (!ok) return;

    setIsRestoring(true);
    try {
      await restorePageVersion(page.id, version, user.uid, user.name);
      onVersionRestored();
      onClose();
    } catch (e) {
      console.error('Restore version error:', e);
    } finally {
      setIsRestoring(false);
    }
  };

  const oldText = selectedVersion ? extractTextFromHtml(selectedVersion.content) : '';
  const currentText = extractTextFromHtml(page.content);
  const diffChunks = computeSimpleDiff(oldText, currentText);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-3xl bg-card border-l border-border h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground">Version History & Diff</h3>
              <p className="text-xs text-muted-foreground truncate">{page.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Close Drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area: Split List and Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Version List Sidebar */}
          <div className="w-72 border-r border-border overflow-y-auto divide-y divide-border bg-card shrink-0">
            <div className="p-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
              Revision Snapshots ({versions.length})
            </div>

            {loading ? (
              <div className="p-4 space-y-3">
                <div className="h-12 bg-muted/60 rounded-xl animate-pulse" />
                <div className="h-12 bg-muted/60 rounded-xl animate-pulse" />
                <div className="h-12 bg-muted/60 rounded-xl animate-pulse" />
              </div>
            ) : versions.length === 0 ? (
              <div className="p-6 text-xs text-muted-foreground text-center">
                No previous version history recorded yet. Edits will generate snapshots here.
              </div>
            ) : (
              versions.map((ver) => {
                const isSelected = selectedVersion?.id === ver.id;
                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/15 border-l-4 border-primary'
                        : 'hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">
                        Version {ver.versionNumber}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(ver.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <Avatar name={ver.authorName} avatarUrl={ver.authorAvatar} size="sm" className="w-5 h-5 text-[9px]" />
                      <span className="truncate font-medium text-[11px] text-foreground">{ver.authorName}</span>
                    </div>
                    {ver.changeSummary && (
                      <p className="text-[11px] text-muted-foreground/80 mt-1 italic truncate">
                        "{ver.changeSummary}"
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Preview / Diff Snapshot Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
            {selectedVersion ? (
              <>
                <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card">
                  <div>
                    <span className="text-xs font-bold text-foreground">
                      Version {selectedVersion.versionNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Saved {formatDate(selectedVersion.createdAt)} by {selectedVersion.authorName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCompareMode(!compareMode)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        compareMode
                          ? 'bg-primary text-primary-foreground shadow-2xs'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      {compareMode ? 'Show Full Render' : 'Visual Diff'}
                    </button>
                    <button
                      type="button"
                      disabled={isRestoring}
                      onClick={() => handleRestore(selectedVersion)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {compareMode ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground flex items-center justify-between">
                        <span>
                          Comparing <strong>Version {selectedVersion.versionNumber}</strong> vs <strong>Live Current Version</strong>
                        </span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            <Plus className="w-3 h-3" /> Added
                          </span>
                          <span className="flex items-center gap-1 text-rose-600 font-semibold">
                            <Minus className="w-3 h-3" /> Removed
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-card p-4 font-mono text-xs space-y-1 overflow-x-auto leading-relaxed">
                        {diffChunks.map((chunk, idx) => {
                          if (chunk.type === 'added') {
                            return (
                              <div key={idx} className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded flex items-start gap-2">
                                <span className="text-emerald-500 font-bold select-none">+</span>
                                <span>{chunk.text || ' '}</span>
                              </div>
                            );
                          }
                          if (chunk.type === 'removed') {
                            return (
                              <div key={idx} className="bg-rose-500/15 text-rose-700 dark:text-rose-300 line-through px-2 py-0.5 rounded flex items-start gap-2">
                                <span className="text-rose-500 font-bold select-none">-</span>
                                <span>{chunk.text || ' '}</span>
                              </div>
                            );
                          }
                          return (
                            <div key={idx} className="text-muted-foreground px-2 py-0.5 flex items-start gap-2">
                              <span className="opacity-30 select-none">&nbsp;</span>
                              <span>{chunk.text || ' '}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto space-y-4">
                      <h1 className="text-2xl font-extrabold text-foreground">{selectedVersion.title}</h1>
                      <div
                        className="vipto-prose text-sm"
                        dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
                <p className="text-xs">Select a version revision from the left list to view snapshot.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
