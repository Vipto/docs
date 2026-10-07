import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { useAuth } from '@/hooks/useAuth';
import { createSpace } from '@/services/spaceService';
import { Space } from '@/types';
import { AVAILABLE_SPACE_ICONS, SpaceIcon } from '@/components/common/SpaceIcon';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpaceCreated: (space: Space) => void;
}

export const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({
  isOpen,
  onClose,
  onSpaceCreated,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('folder');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    if (!key || key.length <= 4) {
      // Auto-generate key from name uppercase
      const autoKey = val
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 4)
        .toUpperCase();
      setKey(autoKey);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Space name is required');
      return;
    }
    if (!key.trim()) {
      setError('Space key is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newSpace = await createSpace({
        workspaceId: 'vipto-workspace',
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim(),
        icon,
        ownerId: user?.uid || 'user_1',
        ownerName: user?.name || 'Admin',
        isPrivate,
      });

      onSpaceCreated(newSpace);
      onClose();
      // Reset form
      setName('');
      setKey('');
      setDescription('');
      setIcon('folder');
    } catch (err: any) {
      setError(err.message || 'Failed to create space');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a New Space"
      description="Spaces are organizational homes for team documentation and projects."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Space Icon
          </label>
          <div className="grid grid-cols-5 gap-1.5 p-2 rounded-xl border border-border bg-muted/30 max-h-36 overflow-y-auto">
            {AVAILABLE_SPACE_ICONS.map((item) => {
              const IconCmp = item.icon;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIcon(item.name)}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                    icon === item.name
                      ? 'bg-primary/20 border-2 border-primary text-primary font-bold shadow-2xs'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  title={item.label}
                >
                  <IconCmp className="w-4 h-4" />
                  <span className="text-[9px] truncate w-full text-center">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Space Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Mobile Engineering, Customer Success"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Space Key <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            placeholder="e.g. MOB, CS, ENG"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-mono uppercase focus:ring-1 focus:ring-primary outline-none"
          />
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Used as a unique short identifier in page links and URLs.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What kind of documentation lives in this space?"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isPrivate"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="rounded border-border accent-primary cursor-pointer"
          />
          <label htmlFor="isPrivate" className="text-xs text-foreground font-medium cursor-pointer">
            Private Space (Restricted to selected team members)
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? 'Creating...' : 'Create Space'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
