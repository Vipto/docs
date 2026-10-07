import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Page, Space } from '@/types';
import { movePage } from '@/services/pageService';

interface MovePageModalProps {
  page: Page | null;
  spaces: Space[];
  allPages: Page[];
  isOpen: boolean;
  onClose: () => void;
  onPageMoved: (pageId: string, newSpaceId: string, newParentId: string | null) => void;
}

export const MovePageModal: React.FC<MovePageModalProps> = ({
  page,
  spaces,
  allPages,
  isOpen,
  onClose,
  onPageMoved,
}) => {
  const [targetSpaceId, setTargetSpaceId] = useState<string>(page?.spaceId || spaces[0]?.id || '');
  const [targetParentId, setTargetParentId] = useState<string>(page?.parentId || 'root');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (page) {
      setTargetSpaceId(page.spaceId);
      setTargetParentId(page.parentId || 'root');
    }
  }, [page]);

  if (!page) return null;

  // Pages in selected space, excluding current page and its subtree to avoid circular loops
  const eligibleParentPages = allPages.filter(
    (p) => p.spaceId === targetSpaceId && p.id !== page.id && p.parentId !== page.id
  );

  const handleMove = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalParentId = targetParentId === 'root' ? null : targetParentId;
      await movePage(page.id, finalParentId, targetSpaceId);
      onPageMoved(page.id, targetSpaceId, finalParentId);
      onClose();
    } catch (err) {
      console.error('Move page error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Move "${page.title}"`}
      description="Relocate this page to a different space or nest under another document."
      maxWidth="md"
    >
      <form onSubmit={handleMove} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Destination Space
          </label>
          <select
            value={targetSpaceId}
            onChange={(e) => {
              setTargetSpaceId(e.target.value);
              setTargetParentId('root');
            }}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-1 focus:ring-primary outline-none"
          >
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.key})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Parent Page
          </label>
          <select
            value={targetParentId}
            onChange={(e) => setTargetParentId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="root">Top Level (No parent)</option>
            {eligibleParentPages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Moving...' : 'Move Page'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
